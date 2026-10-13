'use strict';

/* =========================================================
   Dados
   ========================================================= */

const EMERGENCIAS = [
  { id: 'policia', nome: 'Polícia', numero: '190', icone: '🚓', cor: 'azul', quando: 'Roubo ou perigo', fala: 'a Polícia' },
  { id: 'samu', nome: 'Ambulância', numero: '192', icone: '🚑', cor: 'vermelho', quando: 'Passando mal', fala: 'a Ambulância, o SAMU',
    acolhida: 'Respire fundo, com calma. A ajuda pode vir até você.' },
  { id: 'bombeiros', nome: 'Bombeiros', numero: '193', icone: '🚒', cor: 'laranja', quando: 'Fogo ou resgate', fala: 'os Bombeiros' },
  { id: 'defesa', nome: 'Defesa Civil', numero: '199', icone: '🌊', cor: 'amarelo', quando: 'Enchente ou temporal', fala: 'a Defesa Civil' },
];

const UTEIS = [
  { id: 'cvv', nome: 'Conversar com alguém', rotulo: 'Conversar', detalhe: 'CVV: apoio emocional, 24 horas, de graça', numero: '188', icone: '💬', fala: 'o CVV',
    acolhida: 'Sinto muito que você esteja passando por isso. No CVV tem gente para conversar com você, de graça, a qualquer hora.' },
  { id: 'disque100', nome: 'Denunciar maus-tratos', rotulo: 'Maus-tratos', detalhe: 'Disque 100: violência ou abandono de idosos', numero: '100', icone: '🛡️', fala: 'o Disque 100',
    acolhida: 'Ninguém pode maltratar você. O Disque 100 recebe denúncias e não precisa dizer seu nome.' },
];

const TELEFONES = [...EMERGENCIAS, ...UTEIS];

// O que procurar no Google Maps para cada tipo de lugar.
// Nos lugares de urgência a busca já pede só os que estão abertos agora.
const CATEGORIAS = {
  lazer: [
    { id: 'convivencia', nome: 'Grupos de idosos', icone: '👵', google: 'grupo de convivência para idosos' },
    { id: 'pracas', nome: 'Praças e parques', icone: '🌳', google: 'praça' },
    { id: 'exercicio', nome: 'Exercícios e esporte', icone: '🤸', google: 'academia ao ar livre' },
    { id: 'cultura', nome: 'Cultura e leitura', icone: '📚', google: 'centro cultural' },
  ],
  ajuda: [
    { id: 'hospital', nome: 'Hospitais', icone: '🏥', agora: 'abertos agora', google: 'hospital pronto-socorro aberto agora' },
    { id: 'posto', nome: 'Postos de saúde', icone: '🩺', agora: 'abertos agora', google: 'UPA posto de saúde aberto agora' },
    { id: 'farmacia', nome: 'Farmácias', icone: '💊', agora: 'abertas agora', google: 'farmácia aberta agora' },
    { id: 'policia', nome: 'Delegacias', icone: '👮', agora: 'abertas agora', google: 'delegacia de polícia aberta agora' },
    { id: 'assistencia', nome: 'Assistência social', icone: '🤝', google: 'CRAS assistência social' },
    { id: 'acolhimento', nome: 'Casas de acolhimento', icone: '🏡', google: 'casa de acolhimento para idosos' },
  ],
};

