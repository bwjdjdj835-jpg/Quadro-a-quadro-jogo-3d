import { list, del } from '@vercel/blob';

/* Roda uma vez por dia (veja vercel.json) e apaga de vez tudo o que tem mais de 25 horas.
   A validade máxima de um link é 24 horas, então nada ainda válido é apagado. */
export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'nao_autorizado' });
  }

  const cutoff = Date.now() - 25 * 3600 * 1000;
  let cursor;
  let removed = 0;
  let kept = 0;
  do {
    const r = await list({ prefix: 'shares/', cursor, limit: 1000 });
    const old = r.blobs.filter((b) => new Date(b.uploadedAt).getTime() < cutoff).map((b) => b.url);
    for (let i = 0; i < old.length; i += 100) await del(old.slice(i, i + 100));
    removed += old.length;
    kept += r.blobs.length - old.length;
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);

  return res.status(200).json({ removed, kept });
}
