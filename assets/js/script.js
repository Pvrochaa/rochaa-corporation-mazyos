// cabeçalho
const h = document.getElementById('topo');
addEventListener('scroll', () => h.classList.toggle('scrolled', scrollY > 20), {passive:true});

// reveal
const io = new IntersectionObserver((es) => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
}, {threshold:.15, rootMargin:'0px 0px -40px'});
document.querySelectorAll('.rv, .passo').forEach(el => io.observe(el));

// busca digitando
const alvo = document.getElementById('q');
const texto = 'barbearia perto de mim';
const parado = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (parado) { alvo.textContent = texto; }
else {
  let i = 0;
  const escrever = () => {
    alvo.textContent = texto.slice(0, i);
    i++;
    if (i <= texto.length) setTimeout(escrever, 68);
  };
  setTimeout(escrever, 700);
}

// menu mobile
const hamb = document.getElementById('hamb');
const navLinks = document.getElementById('navLinks');
if (hamb && navLinks) {
  const fechar = () => {
    navLinks.classList.remove('open');
    hamb.classList.remove('open');
    hamb.setAttribute('aria-expanded', 'false');
  };
  hamb.addEventListener('click', () => {
    const aberto = navLinks.classList.toggle('open');
    hamb.classList.toggle('open', aberto);
    hamb.setAttribute('aria-expanded', String(aberto));
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', fechar));
}

// barra de progresso de leitura
const barra = document.getElementById('progresso');
if (barra) {
  const atualizarBarra = () => {
    const doc = document.documentElement;
    const total = doc.scrollHeight - doc.clientHeight;
    barra.style.width = (total > 0 ? (doc.scrollTop / total) * 100 : 0) + '%';
  };
  addEventListener('scroll', atualizarBarra, {passive:true});
  atualizarBarra();
}

// interações que só fazem sentido com mouse de verdade
const temMouse = matchMedia('(pointer:fine)').matches;
if (temMouse && !parado) {
  // esferas do hero seguindo o cursor (paralaxe leve)
  const hero = document.getElementById('hero');
  const orbe1 = document.querySelector('.orbe-1');
  const orbe2 = document.querySelector('.orbe-2');
  if (hero && orbe1 && orbe2) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - .5;
      ty = (e.clientY - r.top) / r.height - .5;
    });
    (function laco() {
      cx += (tx - cx) * .06;
      cy += (ty - cy) * .06;
      orbe1.style.transform = `translate3d(${cx * 50}px, ${cy * 50}px, 0)`;
      orbe2.style.transform = `translate3d(${cx * -36}px, ${cy * -36}px, 0)`;
      requestAnimationFrame(laco);
    })();
  }

  // botões magnéticos
  document.querySelectorAll('.btn-1').forEach(btn => {
    btn.classList.add('magnet');
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${mx * .18}px, ${my * .35 - 2}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  // cards de trabalho com tilt 3D
  document.querySelectorAll('.obra').forEach(card => {
    card.addEventListener('mouseenter', () => card.classList.add('tilting'));
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(800px) rotateX(${py * -6}deg) rotateY(${px * 8}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('tilting');
      card.style.transform = '';
    });
  });
}

// faq com abertura suave
document.querySelectorAll('.faq details').forEach(det => {
  const summary = det.querySelector('summary');
  const painel = det.querySelector('p');
  if (!summary || !painel) return;
  if (parado) return; // deixa o navegador abrir/fechar na hora, sem animação
  summary.addEventListener('click', (e) => {
    e.preventDefault();
    if (det.open) {
      painel.style.maxHeight = painel.scrollHeight + 'px';
      requestAnimationFrame(() => {
        painel.style.maxHeight = '0px';
        painel.style.opacity = '0';
      });
      setTimeout(() => { det.open = false; }, 320);
    } else {
      det.open = true;
      requestAnimationFrame(() => {
        painel.style.maxHeight = painel.scrollHeight + 'px';
        painel.style.opacity = '1';
      });
    }
  });
});