// O que a pessoa pode falar ou escrever. A ordem importa: a primeira que combinar vale.
// As palavras combinam pelo começo da palavra ("sozinh" pega "sozinho" e "sozinha").
const INTENCOES = [
  { tipo: 'lugar', grupo: 'ajuda', cat: 'policia', palavras: ['delegacia', 'posto policial', 'batalhao'] },
  { tipo: 'ligar', alvo: 'samu', palavras: [
    'ambulancia', 'samu', 'passando mal', 'sentindo mal', 'estou mal', 'to mal', 'tou mal', 'muito mal',
    'dor no peito', 'dor forte', 'desmai', 'infarto', 'enfarte', 'derrame', 'avc', 'convuls',
    'eu cai', 'cai no chao', 'levei um tombo', 'tombo', 'queda', 'nao consigo respirar', 'falta de ar', 'sangr',
    'pressao alta', 'pressao baixa', 'machuc'] },
  { tipo: 'ligar', alvo: 'bombeiros', palavras: [
    'bombeiro', 'fogo', 'incendio', 'fumaca', 'pegando fogo', 'cheiro de gas', 'vazamento de gas', 'gas vazando',
    'fiquei preso', 'estou preso', 'resgate'] },
  { tipo: 'ligar', alvo: 'policia', palavras: [
    'policia', 'ladrao', 'ladroes', 'roub', 'assalt', 'invadi', 'arromb', 'briga', 'perigo', 'ameac', 'golpe'] },
  { tipo: 'ligar', alvo: 'defesa', palavras: [
    'defesa civil', 'enchente', 'alag', 'agua subindo', 'agua entrando', 'desab', 'deslizamento',
    'temporal', 'vendaval', 'chuva forte', 'arvore caiu', 'inund'] },
  { tipo: 'ligar', alvo: 'disque100', palavras: [
    'maus tratos', 'maltrat', 'violencia', 'me bate', 'me batem', 'abandon', 'denunc', 'abuso',
    'pegam meu dinheiro', 'tiram meu dinheiro'] },
  { tipo: 'ligar', alvo: 'cvv', palavras: [
    'triste', 'sozinh', 'solidao', 'desabaf', 'depress', 'angust', 'desanim', 'chor', 'saudade',
    'falar com alguem', 'falar com alguma pessoa', 'falar com uma pessoa', 'alguem pra conversar', 'alguem para conversar',
    'alguem pra falar', 'alguem para falar', 'conversar', 'companhia', 'ninguem', 'me escutar', 'me ouvir',
    'nao aguento mais', 'quero morrer', 'vontade de morrer', 'sem vontade de viver'] },

  { tipo: 'lugar', grupo: 'ajuda', cat: 'farmacia', palavras: ['farmacia', 'remedio', 'medicamento', 'drogaria', 'plantao'] },
  { tipo: 'lugar', grupo: 'ajuda', cat: 'hospital', palavras: ['hospital', 'hospitais', 'pronto socorro', 'pronto atendimento', 'upa'] },
  { tipo: 'lugar', grupo: 'ajuda', cat: 'posto', palavras: ['posto de saude', 'postinho', 'medic', 'consulta', 'ubs', 'clinica', 'vacina', 'exame'] },
  { tipo: 'lugar', grupo: 'ajuda', cat: 'assistencia', palavras: ['cras', 'creas', 'assistencia social', 'beneficio', 'bpc', 'cesta basica', 'auxilio', 'aposentadoria', 'comida'] },
  { tipo: 'lugar', grupo: 'ajuda', cat: 'acolhimento', palavras: ['acolhimento', 'casa de repouso', 'asilo', 'lar de idosos', 'abrigo', 'onde morar', 'casa de apoio', 'cuidador'] },

  { tipo: 'lugar', grupo: 'lazer', cat: 'convivencia', palavras: ['grupo', 'terceira idade', 'melhor idade', 'convivencia', 'fazer amigos', 'amizade', 'amigos', 'baile', 'danc', 'jogar cartas', 'bingo'] },
  { tipo: 'lugar', grupo: 'lazer', cat: 'pracas', palavras: ['praca', 'parque', 'passear', 'caminhar', 'caminhada', 'tomar sol', 'natureza', 'jardim'] },
  { tipo: 'lugar', grupo: 'lazer', cat: 'exercicio', palavras: ['exercicio', 'ginastica', 'academia', 'alongamento', 'esporte', 'hidroginastica', 'yoga', 'ioga', 'pilates', 'atividade fisica'] },
  { tipo: 'lugar', grupo: 'lazer', cat: 'cultura', palavras: ['biblioteca', 'livro', 'leitura', 'museu', 'teatro', 'cinema', 'filme', 'cultura', 'artesanato', 'musica', 'coral', 'show'] },

  { tipo: 'tela', tela: 'lazer', palavras: ['lazer', 'atividade', 'diversao', 'passeio', 'divertir'] },
  { tipo: 'tela', tela: 'ajuda', palavras: ['lugares de ajuda', 'onde encontro ajuda', 'servico'] },
  { tipo: 'tela', tela: 'emergencia', palavras: ['emergencia', 'socorro', 'ajuda', 'urgente', 'numero', 'telefone', 'ligar', 'voltar', 'inicio'] },
];

const SUGESTOES = ['Ambulância', 'Polícia', 'Farmácia', 'Hospital', 'Praça', 'Grupos de idosos'];

const NOMES_TELA = { emergencia: 'Emergência', lazer: 'Lazer e atividades', ajuda: 'Lugares de ajuda' };

