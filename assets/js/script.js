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
