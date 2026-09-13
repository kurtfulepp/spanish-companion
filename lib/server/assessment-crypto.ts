// Node crypto is supported by this project's Cloudflare nodejs_compat runtime.
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

function key(secret: string) {
  if (secret.length < 32)
    throw new Error('Assessment signing is not configured.');
  return createHash('sha256').update(secret).digest();
}
export function signEvidence(payload: string, secret: string) {
  return createHmac('sha256', key(secret))
    .update(`vocabulary-evidence-v1:${payload}`)
    .digest('hex');
}
export function verifyEvidence(
  payload: string,
  signature: string,
  secret: string,
) {
  if (!/^[a-f0-9]{64}$/.test(signature)) return false;
  return timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(signEvidence(payload, secret), 'hex'),
  );
}
export function sealChallenge(value: unknown, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(secret), iv);
  cipher.setAAD(Buffer.from('vocabulary-challenge-v1'));
  const body = Buffer.concat([
    cipher.update(JSON.stringify(value), 'utf8'),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url');
}
export function openChallenge(token: string, secret: string): unknown {
  const bytes = Buffer.from(token, 'base64url');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    key(secret),
    bytes.subarray(0, 12),
  );
  decipher.setAAD(Buffer.from('vocabulary-challenge-v1'));
  decipher.setAuthTag(bytes.subarray(12, 28));
  return JSON.parse(
    Buffer.concat([
      decipher.update(bytes.subarray(28)),
      decipher.final(),
    ]).toString('utf8'),
  );
}
export function contentKey(id: string, content: unknown) {
  return `${id}:${createHash('sha256').update(JSON.stringify(content)).digest('hex').slice(0, 24)}`;
}