/* =========================================================
   Estado e utilidades
   ========================================================= */

const estado = {
  tela: 'emergencia',
};

const $ = (seletor) => document.querySelector(seletor);

function criar(tag, atributos = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [chave, valor] of Object.entries(atributos)) {
    if (valor == null) continue;
    if (chave === 'class') el.className = valor;
    else if (chave === 'text') el.textContent = valor;
    else if (chave.startsWith('on')) el.addEventListener(chave.slice(2), valor);
    else el.setAttribute(chave, valor);
  }
  for (const filho of filhos) if (filho != null) el.append(filho);
  return el;
}

function normalizar(texto) {
  return texto.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* =========================================================
   Voz do aplicativo (ler em voz alta)
   ========================================================= */

// Voz mansa e serena: um pouco mais devagar e num tom levemente mais baixo
const VELOCIDADE_DA_VOZ = 0.85;
const TOM_DA_VOZ = 0.95;

let vozPortugues = null;

// Prefere as vozes em português do Brasil que soam mais naturais no aparelho
function notaDaVoz(v) {
  const idioma = v.lang.replace('_', '-');
  let nota = idioma === 'pt-BR' ? 10 : idioma.startsWith('pt') ? 5 : 0;
  if (/natural|neural|online|enhanced|premium|aprimorad/i.test(v.name)) nota += 4;
  if (/google/i.test(v.name)) nota += 3;
  if (/francisca|thalita|luciana/i.test(v.name)) nota += 2;
  return nota;
}

function escolherVoz() {
  if (!('speechSynthesis' in window)) return;
  const vozes = speechSynthesis.getVoices().filter((v) => notaDaVoz(v) >= 5);
  vozes.sort((a, b) => notaDaVoz(b) - notaDaVoz(a));
  vozPortugues = vozes[0] || null;
}

let falaAtual = null;

// aoTerminar (opcional) roda quando a frase acaba de ser falada
function falar(texto, aoTerminar) {
  cancelarMapaPendente();
  if (!('speechSynthesis' in window)) {
    if (aoTerminar) aoTerminar();
    return;
  }
  speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  fala.rate = VELOCIDADE_DA_VOZ;
  fala.pitch = TOM_DA_VOZ;
  if (vozPortugues) fala.voice = vozPortugues;
  if (aoTerminar) {
    // Só vale para a frase mais recente (outra fala no meio cancela esta)
    fala.onend = () => { if (falaAtual === fala) aoTerminar(); };
    fala.onerror = fala.onend;
  }
  falaAtual = fala;
  speechSynthesis.speak(fala);
}

function pararFala() {
  cancelarMapaPendente();
  falaAtual = null;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

/* =========================================================
   Tela 1: Emergência
   ========================================================= */

function montarEmergencias() {
  const grade = $('#lista-emergencia');
  for (const t of EMERGENCIAS) {
    grade.append(criar('a', {
      class: `cartao-emerg cor-${t.cor}`,
      href: `tel:${t.numero}`,
      'aria-label': `Ligar para ${t.nome}, ${t.numero}. ${t.quando}`,
    },
      criar('span', { class: 'icone', 'aria-hidden': 'true', text: t.icone }),
      criar('span', { class: 'nome', text: t.nome }),
      criar('span', { class: 'numero', text: t.numero }),
      criar('span', { class: 'quando', text: t.quando }),
    ));
  }

  const lista = $('#lista-uteis');
  for (const t of UTEIS) {
    lista.append(criar('a', {
      class: 'cartao-util',
      href: `tel:${t.numero}`,
      'aria-label': `Ligar para ${t.nome}, ${t.numero}. ${t.detalhe}`,
    },
      criar('span', { class: 'icone', 'aria-hidden': 'true', text: t.icone }),
      criar('span', { class: 'textos' },
        criar('span', { class: 'rotulo', text: t.rotulo }),
        criar('span', { class: 'numero', text: t.numero }),
      ),
    ));
  }
}

/* =========================================================
   Telas 2 e 3: Lazer e Ajuda (abrem o Google Maps)
   ========================================================= */

function montarCategorias(grupo) {
  const caixa = document.querySelector(`.categorias[data-grupo="${grupo}"]`);
  for (const c of CATEGORIAS[grupo]) {
    caixa.append(criar('button', {
      class: 'categoria', type: 'button', 'data-cat': c.id, 'aria-pressed': 'false',
      onclick: () => abrirNoMaps(grupo, c.id),
    },
      criar('span', { class: 'categoria-conteudo' },
        criar('span', { class: 'icone', 'aria-hidden': 'true', text: c.icone }),
        criar('span', { class: 'rotulo', text: c.nome }),
      ),
    ));
  }
}

// O Google Maps procura perto da pessoa com a localização do próprio celular (não precisa de chave nem conta)
function linkGoogleMaps(cat) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cat.google} perto de mim`)}`;
}

