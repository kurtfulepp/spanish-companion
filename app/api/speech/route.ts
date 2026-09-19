import { isCrossOriginRequest, readBoundedText } from '@/lib/server/request-body';
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
    characters.length !== ends.length ||
    starts.some((start, index) => start < 0 || ends[index] < start ||
      (index > 0 && start < starts[index - 1]))
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
  if (isCrossOriginRequest(request))
    return NextResponse.json({ error: 'Open speech playback in the app.' }, { status: 403 });
  try {
    return await generateSpeech(request);
  } catch {
    return NextResponse.json({ error: 'Speech is temporarily unavailable. Try again.' }, { status: 503 });
  }
}

async function generateSpeech(request: Request) {
  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getUser();

  if (authError || !data.user) {
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
    const raw = await readBoundedText(request, 4096);
    if (raw === null)
      return NextResponse.json({ error: 'The request is too large.' }, { status: 413 });
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    body = parsed as { text?: unknown; voice?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (body.voice !== undefined && body.voice !== 'female' && body.voice !== 'male')
    return NextResponse.json({ error: 'Choose a valid voice.' }, { status: 400 });
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

  if (withinQuota !== true) {
    return NextResponse.json(
      { error: 'Speech limit reached. Please try again later.' },
      { status: 429 },
    );
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: 'POST',
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(30_000)]),
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

  if (!speech || typeof speech !== 'object' || Array.isArray(speech))
    return NextResponse.json({ error: 'Speech could not be generated.' }, { status: 502 });
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
