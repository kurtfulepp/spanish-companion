import {
  MAX_RECORDING_BYTES,
  recordingExtension,
} from '@/lib/conversation-audio';
import type { ConversationCatalog } from '@/lib/conversation';

type Dependencies = {
  apiKey?: string;
  authenticate: () => Promise<string | null>;
  getCatalog: (
    userId: string,
  ) => Promise<Omit<ConversationCatalog, 'available'> | null>;
  consumeQuota: () => Promise<boolean>;
  fetcher?: typeof fetch;
};
class TranscriptionError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

// Bound the stream before multipart parsing, including requests without Content-Length.
async function readForm(request: Request) {
  const limit = MAX_RECORDING_BYTES + 16_384;
  if (Number(request.headers.get('content-length')) > limit)
    throw new TranscriptionError(
      413,
      'That recording is too large. Record a shorter reply.',
    );
  const reader = request.body?.getReader();
  if (!reader) throw new TranscriptionError(400, 'Record a reply first.');
  let length = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) {
        await reader.cancel();
        throw new TranscriptionError(
          413,
          'That recording is too large. Record a shorter reply.',
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    return await new Response(bytes, {
      headers: { 'Content-Type': request.headers.get('content-type') ?? '' },
    }).formData();
  } catch {
    throw new TranscriptionError(
      400,
      'The recording could not be read. Record it again.',
    );
  }
}

export async function transcribeConversationRequest(
  request: Request,
  deps: Dependencies,
) {
  try {
    const origin = request.headers.get('origin');
    if (
      request.headers.get('sec-fetch-site') === 'cross-site' ||
      (origin && origin !== new URL(request.url).origin)
    )
      throw new TranscriptionError(403, 'Open Conversation in the app.');
    const userId = await deps.authenticate();
    if (!userId)
      throw new TranscriptionError(401, 'Sign in to record a conversation.');
    const form = await readForm(request);
    const file = form.get('audio');
    if (!(file instanceof Blob) || file.size < 100)
      throw new TranscriptionError(
        400,
        'No recording was captured. Speak for a moment and try again.',
      );
    const extension = recordingExtension(file.type);
    if (!extension)
      throw new TranscriptionError(
        415,
        'This recording format is unsupported. Try a different browser.',
      );
    if (file.size > MAX_RECORDING_BYTES)
      throw new TranscriptionError(
        413,
        'That recording is too large. Record a shorter reply.',
      );
    const catalog = await deps.getCatalog(userId);
    if (!catalog || form.get('level') !== catalog.level)
      throw new TranscriptionError(
        409,
        'Your level changed. Return to topics to start at your current level.',
      );
    const scenario = catalog.topics
      .find((t) => t.id === form.get('topicId'))
      ?.scenarios.find((s) => s.id === form.get('scenarioId'));
    if (!scenario?.expressions.length)
      throw new TranscriptionError(
        403,
        'Practice this topic moment before recording its conversation.',
      );
    if (!deps.apiKey?.trim())
      throw new TranscriptionError(
        503,
        'Speech recognition is not configured yet. You can still type your reply.',
      );
    let allowed: boolean;
    try {
      allowed = await deps.consumeQuota();
    } catch {
      throw new TranscriptionError(
        503,
        'Speech recognition is temporarily unavailable. Try again.',
      );
    }
    if (!allowed)
      throw new TranscriptionError(
        429,
        'Your practice usage limit has been reached. Try again later.',
      );
    const upload = new FormData();
    // Use our own filename; no name, profile, vocabulary suggestions, or transcript bias is sent.
    upload.set('file', file, `reply.${extension}`);
    upload.set('model', 'gpt-4o-mini-transcribe');
    upload.set('language', 'es');
    upload.set('response_format', 'json');
    upload.set(
      'prompt',
      'Transcribe el habla tal como se oye, conservando errores gramaticales, variantes regionales y palabras en otros idiomas. No corrijas, no traduzcas ni completes lo que no se ha dicho.',
    );
    let response: Response;
    try {
      response = await (deps.fetcher ?? fetch)(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${deps.apiKey}` },
          body: upload,
          signal: AbortSignal.any([
            request.signal,
            AbortSignal.timeout(30_000),
          ]),
        },
      );
    } catch {
      throw new TranscriptionError(
        504,
        'Transcription did not arrive. Retry this recording or record again.',
      );
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new TranscriptionError(
        response.status === 429 ? 429 : 502,
        response.status === 429
          ? 'Speech recognition is temporarily limited. Try again later.'
          : 'The recording could not be transcribed. Retry or record again.',
      );
    }
    const result: unknown = await response.json();
    if (
      !result ||
      typeof result !== 'object' ||
      !('text' in result) ||
      typeof result.text !== 'string' ||
      !/[\p{L}\p{N}]/u.test(result.text)
    )
      throw new TranscriptionError(
        422,
        'No clear speech was found. Move closer to the microphone and record again.',
      );
    if (result.text.length > 3000)
      throw new TranscriptionError(
        422,
        'That reply is too long. Please record a shorter response.',
      );
    return json({ text: result.text.trim() });
  } catch (error) {
    return json(
      {
        error:
          error instanceof TranscriptionError
            ? error.message
            : 'Speech recognition is temporarily unavailable. Retry or record again.',
      },
      error instanceof TranscriptionError ? error.status : 503,
    );
  }
}