// Se a voz não avisar que terminou (acontece em alguns celulares), o mapa abre assim mesmo
const ESPERA_MAXIMA_DA_FALA = 6000;
let mapaPendente = null;

function cancelarMapaPendente() {
  clearTimeout(mapaPendente);
  mapaPendente = null;
  $('#aviso-mapa').hidden = true;
}

function abrirNoMaps(grupo, catId) {
  const cat = CATEGORIAS[grupo].find((c) => c.id === catId);
  const link = linkGoogleMaps(cat);
  const oQue = `${cat.nome.toLowerCase()}${cat.agora ? ` ${cat.agora}` : ''}`;

  // Marca a opção escolhida; se o mapa não abrir, é só tocar nela de novo
  document.querySelectorAll(`.categorias[data-grupo="${grupo}"] .categoria`).forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.cat === catId));
  });

  // Primeiro fala a frase inteira, depois abre o mapa
  let abriu = false;
  const abrir = () => {
    if (abriu) return;
    abriu = true;
    clearTimeout(mapaPendente);
    mapaPendente = null;
    location.assign(link);
    setTimeout(() => { $('#aviso-mapa').hidden = true; }, 1500);
  };
  falar(`Abrindo o mapa de ${oQue}.`, abrir);
  if (!abriu) {
    const aviso = $('#aviso-mapa');
    aviso.textContent = `🗺️ Abrindo o mapa de ${oQue}…`;
    aviso.hidden = false;
    mapaPendente = setTimeout(abrir, ESPERA_MAXIMA_DA_FALA);
  }
}

/* =========================================================
   Navegação entre telas
   ========================================================= */

function mostrarTela(nome) {
  estado.tela = nome;
  document.querySelectorAll('.tela').forEach((s) => { s.hidden = s.id !== `tela-${nome}`; });
  document.querySelectorAll('.menu button[data-tela]').forEach((b) => {
    if (b.dataset.tela === nome) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0 });
}

function textoDaTela(nome) {
  if (nome === 'emergencia') {
    const principais = EMERGENCIAS.map((t) => `${t.nome}: ${t.numero}`).join('. ');
    const outros = UTEIS.map((t) => `${t.nome}: ${t.numero}`).join('. ');
    return `Esta é a tela de emergência. Para ligar, é só tocar no desenho. ${principais}. Outros telefones: ${outros}. `
      + 'Se quiser pedir ajuda falando, toque no botão amarelo, escrito Falar.';
  }
  const opcoes = CATEGORIAS[nome].map((c) => c.nome).join(', ');
  return `Esta é a tela de ${NOMES_TELA[nome]}. Toque numa opção, e o mapa abre com os lugares perto de você. As opções são: ${opcoes}.`;
}

/* =========================================================
   Assistente: microfone e chat
   ========================================================= */

const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;
let reconhecimentoAtivo = null;

function assistenteAberto() {
  return !$('#assistente').hidden;
}

function abrirAssistente() {
  $('#assistente').hidden = false;
  $('#assist-acao').replaceChildren();
  pararFala();

  if (!$('#conversa').children.length) {
    mensagem('app', Reconhecimento
      ? 'Olá. Do que você precisa? Pode falar, com calma. Estou ouvindo.'
      : 'Olá. Do que você precisa? Pode escrever aqui embaixo.');
  }
  if (Reconhecimento) {
    ouvir();
  } else {
    $('#assist-falar').hidden = true;
    falar('Olá. Do que você precisa? Pode escrever aqui embaixo.');
    $('#assist-texto').focus();
  }
}

function fecharAssistente() {
  pararDeOuvir();
  $('#assistente').hidden = true;
  $('#btn-mic').focus();
}

function mensagem(quem, texto) {
  const conversa = $('#conversa');
  const bolha = criar('div', { class: `msg msg-${quem}`, text: texto });
  conversa.append(bolha);
  // Mostra só as últimas mensagens, para nunca precisar rolar
  while (conversa.children.length > 4) conversa.firstElementChild.remove();
  return bolha;
}

