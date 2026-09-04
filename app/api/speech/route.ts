import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_TEXT_LENGTH = 300;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const maleVoiceId = process.env.ELEVENLABS_MALE_VOICE_ID ?? process.env.ELEVENLABS_VOICE_ID;
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
    return NextResponse.json({ error: 'Speech service is not configured.' }, { status: 503 });
  }

  if (!text || text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Text must contain between 1 and ${MAX_TEXT_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
      }),
    },
  );

  if (!response.ok || !response.body) {
    return NextResponse.json(
      { error: 'Speech could not be generated.' },
      { status: response.status === 429 ? 429 : 502 },
    );
  }

  return new Response(response.body, {
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'audio/mpeg',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
