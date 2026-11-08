/* Motor Reverso: engenharia reversa de character design em JavaScript puro, sem API e sem bibliotecas.
   1) MEDE cada referência (silhueta, proporções, formas, valores, cor, ponto focal, contorno, acabamento);
   2) APRENDE: soma as medidas no "perfil de estilo" da obra (fica salvo e melhora a cada análise);
   3) GERA as 6 etapas (leitura, decomposição, princípios, 3 conceitos, revisão, prompt final) a partir das medidas e do pedido.
   Limite honesto: o motor mede formas e cores; ele não reconhece objetos, rostos ou roupas como uma IA treinada. */
(() => {
const MW = 160; // largura de análise

/* ---------- utilidades ---------- */
function hsl(r, g, b){ r/=255; g/=255; b/=255; const mx=Math.max(r,g,b), mn=Math.min(r,g,b), l=(mx+mn)/2; let h=0, s=0;
  if(mx!==mn){ const d=mx-mn; s = l>.5 ? d/(2-mx-mn) : d/(mx+mn); h = mx===r ? (g-b)/d+(g<b?6:0) : mx===g ? (b-r)/d+2 : (r-g)/d+4; h*=60; } return [h, s, l]; }
const hexOf = (r, g, b) => "#" + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, "0")).join("");
function corNome(r, g, b, en){
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b), cr=mx-mn, l=(mx+mn)/510, h=hsl(r,g,b)[0];
  const T = en ? { preto:"black", branco:"white", cze:"dark gray", czc:"light gray", cz:"gray", bege:"beige", marrom:"brown", pele:"peach", esc:"dark ", cla:"light ", sat:" muted" }
               : { preto:"preto", branco:"branco", cze:"cinza-escuro", czc:"cinza-claro", cz:"cinza", bege:"bege", marrom:"marrom", pele:"pêssego", esc:" escuro", cla:" claro", sat:" acinzentado" };
  if(cr < 18) return l < .15 ? T.preto : l > .88 ? T.branco : l < .4 ? T.cze : l > .7 ? T.czc : T.cz;
  if(cr < 50 && l > .7 && (h < 70 || h > 330)) return T.bege;
  const P = en ? [[15,"red"],[40,"orange"],[52,"golden yellow"],[70,"yellow"],[160,"green"],[190,"teal"],[210,"sky blue"],[250,"blue"],[285,"purple"],[330,"magenta"],[360,"red"]]
               : [[15,"vermelho"],[40,"laranja"],[52,"amarelo-ouro"],[70,"amarelo"],[160,"verde"],[190,"verde-água"],[210,"azul-céu"],[250,"azul"],[285,"roxo"],[330,"magenta"],[360,"vermelho"]];
  let n = P.find(x => h < x[0])[1];
  if((h < 52) && l < .45) n = T.marrom; else if(h >= 15 && h < 40 && l > .55 && cr < 110) n = T.pele;
  if(en) return (l < .28 ? T.esc : l > .75 ? T.cla : "") + n + (cr < 45 ? T.sat : "");
  return n + (l < .28 ? T.esc : l > .75 ? T.cla : "") + (cr < 45 ? T.sat : "");
}
function rng(seedStr){ let h = 2166136261; for(const c of seedStr) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; }
const pick = (r, a) => a[Math.floor(r() * a.length)];
const pct = x => Math.round(x * 100);
const media = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;

