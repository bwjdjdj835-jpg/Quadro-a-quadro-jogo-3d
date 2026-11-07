import { list } from '@vercel/blob';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function send(res, status, title, inner) {
  res.status(status);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.send(`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<style>
:root{color-scheme:light dark;--bg:#f4f1ec;--ink:#22201d;--muted:#6f6860;--line:#ddd5cb}
@media (prefers-color-scheme:dark){:root{--bg:#171513;--ink:#f1ece6;--muted:#a69d93;--line:#3b3530}}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;padding:16px max(16px,env(safe-area-inset-right)) 40px max(16px,env(safe-area-inset-left))}
main{max-width:900px;margin:0 auto}
h1{font-size:22px;margin:0 0 4px}
.m{color:var(--muted);margin:0 0 16px}
figure{margin:0 0 18px;border-top:1px solid var(--line);padding-top:10px}
figcaption{font:13px/1.4 ui-monospace,Menlo,monospace;color:var(--muted);overflow-wrap:anywhere;margin-bottom:6px}
img{max-width:100%;height:auto;display:block}
pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12.5px/1.5 ui-monospace,Menlo,monospace;border:1px dashed var(--line);padding:10px}
</style>
</head>
<body><main>${inner}</main></body>
</html>`);
}

/* Página do link: HTML pronto no servidor, para uma IA conseguir ler sem rodar JavaScript. */
export default async function handler(req, res) {
  const id = String(req.query.id || '');
  if (!/^[a-f0-9]{16}$/.test(id)) {
    return send(res, 404, 'Link inválido', '<h1>Link inválido</h1><p class="m">Este endereço não existe.</p>');
  }

  let manifest = null;
  try {
    const path = `shares/${id}/manifest.json`;
    const r = await list({ prefix: path, limit: 5 });
    const m = r.blobs.find((b) => b.pathname === path);
    if (m) {
      const f = await fetch(m.url, { cache: 'no-store' });
      if (f.ok) manifest = await f.json();
    }
  } catch {
    manifest = null;
  }

  if (!manifest) {
    return send(res, 404, 'Link não encontrado', '<h1>Link não encontrado</h1><p class="m">Ele nunca existiu ou já foi apagado.</p>');
  }
  if (Date.now() > manifest.expiresAt) {
    return send(res, 410, 'Link expirado', '<h1>Link expirado</h1><p class="m">As imagens deste link já passaram da validade.</p>');
  }

  const left = Math.max(1, Math.round((manifest.expiresAt - Date.now()) / 60000));
  const leftTxt = left >= 120 ? `cerca de ${Math.round(left / 60)} horas` : left >= 60 ? 'cerca de 1 hora' : `${left} minutos`;
  const figs = manifest.items
    .map(
      (i, n) =>
        `<figure><figcaption>${n + 1}. ${esc(i.name)}</figcaption><a href="${esc(i.url)}"><img src="${esc(i.url)}" alt="${esc(
          i.name
        )}" loading="lazy"></a></figure>`
    )
    .join('\n');
  const urls = manifest.items.map((i) => esc(i.url)).join('\n');
  return send(
    res,
    200,
    'Imagens de referência',
    `<h1>Imagens de referência (character design)</h1>
<p class="m">${manifest.items.length} imagens. Link temporário: expira em ${leftTxt}.</p>
${figs}
<h2>Links diretos das imagens</h2>
<pre>${urls}</pre>`
  );
}
