import { put } from '@vercel/blob';
import { codeOk } from '../lib/auth.js';

const MAX = 4.4 * 1024 * 1024; /* a Vercel recusa corpos acima de 4,5 MB */

async function readBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX) throw new Error('grande');
    chunks.push(c);
  }
  return Buffer.concat(chunks);
}

/* Recebe UMA foto JPG por chamada e guarda em shares/<link>/<nome>. */
export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') return res.status(405).json({ error: 'metodo' });
  if (!process.env.UPLOAD_CODE) return res.status(503).json({ error: 'sem_codigo' });
  if (!codeOk(req)) return res.status(401).json({ error: 'codigo' });

  const share = String(req.query.share || '');
  const name = String(req.query.name || '');
  if (!/^[a-f0-9]{16}$/.test(share) || !/^[a-z0-9][a-z0-9._-]{0,150}\.jpg$/i.test(name)) {
    return res.status(400).json({ error: 'nome' });
  }

  let buf;
  try {
    buf = await readBody(req);
  } catch {
    return res.status(413).json({ error: 'grande' });
  }
  if (!buf || buf.length < 4 || buf.length > MAX) return res.status(413).json({ error: 'grande' });
  if (!(buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)) return res.status(415).json({ error: 'tipo' });

  const blob = await put(`shares/${share}/${name}`, buf, {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'image/jpeg',
    cacheControlMaxAge: 3600,
  });
  return res.status(200).json({ url: blob.url });
}