/* ---------- 1) medir uma referência ---------- */
async function medir(blob){
  const bmp = await createImageBitmap(blob), W = MW, H = Math.max(8, Math.round(W * bmp.height / bmp.width));
  const c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d", { willReadFrequently:true });
  x.drawImage(bmp, 0, 0, W, H); bmp.close && bmp.close();
  const d = x.getImageData(0, 0, W, H).data, N = W*H, L = new Float32Array(N);
  for(let j=0; j<N; j++) L[j] = (.299*d[j*4] + .587*d[j*4+1] + .114*d[j*4+2]) / 255;
  // fundo = mediana das bordas
  const bR=[], bG=[], bB=[];
  for(let j=0; j<N; j++){ const y=(j/W)|0, q=j%W; if(y<2||y>=H-2||q<2||q>=W-2){ bR.push(d[j*4]); bG.push(d[j*4+1]); bB.push(d[j*4+2]); } }
  const med = a => a.sort((p, q) => p-q)[a.length >> 1], fb = [med(bR), med(bG), med(bB)];
  const M = new Uint8Array(N); let nf = 0;
  for(let j=0; j<N; j++){ if(Math.abs(d[j*4]-fb[0]) + Math.abs(d[j*4+1]-fb[1]) + Math.abs(d[j*4+2]-fb[2]) > 60){ M[j] = 1; nf++; } }
  const fundoLiso = nf < N*.85 && nf > N*.03;
  if(!fundoLiso) M.fill(1);
  // componentes conectados: figura principal = a mais alta
  const lab = new Int32Array(N).fill(-1), comps = [];
  for(let j=0; j<N; j++){ if(!M[j] || lab[j] >= 0) continue;
    const id = comps.length, st = [j]; lab[j] = id; let area = 0, x0 = W, x1 = 0, y0 = H, y1 = 0;
    while(st.length){ const k = st.pop(), y = (k/W)|0, q = k%W; area++; if(q<x0)x0=q; if(q>x1)x1=q; if(y<y0)y0=y; if(y>y1)y1=y;
      for(const n of [k-1, k+1, k-W, k+W]){ if(n<0||n>=N) continue; if((n===k-1&&q===0)||(n===k+1&&q===W-1)) continue; if(M[n] && lab[n]<0){ lab[n]=id; st.push(n); } } }
    comps.push({ id, area, x0, x1, y0, y1 }); }
  const grandes = comps.filter(o => o.area > N*.01);
  const fig = grandes.sort((a, b) => (b.y1-b.y0) - (a.y1-a.y0) || b.area - a.area)[0] || { id:-1, area:N, x0:0, x1:W-1, y0:0, y1:H-1 };
  const inFig = j => fig.id < 0 ? true : lab[j] === fig.id;
  const fw = fig.x1-fig.x0+1, fh = fig.y1-fig.y0+1;
  // perfil de largura por linha -> cabeça (pescoço) e distribuição de massa
  const larg = new Array(fh).fill(0);
  for(let y=fig.y0; y<=fig.y1; y++) for(let q=fig.x0; q<=fig.x1; q++) if(inFig(y*W+q)) larg[y-fig.y0]++;
  const maxL = Math.max(1, ...larg), suave = larg.map((_, i) => media(larg.slice(Math.max(0,i-1), i+2)));
  let pescoco = -1; const ini = Math.round(fh*.06), fim = Math.round(fh*.32);
  for(let i=ini+1; i<fim; i++) if(suave[i] < suave[i-1] && suave[i] <= suave[i+1] && suave[i] < .75*Math.max(...suave.slice(i, Math.min(fh, i+Math.round(fh*.12))))){ pescoco = i; break; }
  const cabecas = pescoco > 0 ? Math.max(2, Math.min(10, fh / pescoco)) : null;
  const terco = k => media(larg.slice(Math.floor(fh*k/3), Math.floor(fh*(k+1)/3))) / maxL;
  const massa = [terco(0), terco(1), terco(2)];
  // simetria
  let sim = 0, simN = 0; for(let y=fig.y0; y<=fig.y1; y++) for(let q=0; q<fw/2; q++){ const a = inFig(y*W+fig.x0+q), b = inFig(y*W+fig.x1-q); if(a||b){ simN++; if(a===b) sim++; } }
  // contorno: pontos da borda e ângulos (linguagem de formas)
  const borda = []; for(let y=fig.y0; y<=fig.y1; y++){ let e=-1, dd=-1; for(let q=fig.x0; q<=fig.x1; q++) if(inFig(y*W+q)){ if(e<0) e=q; dd=q; } if(e>=0){ borda.push([e,y]); } }
  const dir = []; for(let y=fig.y1; y>=fig.y0; y--){ let dd=-1; for(let q=fig.x1; q>=fig.x0; q--) if(inFig(y*W+q)){ dd=q; break; } if(dd>=0) dir.push([dd,y]); }
  const cont = borda.concat(dir), passo = Math.max(2, Math.round(cont.length/60)); let agudos = 0, retos = 0, curvos = 0;
  for(let i=passo; i<cont.length-passo; i+=passo){ const a=cont[i-passo], b=cont[i], cc=cont[i+passo];
    const v1=[a[0]-b[0], a[1]-b[1]], v2=[cc[0]-b[0], cc[1]-b[1]], n1=Math.hypot(...v1), n2=Math.hypot(...v2); if(!n1||!n2) continue;
    const ang = Math.acos(Math.max(-1, Math.min(1, (v1[0]*v2[0]+v1[1]*v2[1])/(n1*n2)))) * 180/Math.PI;
    if(ang < 120) agudos++; else if(ang > 168) retos++; else curvos++; }
  const tot = Math.max(1, agudos+retos+curvos);
  // cor, valores, foco e acabamento dentro da figura
  const px = []; let esc=0, medv=0, cla=0, sL=0, sL2=0, sS=0, quente=0, frio=0, sat=0, nF=0, forte=0, plano=0, nI=0, contornoEsc=0, nBordaFig=0;
  const foco = []; for(let y=1; y<H-1; y++) for(let q=1; q<W-1; q++){ const j=y*W+q; if(!inFig(j)) continue;
    const R=d[j*4], G=d[j*4+1], B=d[j*4+2], l=L[j], mx=Math.max(R,G,B), sv = mx ? (mx-Math.min(R,G,B))/mx : 0, h = hsl(R,G,B)[0];
    nF++; sL+=l; sL2+=l*l; sS+=sv; if(l<.33) esc++; else if(l<.66) medv++; else cla++;
    if(sv>.3 && mx>40){ sat++; if(h<75||h>330) quente++; else if(h>165&&h<290) frio++; }
    if(j%2===0) px.push([R,G,B]);
    const g = Math.hypot(L[j+1]-L[j-1], L[j+W]-L[j-W]); nI++; if(g>.25) forte++; else if(g<.02) plano++;
    foco.push([g*.6 + sv*.4, q, y]);
    if(!inFig(j-1)||!inFig(j+1)||!inFig(j-W)||!inFig(j+W)){ nBordaFig++; if(l < .3) contornoEsc++; } }
  foco.sort((a, b) => b[0]-a[0]); const topo = foco.slice(0, Math.max(1, Math.round(foco.length*.04)));
  const fy = (media(topo.map(t => t[2])) - fig.y0) / fh;
  const mL = nF ? sL/nF : .5;
  return { fundoLiso, fundo: fb, areaFig: fig.area/N, proporcaoFig: fh/Math.max(1, fw), cabecas, massa, simetria: simN ? sim/simN : .5,
    agudos: agudos/tot, retos: retos/tot, curvos: curvos/tot, preenchimento: fig.area/(fw*fh), px,
    valores: [esc/Math.max(1,nF), medv/Math.max(1,nF), cla/Math.max(1,nF)], luz: mL, contraste: nF ? Math.sqrt(Math.max(0, sL2/nF - mL*mL)) : 0,
    saturacao: nF ? sS/nF : 0, quente: sat ? quente/sat : 0, frio: sat ? frio/sat : 0, pctSat: nF ? sat/nF : 0,
    bordas: nI ? forte/nI : 0, plano: nI ? plano/nI : 0, contorno: nBordaFig ? contornoEsc/nBordaFig : 0, foco: fy, figuras: grandes.length, larguraImg: bmp.width || W };
}

/* ---------- 2) juntar medidas e aprender o perfil da obra ---------- */
function kmeans(px, K){
  if(!px.length) return [];
  let cent = Array.from({ length:K }, (_, i) => px[Math.floor((i+.5)*px.length/K)].slice());
  for(let it=0; it<12; it++){ const acc = cent.map(() => [0,0,0,0]);
    for(const p of px){ let bi=0, bd=1e9; cent.forEach((c, i) => { const dd=(p[0]-c[0])**2+(p[1]-c[1])**2+(p[2]-c[2])**2; if(dd<bd){ bd=dd; bi=i; } }); const a=acc[bi]; a[0]+=p[0]; a[1]+=p[1]; a[2]+=p[2]; a[3]++; }
    cent = acc.map((a, i) => a[3] ? [a[0]/a[3], a[1]/a[3], a[2]/a[3], a[3]] : [...cent[i].slice(0,3), 0]); }
  return cent.filter(c => c[3]).sort((a, b) => b[3]-a[3]).map(c => ({ rgb:[c[0],c[1],c[2]], pct: c[3]/px.length }));
}
const CAMPOS_NUM = ["areaFig","proporcaoFig","simetria","agudos","retos","curvos","preenchimento","luz","contraste","saturacao","quente","frio","pctSat","bordas","plano","contorno","foco","figuras"];
function juntar(ms){
  const p = { n: ms.length };
  CAMPOS_NUM.forEach(k => p[k] = media(ms.map(m => m[k])));
  const cab = ms.map(m => m.cabecas).filter(Boolean); p.cabecas = cab.length ? media(cab) : null; p.cabecasN = cab.length;
  p.massa = [0,1,2].map(i => media(ms.map(m => m.massa[i])));
  p.valores = [0,1,2].map(i => media(ms.map(m => m.valores[i])));
  p.fundoLiso = ms.filter(m => m.fundoLiso).length / ms.length;
  const fb = [0,1,2].map(i => media(ms.map(m => m.fundo[i]))); p.fundo = fb;
  const allPx = []; ms.forEach(m => { for(let i=0; i<m.px.length; i+=Math.max(1, Math.round(ms.length/20))) allPx.push(m.px[i]); });
  p.paleta = kmeans(allPx, 7).filter(c => c.pct >= .02);
  return p;
}
function aprender(obra, novo){ // média ponderada pelo número de referências: o perfil melhora a cada análise
  const chave = "reverso-motor-perfis", todos = JSON.parse(localStorage.getItem(chave) || "{}"), velho = todos[obra];
  let p = novo;
  if(velho && velho.n){
    const a = velho.n, b = novo.n, w = (x, y) => (x*a + y*b)/(a+b);
    p = { ...novo, n: a+b };
    CAMPOS_NUM.forEach(k => p[k] = w(velho[k], novo[k]));
    p.cabecas = velho.cabecas && novo.cabecas ? (velho.cabecas*velho.cabecasN + novo.cabecas*novo.cabecasN)/(velho.cabecasN+novo.cabecasN) : (novo.cabecas || velho.cabecas);
    p.cabecasN = (velho.cabecasN||0) + (novo.cabecasN||0);
    p.massa = novo.massa.map((x, i) => w(velho.massa[i], x)); p.valores = novo.valores.map((x, i) => w(velho.valores[i], x));
    p.fundoLiso = w(velho.fundoLiso, novo.fundoLiso); p.fundo = novo.fundo.map((x, i) => w(velho.fundo[i], x));
    p.paleta = kmeans([...velho.paleta, ...novo.paleta].flatMap(c => Array(Math.max(1, Math.round(c.pct*50))).fill(c.rgb)), 7).filter(c => c.pct >= .02);
    p.analises = (velho.analises || 1) + 1;
  } else p.analises = 1;
  todos[obra] = p; try{ localStorage.setItem(chave, JSON.stringify(todos)); }catch{}
  return p;
}
function perfis(){ try{ return JSON.parse(localStorage.getItem("reverso-motor-perfis") || "{}"); }catch{ return {}; } }

