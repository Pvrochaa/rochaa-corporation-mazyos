// Publica um carrossel no Instagram via Meta Graph API.
//
// Uso:
//   node --env-file=.env scripts/postar-instagram.js marketing/conteudo/<pasta-do-carrossel> [--slug nome-publico]
//
// Espera:
//   <pasta>/instagram/slide-01.png ... slide-NN.png  (2 a 10 imagens)
//   <pasta>/legenda.md                               (a legenda; o título "# ..." é ignorado)
//   .env com SITE_URL e UMA das duas opções:
//     a) META_IG_ACCESS_TOKEN            -> "API do Instagram com login do Instagram" (sem Página do Facebook)
//     b) META_PAGE_ACCESS_TOKEN + META_IG_USER_ID -> API via Página do Facebook
//
// As imagens precisam estar em URL pública. O fluxo é: copiar os PNGs pra `posts/<slug>/`
// no site, fazer push (a Vercel publica), e só então rodar este script — ele confere
// que cada imagem responde 200 antes de chamar a API.

const fs = require('fs');
const path = require('path');

const viaInstagram = !!process.env.META_IG_ACCESS_TOKEN;
const API = viaInstagram ? 'https://graph.instagram.com/v21.0' : 'https://graph.facebook.com/v21.0';
const TOKEN = viaInstagram ? process.env.META_IG_ACCESS_TOKEN : process.env.META_PAGE_ACCESS_TOKEN;
const IG_USER = viaInstagram ? 'me' : process.env.META_IG_USER_ID;
const SITE = (process.env.SITE_URL || '').replace(/\/$/, '');

const args = process.argv.slice(2);
const pasta = args[0];
const slugArg = args.indexOf('--slug') >= 0 ? args[args.indexOf('--slug') + 1] : null;

if (!pasta) { console.error('Uso: node --env-file=.env scripts/postar-instagram.js <pasta-do-carrossel> [--slug nome]'); process.exit(1); }
if (!TOKEN || !IG_USER || !SITE) { console.error('Faltam credenciais no .env: SITE_URL e (META_IG_ACCESS_TOKEN) ou (META_PAGE_ACCESS_TOKEN + META_IG_USER_ID)'); process.exit(1); }

const slug = slugArg || path.basename(pasta).replace(/-\d{4}-\d{2}-\d{2}$/, '');
const dirImgs = path.join(pasta, 'instagram');
const slides = fs.existsSync(dirImgs)
  ? fs.readdirSync(dirImgs).filter(f => /^slide-\d+\.png$/i.test(f)).sort()
  : [];
if (slides.length < 2 || slides.length > 10) { console.error(`Carrossel precisa de 2 a 10 slides em ${dirImgs} (achei ${slides.length})`); process.exit(1); }

const legendaPath = path.join(pasta, 'legenda.md');
if (!fs.existsSync(legendaPath)) { console.error(`Não achei ${legendaPath}`); process.exit(1); }
const caption = fs.readFileSync(legendaPath, 'utf8').replace(/^#.*\n+/, '').trim();

const urls = slides.map(f => `${SITE}/posts/${slug}/${f}`);

async function api(pathname, params) {
  const body = new URLSearchParams({ ...params, access_token: TOKEN });
  const r = await fetch(`${API}/${pathname}`, { method: 'POST', body });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(`${pathname}: ${JSON.stringify(j.error || j)}`);
  return j;
}
async function status(id) {
  const r = await fetch(`${API}/${id}?fields=status_code,status&access_token=${TOKEN}`);
  return r.json();
}
const dormir = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  console.log(`Slug: ${slug} · ${slides.length} slides · via ${viaInstagram ? 'login do Instagram' : 'Página do Facebook'}`);

  // 1. confere que as imagens estão públicas
  for (const u of urls) {
    const r = await fetch(u, { method: 'HEAD' });
    if (!r.ok) { console.error(`Imagem não acessível (${r.status}): ${u}\nFaz o push dos PNGs pro site antes de publicar.`); process.exit(1); }
  }
  console.log('Imagens públicas OK');

  // 2. um container por slide
  const filhos = [];
  for (const u of urls) {
    const { id } = await api(`${IG_USER}/media`, { image_url: u, is_carousel_item: 'true' });
    filhos.push(id);
    process.stdout.write(`  item ${filhos.length}/${urls.length}\r`);
  }
  console.log('\nItens criados');

  // 3. container do carrossel
  const { id: carrossel } = await api(`${IG_USER}/media`, { media_type: 'CAROUSEL', children: filhos.join(','), caption });

  // 4. espera processar
  for (let i = 0; i < 30; i++) {
    const s = await status(carrossel);
    if (s.status_code === 'FINISHED') break;
    if (s.status_code === 'ERROR') { console.error('Container com erro:', s); process.exit(1); }
    await dormir(3000);
  }

  // 5. publica
  const { id: postId } = await api(`${IG_USER}/media_publish`, { creation_id: carrossel });
  const r = await fetch(`${API}/${postId}?fields=permalink&access_token=${TOKEN}`);
  const { permalink } = await r.json();
  console.log(`\n✓ Publicado no Instagram: ${permalink || postId}`);
})().catch(e => { console.error('\nFalhou:', e.message); process.exit(1); });
