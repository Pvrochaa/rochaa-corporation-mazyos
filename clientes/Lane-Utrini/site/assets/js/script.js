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

// header com sombra ao rolar
const topo = document.getElementById('topo');
if (topo) {
  const atualizarTopo = () => topo.classList.toggle('scrolled', scrollY > 12);
  addEventListener('scroll', atualizarTopo, { passive: true });
  atualizarTopo();
}

// reveal ao rolar
const io = new IntersectionObserver((entradas) => {
  entradas.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      io.unobserve(e.target);
    }
  });
}, { threshold: .15, rootMargin: '0px 0px -60px' });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// faq com painel expansível, abertura suave
const parado = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.faq details').forEach(det => {
  const summary = det.querySelector('summary');
  const painel = det.querySelector('.faq-resposta');
  if (!summary || !painel) return;
  if (parado) return;
  summary.addEventListener('click', (e) => {
    e.preventDefault();
    if (det.open) {
      painel.style.maxHeight = painel.scrollHeight + 'px';
      requestAnimationFrame(() => {
        painel.style.maxHeight = '0px';
        painel.style.opacity = '0';
      });
      setTimeout(() => { det.open = false; }, 300);
    } else {
      det.open = true;
      requestAnimationFrame(() => {
        painel.style.maxHeight = painel.scrollHeight + 'px';
        painel.style.opacity = '1';
      });
    }
  });

  // quando a abertura termina, solta o teto de altura. sem isso a resposta
  // fica presa na altura que tinha na hora do clique e corta o texto se a
  // pessoa girar o celular ou aumentar a fonte do navegador.
  painel.addEventListener('transitionend', (ev) => {
    if (ev.propertyName !== 'max-height') return;
    if (det.open && painel.style.maxHeight !== '0px') painel.style.maxHeight = 'none';
  });
});

// fecha o menu mobile ao clicar fora dele
document.addEventListener('click', (e) => {
  if (!navLinks || !navLinks.classList.contains('open')) return;
  if (navLinks.contains(e.target) || hamb.contains(e.target)) return;
  navLinks.classList.remove('open');
  hamb.classList.remove('open');
  hamb.setAttribute('aria-expanded', 'false');
});