function responder(texto) {
  mensagem('app', texto);
  falar(texto);
}

function botaoOuvindo(ligado) {
  const botao = $('#assist-falar');
  botao.classList.toggle('ouvindo', ligado);
  botao.querySelector('.btn-falar-texto').textContent = ligado ? 'Ouvindo… toque para parar' : 'Toque e fale';
}

function pararDeOuvir() {
  if (!reconhecimentoAtivo) return;
  reconhecimentoAtivo.cancelado = true;
  reconhecimentoAtivo.abort();
}

function ouvir() {
  if (!Reconhecimento) return;
  if (reconhecimentoAtivo) { reconhecimentoAtivo.stop(); return; }

  pararFala();
  $('#assist-acao').replaceChildren();
  const rec = new Reconhecimento();
  reconhecimentoAtivo = rec;
  rec.lang = 'pt-BR';
  rec.interimResults = true;
  rec.continuous = false;

  let textoFinal = '';
  let ouviuAlgo = false;
  let erro = null;
  const bolha = mensagem('voce msg-ouvindo', '…');
  botaoOuvindo(true);

  rec.onresult = (ev) => {
    let texto = '';
    for (let i = 0; i < ev.results.length; i++) texto += ev.results[i][0].transcript;
    ouviuAlgo = true;
    bolha.textContent = texto;
    if (ev.results[ev.results.length - 1].isFinal) textoFinal = texto;
  };
  rec.onerror = (ev) => { erro = ev.error; };
  rec.onend = () => {
    reconhecimentoAtivo = null;
    botaoOuvindo(false);
    if (!assistenteAberto() || rec.cancelado) { bolha.remove(); return; }

    const texto = (textoFinal || (ouviuAlgo ? bolha.textContent : '')).trim();
    if (texto) {
      bolha.classList.remove('msg-ouvindo');
      bolha.textContent = texto;
      processar(texto, true);
      return;
    }
    bolha.remove();
    if (erro === 'not-allowed' || erro === 'service-not-allowed') {
      responder('Preciso da sua permissão para usar o microfone. Se preferir, pode escrever aqui embaixo.');
    } else if (erro === 'network') {
      responder('Para ouvir a sua voz, eu preciso de internet. Se preferir, pode escrever aqui embaixo.');
    } else if (erro && erro !== 'no-speech' && erro !== 'aborted') {
      responder('Não consegui ouvir agora. Quando quiser, toque no botão amarelo e tente de novo.');
    } else {
      responder('Não consegui ouvir. Quando quiser, toque no botão amarelo e fale de novo, com calma.');
    }
  };

  try {
    rec.start();
  } catch (e) {
    reconhecimentoAtivo = null;
    botaoOuvindo(false);
    bolha.remove();
    responder('Não consegui ligar o microfone. Se preferir, pode escrever aqui embaixo.');
  }
}

function entender(texto) {
  const t = ` ${normalizar(texto)} `;
  const numero = t.match(/ (190|192|193|199|188|100) /);
  if (numero) return { tipo: 'ligar', alvo: TELEFONES.find((x) => x.numero === numero[1]).id };
  return INTENCOES.find((it) => it.palavras.some((p) => t.includes(` ${p}`))) || null;
}

function processar(texto, jaMostrado = false) {
  if (!jaMostrado) {
    pararDeOuvir();
    mensagem('voce', texto);
  }
  const intencao = entender(texto);
  const acao = $('#assist-acao');
  acao.replaceChildren();

  if (!intencao) {
    responder('Desculpe, não entendi bem. Pode falar de novo, com calma. Por exemplo: ambulância, farmácia ou praça.');
    acao.append(criar('div', { class: 'sugestoes' },
      ...SUGESTOES.map((s) => criar('button', { class: 'sugestao', type: 'button', onclick: () => processar(s) }, s)),
    ));
    return;
  }

  if (intencao.tipo === 'ligar') {
    const tel = TELEFONES.find((x) => x.id === intencao.alvo);
    responder(`${tel.acolhida ? tel.acolhida + ' ' : ''}Para ligar para ${tel.fala}, número ${tel.numero}, é só tocar no botão verde.`);
    acao.append(criar('a', { class: 'btn-ligar-grande', href: `tel:${tel.numero}` },
      criar('span', { 'aria-hidden': 'true', text: tel.icone }),
      `Ligar ${tel.numero} · ${tel.nome}`,
    ));
    return;
  }

  if (intencao.tipo === 'lugar') {
    fecharAssistente();
    mostrarTela(intencao.grupo);
    abrirNoMaps(intencao.grupo, intencao.cat);
    return;
  }

  if (intencao.tipo === 'tela') {
    mensagem('app', `Abrindo a tela ${NOMES_TELA[intencao.tela]}.`);
    setTimeout(() => {
      fecharAssistente();
      mostrarTela(intencao.tela);
      falar(textoDaTela(intencao.tela));
    }, 800);
  }
}

