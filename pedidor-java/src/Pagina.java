/** Tela do painel. Fica dentro do Java: não há arquivo index.html separado. */
final class Pagina {

    static final String HTML = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pedidor x Produtor</title>
<style>
:root{--verde:#2d6a4f;--verde-escuro:#1b3a2c;--ambar:#c98a1b;--fundo:#f3f1ea;--cartao:#ffffff;--texto:#1f2a24;--suave:#6b7a70;--borda:#e2e0d6}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:linear-gradient(180deg,#e9efe4 0%,var(--fundo) 260px);color:var(--texto);min-height:100vh}
header{background:linear-gradient(135deg,var(--verde-escuro),var(--verde));color:#fff;padding:22px 28px 18px;box-shadow:0 2px 10px #0003}
header h1{margin:0;font-size:22px;font-weight:700;letter-spacing:.2px}
header p{margin:4px 0 0;opacity:.85;font-size:14px}
.wrap{max-width:1180px;margin:0 auto;padding:20px 20px 40px}
.topo{display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;background:var(--cartao);border:1px solid var(--borda);border-radius:14px;padding:14px 18px;margin-bottom:18px}
.passos{display:flex;gap:8px;align-items:center}
.passo{padding:7px 14px;border-radius:999px;font-size:14px;font-weight:600;background:#eee;color:var(--suave);transition:all .2s}
.passo.on.p{background:var(--ambar);color:#fff}
.passo.on.r{background:var(--verde);color:#fff}
.passo.feito{background:#dfe9e1;color:var(--verde)}
.seta{color:var(--suave)}
.progresso{flex:1;min-width:220px;max-width:420px}
.progresso .rot{display:flex;justify-content:space-between;font-size:13px;color:var(--suave);margin-bottom:6px}
.barra{height:10px;background:#e6e4da;border-radius:999px;overflow:hidden}
.barra div{height:100%;background:linear-gradient(90deg,var(--ambar),var(--verde));border-radius:999px;transition:width .4s}
.status{font-size:13px;font-weight:600;padding:6px 12px;border-radius:999px;background:#f1efe6;color:var(--texto)}
.status.fim{background:#dfe9e1;color:var(--verde)}
.grade{display:grid;grid-template-columns:1fr 1fr;gap:18px}
@media(max-width:860px){.grade{grid-template-columns:1fr}}
.cartao{background:var(--cartao);border:1px solid var(--borda);border-radius:16px;padding:18px;box-shadow:0 1px 3px #0001;position:relative;overflow:hidden}
.cartao::before{content:"";position:absolute;left:0;top:0;right:0;height:4px}
.cartao.p::before{background:var(--ambar)}
.cartao.r::before{background:var(--verde)}
.cartao.inativo{opacity:.55}
.cartao h2{margin:2px 0 2px;font-size:18px}
.cartao .dica{margin:0 0 12px;font-size:13px;color:var(--suave)}
label.rot{display:block;font-size:12px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--suave);margin:12px 0 6px}
textarea,input[type=text],input[type=number]{width:100%;border:1px solid var(--borda);border-radius:10px;padding:10px 12px;font:14px/1.45 system-ui,sans-serif;background:#fcfcfa;color:var(--texto);outline:none;transition:border .15s}
textarea:focus,input:focus{border-color:var(--verde);background:#fff}
textarea.prompt{font:12.5px/1.5 ui-monospace,Menlo,Consolas,monospace;height:190px;background:#f7f7f2;color:#333;resize:vertical}
textarea.resposta{height:120px;resize:vertical}
.acoes{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
button{font:600 14px system-ui,sans-serif;border:0;border-radius:10px;padding:10px 16px;cursor:pointer;transition:transform .05s,opacity .15s,background .15s}
button:active{transform:scale(.98)}
button:disabled{opacity:.45;cursor:not-allowed}
.b-p{background:var(--ambar);color:#fff}
.b-r{background:var(--verde);color:#fff}
.b-sec{background:#ecebe3;color:var(--texto)}
.b-perigo{background:#f6e3e0;color:#9b2c1f}
.hist{grid-column:1/-1;background:var(--cartao);border:1px solid var(--borda);border-radius:16px;padding:18px;box-shadow:0 1px 3px #0001}
.hist h2{margin:0 0 12px;font-size:18px}
.msg{max-width:82%;padding:12px 14px;border-radius:14px;margin:10px 0;white-space:pre-wrap;font-size:14px;line-height:1.5;border:1px solid transparent}
.msg.pedidor{background:#fdf5e6;border-color:#f0dcae;margin-right:auto;border-bottom-left-radius:4px}
.msg.produtor{background:#eaf3ee;border-color:#c9e0d2;margin-left:auto;border-bottom-right-radius:4px}
.msg .cab{font-size:12px;font-weight:700;margin-bottom:6px;display:flex;justify-content:space-between;gap:12px}
.msg.pedidor .cab{color:#8a5d0b}
.msg.produtor .cab{color:var(--verde)}
.vazio{color:var(--suave);font-size:14px;padding:18px 0;text-align:center}
details.cfg{grid-column:1/-1;background:var(--cartao);border:1px solid var(--borda);border-radius:16px;padding:14px 18px}
details.cfg summary{cursor:pointer;font-weight:700;font-size:15px}
.cfg-grade{display:grid;grid-template-columns:2fr 1fr;gap:16px}
@media(max-width:700px){.cfg-grade{grid-template-columns:1fr}}
.rodape{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:18px}
#aviso{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(120px);background:#1f2a24;color:#fff;padding:12px 18px;border-radius:12px;font-size:14px;box-shadow:0 6px 20px #0004;transition:transform .3s;max-width:90vw}
#aviso.on{transform:translateX(-50%) translateY(0)}
</style>
</head>
<body>
<header>
  <h1>Pedidor x Produtor</h1>
  <p>Livro técnico em loop: o pedidor pede, o produtor entrega, até sair PERFEITO.</p>
</header>

<div class="wrap">
  <div class="topo">
    <div class="passos">
      <span id="pp" class="passo p">1 · Pedidor</span>
      <span class="seta">→</span>
      <span id="pr" class="passo r">2 · Produtor</span>
    </div>
    <div class="progresso">
      <div class="rot"><span id="rotulo">Rodada 1 de 5</span><span id="pct">0%</span></div>
      <div class="barra"><div id="barra" style="width:0%"></div></div>
    </div>
    <span id="status" class="status">carregando...</span>
  </div>

  <div class="grade">
    <section id="cP" class="cartao p">
      <h2>Pedidor</h2>
      <p class="dica">Copie o prompt para o seu Claude ou ChatGPT e cole a resposta aqui.</p>
      <label class="rot">Prompt</label>
      <textarea id="promptP" class="prompt" readonly></textarea>
      <div class="acoes"><button id="copiarP" class="b-sec">Copiar prompt</button></div>
      <label class="rot">Resposta do pedidor</label>
      <textarea id="respP" class="resposta" placeholder="Cole aqui o pedido gerado"></textarea>
      <div class="acoes"><button id="enviarP" class="b-p">Registrar pedido</button></div>
    </section>

    <section id="cR" class="cartao r">
      <h2>Produtor</h2>
      <p class="dica">Libera depois que o pedidor registrar um pedido.</p>
      <label class="rot">Prompt</label>
      <textarea id="promptR" class="prompt" readonly></textarea>
      <div class="acoes"><button id="copiarR" class="b-sec">Copiar prompt</button></div>
      <label class="rot">Entrega do produtor</label>
      <textarea id="respR" class="resposta" placeholder="Cole aqui a seção entregue"></textarea>
      <div class="acoes"><button id="enviarR" class="b-r">Registrar entrega</button></div>
    </section>

    <section class="hist">
      <h2>Histórico</h2>
      <div id="historico"></div>
    </section>

    <details class="cfg">
      <summary>Configurações do livro</summary>
      <div class="cfg-grade" style="margin-top:12px">
        <div>
          <label class="rot" for="tema">Tema do livro</label>
          <input id="tema" type="text">
          <label class="rot" for="criterios">Critérios de "perfeito" (um por linha)</label>
          <textarea id="criterios" style="height:120px"></textarea>
        </div>
        <div>
          <label class="rot" for="max">Máximo de rodadas</label>
          <input id="max" type="number" min="1" value="5">
          <div class="acoes"><button id="salvarCfg" class="b-sec">Salvar configurações</button></div>
        </div>
      </div>
    </details>
  </div>

  <div class="rodape">
    <button id="exportar" class="b-sec">Exportar .md</button>
    <button id="zerar" class="b-perigo">Zerar histórico</button>
  </div>
</div>

<div id="aviso"></div>

<script>
var E = null;
var timerAviso = null;

function $(id) { return document.getElementById(id); }

function avisar(msg) {
  var a = $('aviso');
  a.textContent = msg;
  a.classList.add('on');
  clearTimeout(timerAviso);
  timerAviso = setTimeout(function () { a.classList.remove('on'); }, 3200);
}

function render() {
  if (!E) return;
  $('promptP').value = E.promptPedidor;
  $('promptR').value = E.promptProdutor;
  $('enviarP').disabled = !E.podePedir;
  $('respP').disabled = !E.podePedir;
  $('copiarP').disabled = false;
  $('enviarR').disabled = !E.podeEntregar;
  $('respR').disabled = !E.podeEntregar;
  $('cP').classList.toggle('inativo', !E.podePedir && !E.concluido);
  $('cR').classList.toggle('inativo', !E.podeEntregar && !E.concluido);

  var pOn = E.turno === 'pedidor' && !E.concluido;
  var rOn = E.turno === 'produtor' && !E.concluido;
  $('pp').className = 'passo p' + (pOn ? ' on' : (E.rodada > 1 || E.turno === 'produtor' ? ' feito' : ''));
  $('pr').className = 'passo r' + (rOn ? ' on' : '');

  var rodadaMostrada = Math.min(E.rodada, E.max);
  $('rotulo').textContent = 'Rodada ' + rodadaMostrada + ' de ' + E.max;
  var feitas = Math.min(E.rodada - 1, E.max);
  var pct = Math.round((feitas / E.max) * 100);
  if (E.concluido && E.rodada > E.max) pct = 100;
  $('pct').textContent = pct + '%';
  $('barra').style.width = pct + '%';

  var st = $('status');
  if (E.concluido && E.rodada > E.max) { st.textContent = 'Limite de rodadas atingido'; st.className = 'status fim'; }
  else if (E.concluido) { st.textContent = 'Concluído: PERFEITO'; st.className = 'status fim'; }
  else { st.textContent = 'Vez do ' + (E.turno === 'pedidor' ? 'pedidor' : 'produtor'); st.className = 'status'; }

  var h = $('historico');
  h.textContent = '';
  if (!E.historico.length) {
    var v = document.createElement('div');
    v.className = 'vazio';
    v.textContent = 'Nada registrado ainda. Comece copiando o prompt do pedidor.';
    h.appendChild(v);
  }
  E.historico.forEach(function (m) {
    var d = document.createElement('div');
    d.className = 'msg ' + m.quem;
    var cab = document.createElement('div');
    cab.className = 'cab';
    var nome = document.createElement('span');
    nome.textContent = m.quem === 'pedidor' ? 'Pedidor' : 'Produtor';
    var r = document.createElement('span');
    r.textContent = 'rodada ' + m.rodada;
    cab.appendChild(nome);
    cab.appendChild(r);
    var corpo = document.createElement('div');
    corpo.textContent = m.texto;
    d.appendChild(cab);
    d.appendChild(corpo);
    h.appendChild(d);
  });
}

function preencherCfg() {
  $('tema').value = E.tema;
  $('criterios').value = E.criterios;
  $('max').value = E.max;
}

async function carregar() {
  var r = await fetch('/api/estado');
  E = await r.json();
  preencherCfg();
  render();
}

async function enviar(url, dados) {
  var r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(dados)
  });
  var j = await r.json();
  E = j;
  render();
  if (j.erro) avisar(j.erro);
  return j;
}

function copiar(id, btn) {
  var txt = $(id).value;
  var ok = function () {
    var antes = btn.textContent;
    btn.textContent = 'Copiado ✓';
    setTimeout(function () { btn.textContent = antes; }, 1600);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(txt).then(ok, function () { fallback(); });
  } else {
    fallback();
  }
  function fallback() {
    var t = $(id);
    t.disabled = false;
    t.select();
    try { document.execCommand('copy'); ok(); } catch (e) { avisar('Não consegui copiar. Selecione o texto e copie.'); }
  }
}

$('copiarP').onclick = function () { copiar('promptP', this); };
$('copiarR').onclick = function () { copiar('promptR', this); };

$('enviarP').onclick = async function () {
  var t = $('respP').value;
  var j = await enviar('/api/pedido', { texto: t });
  if (!j.erro) $('respP').value = '';
};

$('enviarR').onclick = async function () {
  var t = $('respR').value;
  var j = await enviar('/api/entrega', { texto: t });
  if (!j.erro) $('respR').value = '';
};

$('salvarCfg').onclick = async function () {
  await enviar('/api/config', {
    tema: $('tema').value,
    criterios: $('criterios').value,
    max: $('max').value
  });
  preencherCfg();
  avisar('Configurações salvas.');
};

$('zerar').onclick = async function () {
  if (!confirm('Apagar o histórico e recomeçar na rodada 1?')) return;
  await enviar('/api/zerar', {});
  avisar('Histórico zerado.');
};

$('exportar').onclick = function () { window.location = '/api/exportar'; };

carregar();
</script>
</body>
</html>
""";

    private Pagina() {}
}
