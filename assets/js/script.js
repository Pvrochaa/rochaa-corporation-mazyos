// cabeçalho
const h = document.getElementById('topo');
if (h) addEventListener('scroll', () => h.classList.toggle('scrolled', scrollY > 20), {passive:true});

// reveal
const io = new IntersectionObserver((es) => {
  es.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      const preco = e.target.querySelector('.valor .n[data-valor]');
      if (preco) animarPreco(preco);
      io.unobserve(e.target);
    }
  });
}, {threshold:.15, rootMargin:'0px 0px -40px'});
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// contagem animada dos preços
function animarPreco(el) {
  const alvo = parseInt(el.dataset.valor, 10);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !alvo) {
    el.textContent = 'R$ ' + alvo.toLocaleString('pt-BR');
    return;
  }
  const duracao = 900;
  const inicio = performance.now();
  const passo = (agora) => {
    const t = Math.min((agora - inicio) / duracao, 1);
    const facil = 1 - Math.pow(1 - t, 3);
    el.textContent = 'R$ ' + Math.round(alvo * facil).toLocaleString('pt-BR');
    if (t < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

// busca digitando (só existe na home)
const parado = matchMedia('(prefers-reduced-motion: reduce)').matches;
const alvoBusca = document.getElementById('q');
if (alvoBusca) {
  const texto = 'dentista perto de mim';
  if (parado) { alvoBusca.textContent = texto; }
  else {
    let i = 0;
    const escrever = () => {
      alvoBusca.textContent = texto.slice(0, i);
      i++;
      if (i <= texto.length) setTimeout(escrever, 68);
    };
    setTimeout(escrever, 700);
  }
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

// filtro de projetos por área
const filtroObras = document.querySelector('.filtro-obras');
if (filtroObras) {
  const obras = document.querySelectorAll('.obra-item');
  const aplicarFiltro = (alvo) => {
    obras.forEach(o => {
      o.hidden = !(alvo === 'todos' || o.dataset.categoria === alvo);
    });
  };
  filtroObras.querySelectorAll('.filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      filtroObras.querySelectorAll('.filtro').forEach(b => {
        const ativo = b === btn;
        b.classList.toggle('on', ativo);
        b.setAttribute('aria-pressed', String(ativo));
      });
      aplicarFiltro(btn.dataset.filtro);
    });
  });
}

// seletor "qual plano é seu"
const seletor = document.getElementById('seletor');
if (seletor) {
  const respostas = {};
  const resultado = document.getElementById('resultado');
  const resultadoNome = document.getElementById('resultadoNome');
  const resultadoPreco = document.getElementById('resultadoPreco');
  const resultadoBeneficios = document.getElementById('resultadoBeneficios');
  const resultadoPrazo = document.getElementById('resultadoPrazo');
  const resultadoLink = document.getElementById('resultadoLink');
  const mapa = {
    site: { id: 'plano-site', nome: 'Site completo', preco: 'a partir de R$ 1.500', prazo: 'Entrega em 7 dias', beneficios: [
      'Apresentar seu negócio com profissionalismo',
      'Ser encontrado no Google',
      'Receber clientes direto no WhatsApp',
    ]},
    manutencao: { id: 'plano-manutencao', nome: 'Manutenção', preco: 'R$ 397/mês', prazo: 'Sem fidelidade — cancele quando quiser', beneficios: [
      'Manter o site que você já tem sempre atualizado',
      'Hospedagem, domínio e backup cobertos',
      'Suporte direto por WhatsApp',
    ]},
    crm: { id: 'plano-crm-avulso', nome: 'CRM', preco: 'a combinar', prazo: 'Entrega em até 10 semanas', beneficios: [
      'Organizar clientes, agenda e histórico num só lugar',
      'Parar de controlar tudo por planilha ou caderno',
      'Painel próprio, acessível de qualquer lugar',
    ]},
  };

  const calcular = () => {
    if (respostas.site === 'nao') return mapa.site;
    if (respostas.crm === 'sim') return mapa.crm;
    return mapa.manutencao;
  };

  seletor.querySelectorAll('.pergunta').forEach(bloco => {
    const chave = bloco.dataset.pergunta;
    bloco.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        respostas[chave] = btn.dataset.valor;
        bloco.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));

        if (Object.keys(respostas).length < 2) return;
        const plano = calcular();
        resultadoNome.textContent = plano.nome;
        resultadoPreco.textContent = plano.preco;
        resultadoBeneficios.innerHTML = plano.beneficios.map(b => `<li>${b}</li>`).join('');
        resultadoPrazo.textContent = plano.prazo;
        resultadoLink.href = '#' + plano.id;
        resultado.hidden = false;

        document.querySelectorAll('.recomendado').forEach(p => p.classList.remove('recomendado'));
        const alvo = document.getElementById(plano.id);
        if (alvo) alvo.classList.add('recomendado');
      });
    });
  });

  resultadoLink && resultadoLink.addEventListener('click', (e) => {
    e.preventDefault();
    const plano = calcular();
    const alvo = document.getElementById(plano.id);
    if (alvo) alvo.scrollIntoView({behavior: parado ? 'auto' : 'smooth', block: 'center'});
  });
}

// evita que o botão dentro do sumário também abra/feche o acordeão
document.querySelectorAll('.entrega-item.et-acc summary .btn').forEach(btn => {
  btn.addEventListener('click', e => e.stopPropagation());
});

// faq e planos com painel expansível, abertura suave
document.querySelectorAll('.faq details, .entrega-item.et-acc, .obra-case').forEach(det => {
  const summary = det.querySelector('summary');
  const painel = det.querySelector('.resposta, .et-detalhe, .obra-case-conteudo');
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
