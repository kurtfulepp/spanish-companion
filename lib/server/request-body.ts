/** Bound bytes while reading, including requests without Content-Length. */
export async function readBoundedText(request: Request, maxBytes: number): Promise<string | null> {
  if (Number(request.headers.get('content-length')) > maxBytes) {
    await request.body?.cancel();
    return null;
  }
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

export function isCrossOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  return request.headers.get('sec-fetch-site') === 'cross-site' ||
    Boolean(origin && origin !== new URL(request.url).origin);
}