/* =========================================================
   Atualizar: puxar a tela para baixo e versão nova automática
   ========================================================= */

const DISTANCIA_PARA_ATUALIZAR = 90; // pixels puxando para baixo

async function atualizarApp() {
  try {
    const registro = await navigator.serviceWorker?.getRegistration();
    await registro?.update();
  } catch (e) { /* sem internet: recarrega com a cópia guardada */ }
  location.reload();
}

// O celular não deixa puxar para atualizar porque a tela não rola; então o app faz isso
function prepararPuxarParaAtualizar() {
  const indicador = $('#puxar');
  let inicio = null;
  let distancia = 0;

  document.addEventListener('touchstart', (ev) => {
    inicio = (ev.touches.length === 1 && !assistenteAberto()) ? ev.touches[0].clientY : null;
    distancia = 0;
  }, { passive: true });

  document.addEventListener('touchmove', (ev) => {
    if (inicio === null) return;
    distancia = ev.touches[0].clientY - inicio;
    if (distancia < 15) {
      indicador.hidden = true;
      return;
    }
    const pronto = distancia >= DISTANCIA_PARA_ATUALIZAR;
    indicador.hidden = false;
    indicador.classList.toggle('pronto', pronto);
    indicador.textContent = pronto ? '🔄 Solte para atualizar' : '⬇️ Puxe para atualizar';
    indicador.style.setProperty('--puxado', `${Math.min(distancia, DISTANCIA_PARA_ATUALIZAR * 1.4) / 2}px`);
  }, { passive: true });

  const soltar = () => {
    if (inicio === null) return;
    inicio = null;
    if (distancia >= DISTANCIA_PARA_ATUALIZAR) {
      indicador.textContent = '🔄 Atualizando…';
      atualizarApp();
    } else {
      indicador.hidden = true;
    }
  };
  document.addEventListener('touchend', soltar);
  document.addEventListener('touchcancel', soltar);
}

// Funciona sem internet depois da primeira visita, e se atualiza sozinho quando há versão nova
function prepararVersaoNova() {
  const permitido = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!('serviceWorker' in navigator) || !permitido) return;

  const jaTinhaVersao = Boolean(navigator.serviceWorker.controller);
  let recarregou = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Chegou versão nova: recarrega, mas nunca no meio de uma conversa ou abrindo o mapa
    if (!jaTinhaVersao || recarregou || assistenteAberto() || mapaPendente) return;
    recarregou = true;
    location.reload();
  });

  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((registro) => {
    // Ao voltar para o app (ex.: depois do mapa), confere se há versão nova
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') registro.update().catch(() => {});
    });
  }).catch(() => {});
}

/* =========================================================
   Início
   ========================================================= */

function iniciar() {
  montarEmergencias();
  montarCategorias('lazer');
  montarCategorias('ajuda');

  $('#btn-ouvir').addEventListener('click', () => falar(textoDaTela(estado.tela)));

  document.querySelectorAll('.menu button[data-tela]').forEach((b) => {
    b.addEventListener('click', () => { pararFala(); mostrarTela(b.dataset.tela); });
  });

  $('#btn-mic').addEventListener('click', abrirAssistente);
  $('#assist-fechar').addEventListener('click', fecharAssistente);
  $('#assist-falar').addEventListener('click', ouvir);
  $('#assistente').addEventListener('click', (ev) => { if (ev.target.id === 'assistente') fecharAssistente(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && assistenteAberto()) fecharAssistente(); });

  $('#assist-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const campo = $('#assist-texto');
    const texto = campo.value.trim();
    if (!texto) return;
    campo.value = '';
    pararDeOuvir();
    processar(texto);
  });

  window.addEventListener('pageshow', (ev) => { if (ev.persisted) $('#aviso-mapa').hidden = true; });

  if ('speechSynthesis' in window) {
    escolherVoz();
    speechSynthesis.addEventListener?.('voiceschanged', escolherVoz);
  }

  prepararPuxarParaAtualizar();
  prepararVersaoNova();
}

iniciar();