/* ---------- 3) traduzir medidas em palavras ---------- */
function ler(p){
  const T = {};
  T.alongado = p.proporcaoFig > 3 ? "muito alongada e vertical" : p.proporcaoFig > 2.1 ? "vertical, de corpo inteiro" : p.proporcaoFig > 1.3 ? "pouco mais alta que larga" : "larga e compacta";
  T.cab = p.cabecas ? `cerca de ${p.cabecas.toFixed(1)} cabeças de altura` : "proporção de cabeça não medida (figura cortada ou sem pescoço visível)";
  T.cabTipo = !p.cabecas ? "indefinida" : p.cabecas < 3.5 ? "estilizada tipo chibi/cartoon (cabeça grande)" : p.cabecas < 5.8 ? "estilizada, cabeça um pouco grande" : p.cabecas < 7.6 ? "próxima do realista" : "heroica e alongada";
  const [mt, mm, mb] = p.massa, maxm = Math.max(mt, mm, mb);
  T.massa = maxm === mt ? "massa concentrada em cima (ombros, cabeça, capa ou cabelo volumosos)" : maxm === mb ? "massa concentrada embaixo (pernas, saia, calça larga ou base pesada)" : "massa concentrada no meio do corpo";
  T.triangulo = mt > mb*1.15 ? "triângulo invertido (forte, imponente)" : mb > mt*1.15 ? "triângulo de base larga (estável, pesado)" : "retângulo equilibrado";
  T.espaco = p.preenchimento < .45 ? "muitos espaços negativos (braços afastados, peças soltas, recortes)" : p.preenchimento < .62 ? "espaços negativos moderados" : "silhueta fechada e compacta, poucos vazios";
  T.formas = p.agudos > .3 ? "angulosa: muitas pontas e diagonais (triângulos)" : p.retos > .55 ? "retangular: linhas retas e blocos" : p.curvos > .5 ? "arredondada: curvas e formas orgânicas (círculos)" : "mista: curvas com alguns ângulos";
  T.simetria = p.simetria > .85 ? "quase simétrica (pose frontal, estável)" : p.simetria > .7 ? "assimetria leve" : "assimétrica (pose dinâmica ou figurino desigual)";
  T.foco = p.foco < .22 ? "rosto e cabeça" : p.foco < .45 ? "peito, ombros e mãos" : p.foco < .7 ? "cintura e mãos" : "pernas e pés";
  const [ve, vm, vc] = p.valores;
  T.valores = `${pct(ve)}% escuros, ${pct(vm)}% médios, ${pct(vc)}% claros`;
  T.chave = p.luz > .6 ? "chave alta (clara)" : p.luz < .35 ? "chave baixa (escura)" : "chave média";
  T.contraste = p.contraste > .26 ? "contraste forte" : p.contraste > .17 ? "contraste médio" : "contraste suave";
  T.sep = p.fundoLiso > .5 ? `separada do fundo liso ${corNome(...p.fundo)}` : "sem fundo liso: a figura disputa com o cenário";
  T.sat = p.saturacao > .5 ? "cores saturadas e vivas" : p.saturacao > .25 ? "saturação moderada" : "cores dessaturadas, quase neutras";
  T.temp = p.quente > p.frio + .15 ? "dominância quente" : p.frio > p.quente + .15 ? "dominância fria" : "temperatura equilibrada";
  T.acentos = p.pctSat < .12 ? "poucos acentos de cor forte, usados em pontos pequenos" : p.pctSat < .35 ? "acentos de cor em áreas médias" : "cor forte espalhada por grande parte da figura";
  T.paleta = p.paleta.map(c => `${corNome(...c.rgb)} ${hexOf(...c.rgb)} (~${pct(c.pct)}%)`).join(", ");
  T.linha = p.contorno > .55 ? "contorno escuro marcado em volta da figura (line art)" : p.contorno > .3 ? "contorno presente em parte da figura" : "sem contorno escuro: bordas definidas pela cor";
  T.detalhe = p.bordas > .09 ? "bastante detalhe interno" : p.bordas > .045 ? "detalhe interno moderado" : "pouco detalhe interno, formas limpas";
  T.sombra = p.plano > .55 ? "cor chapada com sombra em blocos (cel-shading)" : p.plano > .35 ? "mistura de áreas chapadas e gradientes" : "sombreamento em gradiente, pintura ou textura";
  T.folha = p.figuras > 2.5 ? "as referências parecem folhas com várias figuras (vistas, expressões, detalhes)" : p.figuras > 1.4 ? "algumas referências têm mais de uma figura" : "em geral uma figura por imagem";
  return T;
}

