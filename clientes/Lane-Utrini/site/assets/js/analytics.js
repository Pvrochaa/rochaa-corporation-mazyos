/* Medição de conversão — Utrini Odontologia
   ----------------------------------------------------------------
   COMO LIGAR (uma vez só, leva 5 minutos):
   1. Crie a propriedade em analytics.google.com
   2. Copie o ID de medição — formato G-XXXXXXXXXX
   3. Cole entre as aspas abaixo e publique

   Enquanto GA_ID estiver vazio, nada é carregado e nada é enviado:
   o site não faz nenhuma requisição externa e não usa cookie.
   ---------------------------------------------------------------- */

const GA_ID = '';

if (GA_ID) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
  document.head.appendChild(tag);
}

function registrar(evento, dados) {
  if (typeof window.gtag === 'function') window.gtag('event', evento, dados);
}

// Todo clique que vira contato é um evento. É esse número que entra no
// relatório mensal: quantas pessoas pediram pra agendar, e de qual página.
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href') || '';
  const secao = link.closest('section[id], header[id]');
  const dados = {
    pagina: location.pathname,
    secao: secao ? secao.id : 'sem-secao',
    rotulo: (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60)
  };

  if (href.includes('wa.me/')) registrar('clique_whatsapp', dados);
  else if (href.startsWith('tel:')) registrar('clique_telefone', dados);
  else if (href.includes('instagram.com')) registrar('clique_instagram', dados);
});
