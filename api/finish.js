import { put } from '@vercel/blob';
import { codeOk } from '../lib/auth.js';

const HOURS = [1, 6, 24];
const MAX_ITEMS = 200;

/* Fecha o link: grava a lista das fotos enviadas e a hora em que ele expira. */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'metodo' });
  if (!process.env.UPLOAD_CODE) return res.status(503).json({ error: 'sem_codigo' });
  if (!codeOk(req)) return res.status(401).json({ error: 'codigo' });

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  const { share, hours, items } = body || {};
  if (!/^[a-f0-9]{16}$/.test(String(share || '')) || !HOURS.includes(Number(hours)) || !Array.isArray(items)) {
    return res.status(400).json({ error: 'dados' });
  }

  const okUrl = (u) => {
    try {
      const x = new URL(u);
      return (
        x.protocol === 'https:' &&
        x.hostname.endsWith('.public.blob.vercel-storage.com') &&
        x.pathname.startsWith(`/shares/${share}/`)
      );
    } catch {
      return false;
    }
  };
  const clean = items
    .slice(0, MAX_ITEMS)
    .filter((i) => i && typeof i.name === 'string' && okUrl(i.url))
    .map((i) => ({ name: i.name.slice(0, 160), url: i.url }));
  if (!clean.length) return res.status(400).json({ error: 'vazio' });

  const now = Date.now();
  const manifest = { id: share, createdAt: now, expiresAt: now + Number(hours) * 3600 * 1000, items: clean };
  await put(`shares/${share}/manifest.json`, JSON.stringify(manifest), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
  return res.status(200).json({ ok: true, expiresAt: manifest.expiresAt, count: clean.length });
}