/* ---------- 4) entender o pedido (texto livre) ---------- */
const PAPEIS = [["protagonista","protagonist"],["antagonista","antagonist"],["vilã","villain"],["vilão","villain"],["rival","rival"],["mentor","mentor"],["mentora","mentor"],["aliado","ally"],["aliada","ally"],["coadjuvante","supporting character"],["anti-herói","anti-hero"]];
const USOS = { jogo:"game", "animação":"animation", animacao:"animation", quadrinho:"comic", hq:"comic", "ilustração":"illustration", ilustracao:"illustration" };
function lerPedido(t){
  const s = " " + (t || "").toLowerCase() + " ", o = {};
  const ob = (t || "").match(/obra\s*[:\-]\s*([^\n,.;]+)/i) || (t || "").match(/universo\s*[:\-]\s*([^\n,.;]+)/i); o.obra = ob ? ob[1].trim() : "";
  const achados = PAPEIS.map(x => [s.indexOf(x[0]), x]).filter(x => x[0] >= 0).sort((a, b) => a[0]-b[0]); // o primeiro papel citado
  o.papel = achados.length ? achados[0][1][0] : ""; o.papelEn = achados.length ? achados[0][1][1] : "";
  o.uso = Object.keys(USOS).find(u => s.includes(u)) || ""; o.usoEn = USOS[o.uso] || "";
  const idade = s.match(/(\d{1,3})\s*anos/); o.idade = idade ? +idade[1] : null;
  o.genero = /\b(ela|mulher|garota|menina|feminina|guerreira|caçadora|cacadora|rainha|princesa|bruxa|dama)\b/.test(s) ? "f" : /\b(ele|homem|garoto|menino|masculino|guerreiro|caçador|cacador|rei|príncipe|principe|bruxo)\b/.test(s) ? "m" : "";
  o.scifi = /futur|ficção|ficcao|sci|robô|robo|cyber|espaço|espaco|alien|nave|tecnolog|nanit|android/.test(s);
  o.fantasia = /magia|mago|bruxa|dragão|dragao|reino|espada|feiti|fantasia|elf|demônio|demonio|deus|semideus/.test(s);
  o.urbano = /cidade|urbano|rua|escola|são paulo|sao paulo|nova york|moderno|2026|atual/.test(s);
  o.sombrio = /sombri|terror|dark|morte|sangue|trág|trag|noir/.test(s);
  o.texto = (t || "").trim();
  // frases do pedido, por assunto
  const frases = o.texto.split(/(?<=[.!?;\n])\s*/).map(f => f.trim().replace(/[.;]+$/, "")).filter(Boolean);
  const tem = (f, re) => re.test(f.toLowerCase());
  o.ideia = (frases.find(f => tem(f, /\b(quero|queria|gostaria|preciso|personagem|ser[áa]|é um|é uma)\b/) && !tem(f, /^(obra|universo)\s*[:\-]/)) || frases.find(f => !tem(f, /^(obra|universo)\s*[:\-]/)) || "")
    .replace(/^(eu\s+)?(quero|queria|gostaria de|preciso de)\s+(criar\s+|fazer\s+)?/i, "").trim();
  const ehObra = f => tem(f, /^(obra|universo)\s*[:\-]/), ehObrig = f => tem(f, /tem que|precisa ter|obrigat|não pode faltar|nao pode faltar|deve ter/);
  o.aparencia = frases.filter(f => !ehObrig(f) && !ehObra(f) && tem(f, /cabelo|olho|pele|roupa|jaqueta|casaco|capa|armadura|manto|vestido|calça|bota|tênis|tenis|uniforme|cicatriz|tatuagem|máscara|mascara|chifre|asa|cauda|bra[çc]o|prótese|protese|alto|alta|baixo|baixa|magr|forte|musculos|barba|óculos|oculos|luva|colar|brinco/)).join(". ");
  o.obrigatorias = frases.filter(f => tem(f, /tem que|precisa ter|obrigat|não pode faltar|nao pode faltar|deve ter/)).map(f => f.replace(/^.*?(tem que ter|tem que|precisa ter|obrigatóri[oa]s?:?|não pode faltar|nao pode faltar|deve ter)\s*/i, "")).join("; ");
  o.poder = (frases.find(f => !ehObra(f) && tem(f, /poder|habilidade|magia|controla|manipula|kore|hari|dna/)) || "");
  o.personalidade = (o.texto.toLowerCase().match(/\b(fri[oa]|irônic[oa]|ironic[oa]|leal|alegre|séri[oa]|seri[oa]|tímid[oa]|timid[oa]|arrogante|corajos[oa]|calm[oa]|explosiv[oa]|sarcástic[oa]|sarcastic[oa]|gentil|cruel|misterios[oa]|engraçad[oa]|engracad[oa]|teimos[oa]|ambicios[oa]|protetor[a]?|curios[oa]|melancólic[oa]|impulsiv[oa]|frio e calculista|calculista|sábi[oa]|sabi[oa]|rebelde|orgulhos[oa]|bondos[oa])\b/g) || []).filter((x, i, a) => a.indexOf(x) === i).join(", ");
  const fCor = frases.filter(f => !ehObra(f) && tem(f, /\bcor(es)?\b|\btons?\b|paleta|quentes?\b|fri[ao]s\b/));
  o.cores = (fCor.length ? fCor : frases.filter(f => !ehObra(f) && tem(f, /vermelh|azul|verde|amarel|roxo|preto|branco|dourad|prata|rosa|laranja|marrom|cinza/))).join(". ");
  o.cenario = frases.filter(f => tem(f, /cidade|mundo|universo|época|epoca|século|seculo|futuro|passado|reino|planeta|escola|academia|nova york|são paulo|sao paulo|20\d\d/) && !tem(f, /^(obra)\s*[:\-]/)).join(". ");
  return o;
}

