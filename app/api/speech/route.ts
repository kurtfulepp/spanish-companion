import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_TEXT_LENGTH = 300;

type ElevenLabsAlignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

type ElevenLabsSpeechResponse = {
  audio_base64?: unknown;
  alignment?: unknown;
};

function parseAlignment(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<ElevenLabsAlignment>;
  const characters = candidate.characters;
  const starts = candidate.character_start_times_seconds;
  const ends = candidate.character_end_times_seconds;
  if (
    !Array.isArray(characters) ||
    !characters.every((entry) => typeof entry === 'string') ||
    !Array.isArray(starts) ||
    !starts.every(
      (entry) => typeof entry === 'number' && Number.isFinite(entry),
    ) ||
    !Array.isArray(ends) ||
    !ends.every(
      (entry) => typeof entry === 'number' && Number.isFinite(entry),
    ) ||
    characters.length !== starts.length ||
    characters.length !== ends.length
  ) {
    return null;
  }
  return {
    characters,
    characterStartTimesSeconds: starts,
    characterEndTimesSeconds: ends,
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 },
    );
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const maleVoiceId =
    process.env.ELEVENLABS_MALE_VOICE_ID ?? process.env.ELEVENLABS_VOICE_ID;
  const femaleVoiceId = process.env.ELEVENLABS_FEMALE_VOICE_ID;

  let body: { text?: unknown; voice?: unknown };
  try {
    body = (await request.json()) as { text?: unknown; voice?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const voice = body.voice === 'female' ? 'female' : 'male';
  const voiceId = voice === 'female' ? femaleVoiceId : maleVoiceId;

  if (!apiKey || !voiceId) {
    return NextResponse.json(
      { error: 'Speech service is not configured.' },
      { status: 503 },
    );
  }

  if (!text || text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      {
        error: `Text must contain between 1 and ${MAX_TEXT_LENGTH} characters.`,
      },
      { status: 400 },
    );
  }

  const { data: withinQuota, error: quotaError } = await supabase.rpc(
    'consume_speech_quota',
    { p_character_count: text.length },
  );

  if (quotaError) {
    return NextResponse.json(
      { error: 'Speech service is temporarily unavailable.' },
      { status: 503 },
    );
  }

  if (!withinQuota) {
    return NextResponse.json(
      { error: 'Speech limit reached. Please try again later.' },
      { status: 429 },
    );
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
      }),
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Speech could not be generated.' },
      { status: response.status === 429 ? 429 : 502 },
    );
  }

  let speech: ElevenLabsSpeechResponse;
  try {
    speech = (await response.json()) as ElevenLabsSpeechResponse;
  } catch {
    return NextResponse.json(
      { error: 'Speech could not be generated.' },
      { status: 502 },
    );
  }

  const alignment = parseAlignment(speech.alignment);
  if (typeof speech.audio_base64 !== 'string' || !speech.audio_base64) {
    return NextResponse.json(
      { error: 'Speech could not be generated.' },
      { status: 502 },
    );
  }

  return NextResponse.json(
    {
      audioBase64: speech.audio_base64,
      alignment,
    },
    {
      headers: {
        'Cache-Control': 'private, max-age=3600',
      },
    },
  );
}
