import { createHash, timingSafeEqual } from 'node:crypto';

/* Confere o código de envio (variável UPLOAD_CODE) sem vazar nada por tempo de resposta. */
export function codeOk(req) {
  const given = String(req.headers['x-upload-code'] || '');
  const real = process.env.UPLOAD_CODE || '';
  if (!real || !given) return false;
  const a = createHash('sha256').update(given).digest();
  const b = createHash('sha256').update(real).digest();
  return timingSafeEqual(a, b);
}