/* ---------- 5) gerar as 6 etapas ---------- */
const BANCO = {
  silhuetas: [
    { pt:"triângulo invertido: ombros largos e cintura estreita", en:"inverted-triangle silhouette, broad shoulders and narrow waist", forma:"angular" },
    { pt:"base larga e pesada, centro de gravidade baixo", en:"wide heavy base, low center of gravity", forma:"retangular" },
    { pt:"coluna estreita e alta com uma única peça que se projeta para o lado", en:"tall narrow column with one piece projecting to the side", forma:"angular" },
    { pt:"forma de gota: volume arredondado embaixo, topo fino", en:"teardrop shape: rounded volume at the bottom, slim top", forma:"curva" },
    { pt:"silhueta em X: ombros e barra da roupa abertos, cintura marcada", en:"X-shaped silhouette: flared shoulders and hem, cinched waist", forma:"mista" },
    { pt:"bloco retangular compacto com cabeça pequena", en:"compact rectangular block with a small head", forma:"retangular" },
    { pt:"assimétrica: um lado pesado (armadura ou manto), o outro leve", en:"asymmetric: one heavy side (armor or cloak), the other light", forma:"mista" },
    { pt:"curvas em S, postura fluida e uma peça longa (faixa, cauda ou casaco) como linha de ação", en:"S-curve silhouette, fluid posture, one long element (sash, tail or coat) as the line of action", forma:"curva" }
  ],
  materiais: {
    scifi: [{ pt:"tecido técnico fosco, placas leves de polímero, cabos expostos", en:"matte technical fabric, light polymer plates, exposed cables" }, { pt:"traje justo com painéis rígidos e costuras luminosas", en:"fitted suit with rigid panels and glowing seams" }, { pt:"jaqueta acolchoada, metal escovado e borracha", en:"padded jacket, brushed metal and rubber" }],
    fantasia: [{ pt:"couro curtido, linho grosso e metal forjado", en:"tanned leather, coarse linen and forged metal" }, { pt:"mantos em camadas, bordados e ossos entalhados", en:"layered cloaks, embroidery and carved bone" }, { pt:"armadura parcial de bronze com tecido leve", en:"partial bronze armor over light cloth" }],
    urbano: [{ pt:"jaqueta, calça cargo, tênis e acessórios do dia a dia", en:"jacket, cargo pants, sneakers and everyday accessories" }, { pt:"moletom grande, faixas nas mãos e mochila", en:"oversized hoodie, hand wraps and backpack" }, { pt:"casaco longo, camisa social e botas gastas", en:"long coat, dress shirt and worn boots" }],
    neutro: [{ pt:"tecido em camadas com uma peça rígida de destaque", en:"layered fabric with one rigid standout piece" }, { pt:"roupa funcional com bolsos, cintos e amarrações", en:"functional clothing with pockets, belts and straps" }, { pt:"peça única fluida com acessórios metálicos", en:"single flowing garment with metal accessories" }]
  },
  elementos: [
    { pt:"uma luva diferente na mão dominante, que guarda o poder do personagem", en:"a mismatched glove on the dominant hand that holds their power" },
    { pt:"uma cicatriz luminosa que acende quando a emoção sobe", en:"a glowing scar that lights up when emotions rise" },
    { pt:"um objeto pendurado no pescoço que liga o personagem ao passado", en:"an object hanging from the neck that ties the character to their past" },
    { pt:"uma faixa ou lenço longo que vira a linha de ação nas poses", en:"a long scarf or sash that becomes the line of action in poses" },
    { pt:"uma prótese ou peça mecânica que conta uma perda", en:"a prosthetic or mechanical piece that tells of a loss" },
    { pt:"um símbolo pintado à mão na roupa, marca do grupo a que pertence", en:"a hand-painted symbol on the clothing, mark of their group" },
    { pt:"uma arma ou ferramenta grande demais para o corpo", en:"a weapon or tool too big for their body" },
    { pt:"olhos com uma cor que não existe no resto da paleta", en:"eyes in a color that appears nowhere else in the palette" }
  ],
  ideias: [
    { pt:"alguém que esconde o próprio poder para proteger quem ama", en:"someone who hides their own power to protect the people they love" },
    { pt:"alguém que sobreviveu e carrega no corpo as marcas de uma escolha errada", en:"a survivor who carries on their body the marks of a wrong choice" },
    { pt:"alguém que caça a mando de outros e começa a duvidar de quem dá as ordens", en:"a hunter who starts to doubt who gives the orders" },
    { pt:"alguém que recebeu uma herança que não quer", en:"an heir who does not want the inheritance they received" },
    { pt:"alguém de fora que não entende as regras do mundo e quebra todas", en:"an outsider who does not understand the world's rules and breaks them all" },
    { pt:"alguém que guarda um segredo há tempo demais e treina quem vai substituir essa pessoa", en:"a tired guardian training their own replacement" }
  ],
  universos: {
    sufixo: ["ra","on","is","eth","ul","ar","ia","or","yx","en"], prefixo: ["Vel","Kor","Ash","Nyr","Sol","Ther","Cael","Vor","Lum","Zeph","Ori","Mar"],
    premissa: [
      { pt:"um mundo onde a energia vital de cada pessoa tem cor e pode ser roubada", en:"a world where each person's life energy has a color and can be stolen" },
      { pt:"cidades flutuantes que dependem de relíquias de uma civilização desaparecida", en:"floating cities that depend on relics of a vanished civilization" },
      { pt:"uma metrópole onde famílias antigas herdam poderes e controlam os bairros", en:"a metropolis where old families inherit powers and control the districts" },
      { pt:"um planeta em que o céu cai em pedaços e cada pedaço dá um dom diferente", en:"a planet where the sky falls in pieces and each piece grants a different gift" }
    ]
  }
};
function gerar(p, ped, opt){
  const T = ler(p), r = rng((ped.texto || "") + (opt.semente || "") + p.n), ia = opt.modo === "ia", livre = opt.criatividade === "livre", fiel = opt.criatividade === "fiel";
  const en = opt.idioma !== "pt", L = x => en ? x.en : x.pt;
  const mundo = ped.scifi ? "scifi" : ped.fantasia ? "fantasia" : ped.urbano ? "urbano" : "neutro";
  const tons = p.luz < .4 || ped.sombrio ? { pt:"sombrio e tenso", en:"dark and tense" } : p.saturacao > .45 ? { pt:"vibrante e aventureiro", en:"vibrant and adventurous" } : { pt:"melancólico e contemplativo", en:"melancholic and contemplative" };

  // ETAPA 1
  const leitura = {
    observacoes: [
      `${p.n} referências medidas; ${T.folha}.`,
      `Figura principal ${T.alongado}, ${T.cab} (${T.cabTipo}).`,
      `Silhueta: ${T.massa}; leitura geral de ${T.triangulo}; ${T.espaco}.`,
      `Contorno ${T.formas}; ${T.simetria}.`,
      `Valores: ${T.valores}; ${T.chave}; ${T.contraste}; ${T.sep}.`,
      `Cor: ${T.sat}, ${T.temp}; ${T.acentos}. Paleta medida: ${T.paleta}.`,
      `Acabamento: ${T.linha}; ${T.detalhe}; ${T.sombra}.`,
      `Ponto de maior contraste e cor (foco provável): ${T.foco}.`
    ],
    hipoteses: [
      p.plano > .45 && p.contorno > .4 ? "Hipótese: arte digital 2D com line art e cel-shading, típica de anime ou desenho." : p.plano < .3 ? "Hipótese: pintura digital ou render com gradientes, mais próxima de ilustração semi-realista ou 3D." : "Hipótese: estilo híbrido, com áreas chapadas e transições suaves.",
      p.figuras > 2 ? "Hipótese: as imagens são fichas de personagem (turnaround e expressões), então as proporções vêm de vistas em pé." : "Hipótese: as imagens são quadros de cena; poses podem distorcer as proporções medidas.",
      `Hipótese: o foco em ${T.foco} sugere que o design guia o olhar para ${p.foco < .3 ? "a expressão" : "o gesto e os objetos nas mãos"}.`
    ],
    limitacoes: [
      "O motor do app mede formas, cores e valores; ele não reconhece rosto, roupa, objetos ou texto como uma pessoa reconheceria.",
      p.cabecasN < p.n*.5 ? `A proporção de cabeça só foi medida em ${p.cabecasN} de ${p.n} referências (nas outras a figura estava cortada).` : "A proporção de cabeça é uma estimativa pelo estreitamento do pescoço.",
      p.fundoLiso < .5 ? "Muitas referências não têm fundo liso: parte das medidas mistura personagem e cenário." : "Em fichas com várias figuras, a medida usa a figura mais alta de cada imagem."
    ]
  };
  // ETAPA 2
  const P = (o, e, pr) => ({ observacao:o, efeito:e, principio:pr });
  const decomposicao = [
    { topico:"Silhueta", ...P(`${T.massa}; ${T.triangulo}; ${T.espaco}.`, p.preenchimento < .45 ? "A figura se lê de longe pelos recortes e pontas." : p.preenchimento < .62 ? "A figura combina uma massa clara com alguns recortes que ajudam a reconhecê-la." : "A figura se lê como um bloco forte e fácil de reconhecer.", p.preenchimento < .45 ? "Recortes e espaços negativos tornam a silhueta única em miniatura." : p.preenchimento < .62 ? "Uma massa principal clara com um ou dois recortes marcantes dá leitura imediata e identidade." : "Uma massa principal clara, sem excesso de pontas, dá leitura imediata.") },
    { topico:"Linguagem de formas", ...P(`Contorno ${T.formas}.`, p.agudos > .3 ? "Passa energia, perigo ou agilidade." : p.curvos > .5 ? "Passa suavidade, acolhimento ou leveza." : "Passa estabilidade e ordem.", p.agudos > .3 ? "Repetir a mesma forma angular em escalas diferentes cria unidade." : "Repetir uma forma base e contrastar com poucos elementos opostos.") },
    { topico:"Proporções", ...P(`${T.cab}; ${T.cabTipo}; figura ${T.alongado}.`, !p.cabecas ? "Sem medida segura de cabeça." : p.cabecas < 5.8 ? "Cabeça grande aproxima o público e destaca a expressão." : "Corpo longo passa elegância, força ou maturidade.", "Escolher um exagero proporcional e mantê-lo em todas as vistas.") },
    { topico:"Hierarquia", ...P(`Foco provável em ${T.foco}; ${T.detalhe}.`, "O olhar vai primeiro onde há mais contraste e cor.", "Concentrar detalhe e contraste num ponto focal e deixar áreas de descanso simples.") },
    { topico:"Valores", ...P(`${T.valores}; ${T.chave}; ${T.contraste}.`, p.contraste > .2 ? "Formas bem separadas, leitura forte." : "Leitura suave; a forma depende da cor e do contorno.", "Agrupar os valores em três famílias (claro, médio, escuro) e reservar o maior contraste para o foco.") },
    { topico:"Cor", ...P(`${T.sat}; ${T.temp}; ${T.acentos}.`, p.pctSat < .2 ? "Os poucos acentos de cor chamam muita atenção." : "A cor carrega a energia do personagem.", "Uma cor dominante, uma secundária e um acento pequeno e saturado.") },
    { topico:"Figurino e objetos", ...P(`Camadas e recortes inferidos pela silhueta (${T.espaco}); detalhe ${T.detalhe}.`, "A roupa constrói a silhueta mais que o corpo.", "Cada peça precisa de uma função (proteger, carregar, identificar) para parecer crível.") },
    { topico:"Expressão e gesto", ...P(`Silhueta ${T.simetria}.`, p.simetria > .8 ? "Pose estável, de apresentação." : "Pose com movimento e intenção.", "Uma linha de ação clara atravessando o corpo inteiro comunica personalidade antes do rosto.") },
    { topico:"Acabamento", ...P(`${T.linha}; ${T.sombra}.`, p.plano > .45 ? "Leitura limpa, fácil de animar." : "Volume e material mais ricos, mais caros de produzir.", p.plano > .45 ? "Sombra em 1 ou 2 tons e contorno consistente mantêm o estilo em qualquer quadro." : "Bordas suaves no corpo e duras só no foco para guiar o olhar.") }
  ];
  // ETAPA 3
  const principios = [decomposicao[0].principio, decomposicao[3].principio, decomposicao[5].principio, decomposicao[1].principio, decomposicao[8].principio];

  // ETAPA 4: 3 conceitos (ou 3 personagens de um universo novo)
  const paletaBase = p.paleta.length ? p.paleta : [{ rgb:[120,120,120], pct:1 }];
  const corTxt = (desloc, idioma) => { const c = paletaBase.slice(0, 3).map(x => { let [h, s, l] = hsl(...x.rgb); h = (h + desloc + 360) % 360; const k = (v, n) => { const a = s*Math.min(l, 1-l), f = q => l - a*Math.max(-1, Math.min((q+h/30)%12 - 3, 9 - (q+h/30)%12, 1)); return f(n)*255; }; return corNome(k(0,0), k(0,8), k(0,4), idioma === "en"); }); return c.join(", "); };
  const papeisIA = [["protagonista","protagonist"],["antagonista","antagonist"],["aliado","ally"]];
  const usados = new Set(), sorteia = (lista, chave) => { let x, t = 0; do { x = pick(r, lista); t++; } while(usados.has(chave(x)) && t < 20); usados.add(chave(x)); return x; };
  const silhRef = p.massa[0] > p.massa[2] ? 0 : 1;
  const nomes = ia ? ["", "", ""].map(() => pick(r, BANCO.universos.prefixo) + pick(r, BANCO.universos.sufixo)) : ["A", "B", "C"].map(x => `Conceito ${x}`);
  const unico = !ia; // "Eu descrevo": um personagem só, o do pedido
  const formaRef = p.agudos > .3 ? "angular" : p.curvos > .5 ? "curva" : p.retos > .55 ? "retangular" : "mista";
  const nomeUnico = (() => { const t = (ped.ideia || "").replace(/^(uma?|o|a)\s+/i, "").split(/[,;:]| que | de \d/)[0].trim(); return t ? t[0].toUpperCase() + t.slice(1, 60) : "Seu personagem"; })();
  const conceitos = (unico ? [0] : [0, 1, 2]).map(i => {
    const candidatas = unico && !livre ? BANCO.silhuetas.filter(s => s.forma === formaRef) : BANCO.silhuetas;
    const silh = sorteia((candidatas.length ? candidatas : BANCO.silhuetas).filter((_, k) => !unico && i === 0 && fiel ? k === silhRef || k > 1 : true), s => s.pt);
    const mat = sorteia(BANCO.materiais[mundo], m => m.pt), elem = sorteia(BANCO.elementos, e => e.pt), ideia = sorteia(BANCO.ideias, e => e.pt);
    const usaPedido = !ia && !!ped.ideia, variacao = unico ? "seu personagem" : ["fiel ao seu pedido", "variação do seu pedido", livre ? "versão ousada do seu pedido" : "versão alternativa do seu pedido"][i];
    const twist = (unico ? livre : i === 2 && (livre || !ped.ideia)) ? ideia : null;
    const desloc = fiel ? [0, 20, -20][i] : livre ? [0, 140, 200][i] : [0, 60, -60][i];
    const cab = p.cabecas ? Math.max(2.5, Math.min(9, p.cabecas + (fiel ? 0 : livre ? [0, 1.5, -1.2][i] : [0, .8, -.6][i]))) : [6.5, 7.5, 5.5][i];
    const papel = ia ? papeisIA[i] : [ped.papel || "", ped.papelEn || ""];
    return { nome: ia ? `${nomes[i]} (${papel[0]})` : unico ? nomeUnico + (ped.papel ? ` · ${ped.papel}` : "") : nomes[i] + (ped.papel ? ` · ${ped.papel}` : ""),
      _en: { silh: silh.en, mat: ped.aparencia && !ia ? null : mat.en, elem: ped.obrigatorias && !ia ? null : elem.en, ideia: usaPedido ? null : ideia.en, twist: twist && twist.en, cores: ped.cores && !ia ? null : corTxt(desloc, "en"), cab, papel: papel[1] },
      ideia_narrativa: ia ? `${papel[0][0].toUpperCase() + papel[0].slice(1)}: ${ideia.pt}.` : usaPedido ? `${variacao[0].toUpperCase() + variacao.slice(1)}: ${ped.ideia}${ped.personalidade ? `; personalidade ${ped.personalidade}` : ""}${ped.poder && !ped.ideia.includes(ped.poder) ? `; ${ped.poder}` : ""}${twist ? `. Toque extra: ${twist.pt}` : ""}.` : `${ideia.pt}.`,
      silhueta: silh.pt + ".",
      proporcoes: `Cerca de ${cab.toFixed(1)} cabeças${i === 0 ? ", como na referência" : ", diferente da referência para criar contraste"}${ped.idade ? `; idade de ${ped.idade} anos` : ""}.`,
      linguagem_de_formas: silh.forma === "angular" ? "Triângulos e diagonais dominantes, com uma única curva no rosto para humanizar." : silh.forma === "curva" ? "Círculos e curvas dominantes, com um elemento reto e duro como contraste." : silh.forma === "retangular" ? "Retângulos e blocos, com pequenas pontas só nos acessórios." : "Mistura de curvas no corpo e ângulos no figurino.",
      figurino_e_materiais: !ia && ped.aparencia ? `Como você pediu: ${ped.aparencia}. Construção no estilo da referência: ${mat.pt}${i === 0 ? "" : ", em outra combinação de camadas"}.` : `${mat.pt}; cada peça com uma função na história.`,
      organizacao_cromatica: !ia && ped.cores ? `Como você pediu: ${ped.cores}. Valores e saturação no padrão da referência (${T.chave}, ${T.sat}).` : `Base derivada da paleta medida, girada ${desloc}° no círculo de cores: ${corTxt(desloc, "pt")}. Valores agrupados como na referência (${T.chave}).`,
      elemento_marcante: !ia && ped.obrigatorias ? `${ped.obrigatorias} (obrigatório no seu pedido), tratado como o ponto de foco do design${i === 2 ? ", com uma função na história" : ""}.` : elem.pt + "." };
  });
  const universo = ia ? (() => { const pr = pick(r, BANCO.universos.premissa); return { nome: pick(r, BANCO.universos.prefixo) + pick(r, BANCO.universos.sufixo), premissa: pr.pt, mundo: { scifi:"tecnologia avançada sobre ruínas antigas", fantasia:"reinos antigos onde a magia tem preço", urbano:"cidade contemporânea com uma camada oculta de poder", neutro:"mundo próprio, entre o cotidiano e o fantástico" }[mundo] + (ped.texto ? `; com as suas pistas: ${ped.texto.slice(0, 160)}` : ""), tom: tons.pt, _en: pr.en }; })() : { nome:"", premissa:"", mundo:"", tom:"" };

  // ETAPA 5
  const nota = (c, i) => {
    const miniatura = i === 0 ? (p.preenchimento < .55 ? "boa: herda os recortes da referência" : "média: silhueta compacta, precisa de um recorte marcante") : "boa: silhueta própria e diferente";
    return { conceito: c.nome, leitura_em_miniatura: miniatura, clareza_da_personalidade: ped.texto || ia ? "clara, ligada à ideia narrativa" : "média: falta definir a personalidade no pedido",
      coerencia_funcional: "coerente se cada peça mantiver a função descrita", hierarquia_visual: `foco no ${T.foco} e no elemento marcante`, diferenciacao_da_referencia: i === 0 ? "menor: mais próximo da referência" : i === 1 ? "média" : "maior: proporção e cor mais distantes" };
  };
  const revisao = unico ? { comparacao: conceitos.map((c, i) => ({ ...nota(c, i), diferenciacao_da_referencia: "segue o estilo da referência; a identidade vem do seu pedido" })),
    fragilidades: [
      ped.obrigatorias ? `O item obrigatório (${ped.obrigatorias}) pode competir com o rosto pela atenção.` : "Sem item obrigatório, o personagem pode ficar genérico se o elemento marcante for discreto demais.",
      p.contraste < .17 ? "O contraste da referência é suave; em miniatura o personagem pode se misturar com o fundo." : "Detalhe demais no figurino pode tirar a leitura em miniatura.",
      !ped.personalidade ? "A personalidade não foi descrita; a pose e a expressão podem sair neutras." : `Confira se a pose passa a personalidade (${ped.personalidade}).`
    ],
    correcoes: [
      "Deixe o maior contraste no rosto e use o item marcante como segundo ponto de foco.",
      p.contraste < .17 ? "Aumente o contraste só na cabeça e nas mãos." : "Simplifique as áreas longe do foco (calças, costas) para dar descanso ao olhar.",
      !ped.personalidade ? "Escreva 2 ou 3 traços de personalidade no pedido e gere de novo." : "Escolha uma linha de ação que combine com essa personalidade."
    ] } : { comparacao: conceitos.map(nota),
    fragilidades: [
      `${conceitos[0].nome}: pode ficar parecido demais com a referência.`,
      `${conceitos[2].nome}: a mudança de cor pode quebrar a unidade com o resto da obra.`,
      p.contraste < .17 ? "Todos: o contraste da referência é suave; em miniatura os personagens podem se misturar com o fundo." : "Todos: confira se o elemento marcante não compete com o rosto."
    ],
    correcoes: [
      `${conceitos[0].nome}: troque a linguagem de formas principal ou a distribuição de massa.`,
      `${conceitos[2].nome}: mantenha um acento da paleta original para ligar à obra.`,
      p.contraste < .17 ? "Aumente o contraste só na cabeça e nas mãos." : "Reduza o detalhe perto do elemento marcante e deixe o rosto com o maior contraste."
    ] };
  const escolhidoIdx = ia || unico ? 0 : fiel ? 0 : livre ? 2 : 1;
  const escolhido = { conceito: conceitos[escolhidoIdx].nome, motivo: unico ? "É o personagem que você descreveu, no estilo aprendido das referências." : ia ? "É o personagem principal do universo criado." : fiel ? "Segue mais de perto o pedido e a referência." : livre ? "Tem a maior diferença em relação à referência, como pede a criatividade livre." : "Equilibra fidelidade ao estilo e solução nova." };

  // ETAPA 6: prompts autossuficientes (sem imagens anexadas)
  const estiloEN = `VISUAL STYLE: ${p.plano > .45 ? "clean 2D digital art with cel-shading in 1-2 shadow tones" : p.plano > .3 ? "digital illustration mixing flat color areas and soft gradients" : "painterly rendering with soft gradients and visible texture"}; ${p.contorno > .5 ? "consistent dark outlines (line art)" : p.contorno > .3 ? "thin outlines on part of the forms" : "no dark outlines, edges defined by color"}; ${p.bordas > .09 ? "rich interior detail" : p.bordas > .045 ? "moderate interior detail" : "minimal interior detail, clean shapes"}; ${p.luz > .6 ? "high-key, light overall values" : p.luz < .35 ? "low-key, dark overall values" : "mid-key values"} with ${p.contraste > .26 ? "strong" : p.contraste > .17 ? "medium" : "soft"} contrast; ${p.saturacao > .5 ? "saturated, vivid colors" : p.saturacao > .25 ? "moderately saturated colors" : "desaturated, almost neutral colors"} with ${p.quente > p.frio + .15 ? "warm" : p.frio > p.quente + .15 ? "cool" : "balanced"} dominance and ${p.pctSat < .2 ? "small, saturated accent colors" : "color spread across the figure"}; palette of ${paletaBase.slice(0, 5).map(c => corNome(...c.rgb, true)).join(", ")}; ${p.cabecas ? `proportions around ${p.cabecas.toFixed(1)} heads tall` : "stylized proportions"}; ${p.agudos > .3 ? "angular shape language" : p.curvos > .5 ? "rounded shape language" : p.retos > .55 ? "blocky rectangular shape language" : "mixed shape language"}.`;
  const estiloPT = `ESTILO VISUAL: ${T.sombra}; ${T.linha}; ${T.detalhe}; ${T.chave} com ${T.contraste}; ${T.sat}, ${T.temp}, ${T.acentos}; paleta de ${paletaBase.slice(0, 5).map(c => corNome(...c.rgb)).join(", ")}; ${p.cabecas ? `proporções de cerca de ${p.cabecas.toFixed(1)} cabeças` : "proporções estilizadas"}; linguagem de formas ${T.formas.split(":")[0]}.`;
  const prancha = opt.formato === "prancha"
    ? (en ? "Character sheet on a plain neutral background with clear spacing between views: front, side and back views with consistent proportions and outfit; three facial expressions; close-up details of accessories. No text, no logos, no UI elements, no watermarks." : "Prancha de personagem em fundo neutro liso com espaçamento claro entre as vistas: vista frontal, lateral e traseira com proporções e figurino consistentes; três expressões faciais; detalhes dos acessórios em close. Sem texto, logotipos, interfaces ou marcas d'água.")
    : (en ? "Single character design illustration: one full-body view of the character in a three-quarter pose that shows their personality, on a plain neutral background, centered with space around the figure. One character only, no multiple views, no text, no logos, no watermarks." : "Uma única ilustração de character design: o personagem de corpo inteiro em pose três-quartos que mostra a personalidade, fundo neutro liso, centralizado com espaço em volta. Um personagem só, sem vistas múltiplas, sem texto, logotipos ou marcas d'água.");
  const promptDe = c => {
    const e = c._en, gen = ped.genero === "f" ? (en ? "a woman" : "uma mulher") : ped.genero === "m" ? (en ? "a man" : "um homem") : (en ? "a person" : "uma pessoa");
    const idade = ped.idade ? (en ? `, about ${ped.idade} years old` : `, com cerca de ${ped.idade} anos`) : "";
    const estiloEsc = { anime:[" Rendered in Japanese anime style."," Em estilo anime japonês."], desenho:[" Rendered as a 2D cartoon."," Em estilo desenho animado 2D."], "3d":[" Rendered as a stylized 3D animated film character."," Em estilo de animação 3D estilizada."], realista:[" Rendered photorealistic, like live-action, with an original face."," Realista, como live-action, com rosto original."] }[opt.estilo];
    if(en) return `${estiloEN}${estiloEsc ? estiloEsc[0] : ""}

${!ia && ped.texto ? `CHARACTER BRIEF FROM THE AUTHOR (in Portuguese; follow every detail, it has priority over everything below): "${ped.texto}"

` : ""}CHARACTER: ${gen}${idade}${e.papel ? `, the ${e.papel} of the story` : ""}${universo._en ? ` in a world where ${universo._en.replace(/^a world where /, "")}` : ""}.${e.ideia ? ` Concept: ${e.ideia}.` : " Concept: exactly as described in the author's brief."}${e.twist ? ` Extra twist: ${e.twist}.` : ""} Silhouette: ${e.silh}. Proportions: about ${e.cab.toFixed(1)} heads tall. Outfit and materials: ${e.mat || "as described in the author's brief, built in the visual style above"}. Signature element with narrative purpose: ${e.elem || "the mandatory feature from the author's brief, as the focal point"}. Color scheme: ${e.cores || "as described in the author's brief"}, with one small saturated accent. Pose: confident neutral stance with a clear line of action. Expression: matches the personality. Lighting: soft even studio light that keeps the values readable.

${prancha}`;
    return `${estiloPT}${estiloEsc ? estiloEsc[1] : ""}

${!ia && ped.texto ? `PEDIDO DO AUTOR (siga todos os detalhes; tem prioridade sobre o resto): "${ped.texto}"

` : ""}PERSONAGEM: ${gen}${idade}${c.nome.includes("(") ? `, ${c.nome.split("(")[1].replace(")", "")} da história` : ped.papel ? `, ${ped.papel} da história` : ""}. Ideia: ${c.ideia_narrativa} Silhueta: ${c.silhueta} Proporções: ${c.proporcoes} Figurino e materiais: ${c.figurino_e_materiais} Elemento marcante: ${c.elemento_marcante} Cores: ${c.organizacao_cromatica} Pose neutra e confiante com linha de ação clara. Luz de estúdio suave e uniforme.

${prancha}`;
  };
  const outros = ia ? conceitos.filter((_, i) => i !== escolhidoIdx).map(c => ({ personagem: c.nome, prompt: promptDe(c) })) : [];
  const perguntas = [];
  if(!ia){ if(!ped.papel && !/papel\s*:/i.test(ped.texto)) perguntas.push("Qual é o papel do personagem na história (protagonista, vilão, mentor...)?"); if(!ped.uso && !/\buso\s*:/i.test(ped.texto)) perguntas.push("O uso final é jogo, animação, quadrinho ou ilustração?"); if(!ped.idade && !ped.genero && !/idade e tipo f[ií]sico\s*:/i.test(ped.texto)) perguntas.push("Qual a idade e o tipo físico do personagem?"); }
  return { formato: opt.formato === "prancha" ? "prancha" : "imagem", titulo: { obra: ia ? universo.nome : (ped.obra || opt.obra || "Sem obra"), personagem: conceitos[escolhidoIdx].nome },
    universo_proposto: ia ? { nome: universo.nome, premissa: universo.premissa, mundo: universo.mundo, tom: universo.tom } : { nome:"", premissa:"", mundo:"", tom:"" },
    perguntas: perguntas.slice(0, 3), leitura, decomposicao, principios,
    conceitos: conceitos.map(({ _en, ...c }) => c), revisao, escolhido,
    estilo_aprendido: en ? estiloEN : estiloPT, prompt_final: promptDe(conceitos[escolhidoIdx]), prompts_outros: outros,
    aviso_originalidade: `Feito pelo motor do app (sem IA externa), com base em ${p.n} referências${p.analises > 1 ? ` e no estilo aprendido em ${p.analises} análises desta obra` : ""}. As medidas são automáticas e os conceitos são combinações geradas: revise tudo e não trate como garantia de originalidade.` };
}

window.MotorReverso = { medir, juntar, aprender, perfis, gerar, lerPedido };
})();
