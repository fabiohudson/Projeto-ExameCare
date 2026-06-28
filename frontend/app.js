const TOKEN_STORAGE_KEY = 'examecare_token';
const PREFERENCES_STORAGE_KEY = 'examecare_preferences';

function getApiBase() {
  const configuredUrl = window.EXAMECARE_CONFIG?.apiUrl?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  const isLocalHost = ['localhost', '127.0.0.1'].includes(
    window.location.hostname,
  );

  if (isLocalHost) {
    return 'http://localhost:3000';
  }

  if (window.location.protocol !== 'file:') {
    return window.location.origin;
  }

  return 'http://localhost:3000';
}

const state = {
  token: localStorage.getItem(TOKEN_STORAGE_KEY) || '',
  apiBase: getApiBase(),
  tab: 'dashboard',
  authMode: 'login',
  data: {
    dashboard: null,
    idosos: [],
    exames: [],
    consultas: [],
    perfil: null,
  },
  loading: false,
  message: null,
  modal: null,
};

const tabs = [
  ['dashboard', 'Painel'],
  ['idosos', 'Idosos'],
  ['exames', 'Exames'],
  ['consultas', 'Consultas'],
  ['historico', 'Histórico'],
  ['notificacoes', 'Alertas'],
  ['perfil', 'Perfil'],
];

const app = document.querySelector('#app');

function icon(name) {
  const icons = {
    plus: '+',
    close: 'x',
    check: '✓',
    cancel: '!',
    save: '✓',
    edit: '✎',
    trash: '×',
    logout: '↳',
  };

  return `<span aria-hidden="true">${icons[name] || ''}</span>`;
}

function setMessage(type, text) {
  state.message = { type, text };
  render();
}

function clearMessage() {
  state.message = null;
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function requiredNumber(value) {
  return Number(value);
}

function toInputDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function todayInputDate() {
  return toInputDate(new Date());
}

function tomorrowInputDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toInputDate(date);
}

function isRealDate(value) {
  if (!value) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && toInputDate(date) === value;
}

function isTodayOrPast(value) {
  return isRealDate(value) && value <= todayInputDate();
}

function isTomorrowOrFuture(value) {
  return isRealDate(value) && value >= tomorrowInputDate();
}

function validatePattern(value, pattern) {
  return pattern.test((value || '').trim());
}

function validatePessoa(values) {
  if (!validatePattern(values.nome, /^[A-Za-zÀ-ÿ\s'.-]{3,}$/)) {
    throw new Error('Informe um nome real, usando apenas letras.');
  }

  if (!validatePattern(values.cpf, /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
    throw new Error('Informe um CPF real com 11 números.');
  }

  if (!isTodayOrPast(values.dataNascimento)) {
    throw new Error('Informe uma data de nascimento real no formato dd/mm/aaaa.');
  }

  if (values.telefone && !validatePattern(values.telefone, /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)) {
    throw new Error('Informe um número de telefone real.');
  }
}

function validateConsultaDate(value) {
  if (!isTomorrowOrFuture(value)) {
    throw new Error('A consulta deve ser marcada pelo menos 1 dia depois da data atual.');
  }
}

function formatDate(value) {
  if (!value) {
    return 'Sem data';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function calculateAge(value) {
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) {
    return '';
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return `${age} anos`;
}

function applyPreferences() {
  JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) || '{}');
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${state.apiBase}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique se o sistema está em execução.',
    );
  }

  if (!response.ok) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : payload?.message || 'Não foi possível concluir a operação.';
    throw new Error(message);
  }

  return payload;
}

async function loadData() {
  if (!state.token) {
    return;
  }

  state.loading = true;
  render();

  try {
    const [dashboard, idosos, exames, consultas, perfil] = await Promise.all([
      api('/dashboard'),
      api('/idosos'),
      api('/exames'),
      api('/consultas'),
      api('/perfil'),
    ]);

    state.data = { dashboard, idosos, exames, consultas, perfil };
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(perfil || {}));
    applyPreferences();
    clearMessage();
  } catch (error) {
    if (/unauthorized|jwt|token|credenciais/i.test(error.message)) {
      logout(false);
      setMessage('error', 'Sessão expirada. Entre novamente.');
      return;
    }

    state.message = { type: 'error', text: error.message };
  } finally {
    state.loading = false;
    render();
  }
}

async function handleAuth(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = formToObject(form);

  try {
    if (state.authMode === 'register') {
      if (values.senha !== values.confirmarSenha) {
        throw new Error('As senhas informadas não coincidem.');
      }

      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nome: values.nome,
          email: values.email,
          senha: values.senha,
          aceitouLgpd: values.aceitouLgpd === 'on',
        }),
      });

      state.authMode = 'login';
      setMessage('success', 'Cadastro criado. Entre com seu e-mail e senha.');
      return;
    }

    if (state.authMode === 'forgot') {
      const result = await api('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: values.email }),
      });
      setMessage('success', result.message || 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.');
      return;
    }

    if (state.authMode === 'reset') {
      await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: values.token,
          novaSenha: values.novaSenha,
        }),
      });
      state.authMode = 'login';
      setMessage('success', 'Senha redefinida. Entre novamente.');
      return;
    }

    const result = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: values.email, senha: values.senha }),
    });

    state.token = result.access_token;
    localStorage.setItem(TOKEN_STORAGE_KEY, state.token);
    await loadData();
  } catch (error) {
    setMessage('error', error.message);
  }
}

function logout(shouldRender = true) {
  state.token = '';
  state.data = {
    dashboard: null,
    idosos: [],
    exames: [],
    consultas: [],
    perfil: null,
  };
  localStorage.removeItem(TOKEN_STORAGE_KEY);

  if (shouldRender) {
    render();
  }
}

function openModal(type, item = null) {
  state.modal = { type, item };
  render();
}

function closeModal() {
  state.modal = null;
  render();
}

async function submitIdoso(event, idoso) {
  event.preventDefault();
  const values = formToObject(event.currentTarget);
  validatePessoa(values);
  const payload = {
    nome: values.nome,
    cpf: values.cpf,
    dataNascimento: values.dataNascimento,
    sexo: values.sexo,
    telefone: values.telefone || undefined,
    observacoes: values.observacoes || undefined,
  };

  await saveEntity(idoso ? `/idosos/${idoso.id}` : '/idosos', idoso ? 'PATCH' : 'POST', payload);
}

async function submitExame(event, exame) {
  event.preventDefault();
  const values = formToObject(event.currentTarget);
  const payload = {
    tipo: values.tipo,
    especialidade: values.especialidade,
    local: values.local,
    data: values.data,
    observacoes: values.observacoes || undefined,
    idosoId: requiredNumber(values.idosoId),
  };

  await saveEntity(exame ? `/exames/${exame.id}` : '/exames', exame ? 'PATCH' : 'POST', payload);
}

async function submitConsulta(event, consulta) {
  event.preventDefault();
  const values = formToObject(event.currentTarget);
  validateConsultaDate(values.data);
  const payload = {
    medico: values.medico,
    especialidade: values.especialidade,
    local: values.local,
    data: values.data,
    idosoId: requiredNumber(values.idosoId),
  };

  await saveEntity(
    consulta ? `/consultas/${consulta.id}` : '/consultas',
    consulta ? 'PATCH' : 'POST',
    payload,
  );
}

async function submitResultado(event, exame) {
  event.preventDefault();
  const values = formToObject(event.currentTarget);
  await saveEntity(`/resultados/${exame.id}`, 'POST', {
    nomeResultado: values.nomeResultado,
    arquivoUrl: values.arquivoUrl || undefined,
    resumo: values.resumo || undefined,
  });
}

async function submitPerfil(event) {
  event.preventDefault();
  const values = formToObject(event.currentTarget);
  if (!validatePattern(values.nome, /^[A-Za-zÀ-ÿ\s'.-]{3,}$/)) {
    throw new Error('Informe um nome real, usando apenas letras.');
  }

  if (values.telefone && !validatePattern(values.telefone, /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)) {
    throw new Error('Informe um número de telefone real.');
  }

  await saveEntity('/perfil', 'PATCH', {
    nome: values.nome,
    telefone: values.telefone || undefined,
    endereco: values.endereco || undefined,
    alergias: values.alergias || undefined,
    observacoesImportantes:
      values.observacoesImportantes || undefined,
  });
}

async function saveEntity(path, method, payload) {
  try {
    await api(path, {
      method,
      body: JSON.stringify(payload),
    });
    closeModal();
    await loadData();
    setMessage('success', 'Operação concluída com sucesso.');
  } catch (error) {
    setMessage('error', error.message);
  }
}

async function action(path, method = 'PATCH') {
  try {
    await api(path, { method });
    await loadData();
    setMessage('success', 'Status atualizado.');
  } catch (error) {
    setMessage('error', error.message);
  }
}

async function removeEntity(path) {
  if (!window.confirm('Confirma a exclusão deste registro?')) {
    return;
  }

  try {
    await api(path, { method: 'DELETE' });
    await loadData();
    setMessage('success', 'Registro removido.');
  } catch (error) {
    setMessage('error', error.message);
  }
}

function renderMessage() {
  if (!state.message) {
    return '';
  }

  return `<div class="message show ${state.message.type}" role="status">${state.message.text}</div>`;
}

function renderAuth() {
  const isLogin = state.authMode === 'login';
  const isRegister = state.authMode === 'register';
  const isForgot = state.authMode === 'forgot';
  const isReset = state.authMode === 'reset';

  return `
    <main class="auth-layout">
      <section class="auth-hero">
        <div class="brand-mark">
          <span class="brand-icon">+</span>
          <span>ExameCare</span>
        </div>
        <div>
          <h1>ExameCare</h1>
          <p>Organize idosos, exames, consultas, resultados e alertas em uma experiência simples para familiares cuidadores.</p>
        </div>
      </section>
      <section class="auth-panel">
        <div class="panel">
          <div class="tabs" role="tablist">
            <button class="${isLogin ? 'active' : ''}" data-auth-mode="login">Entrar</button>
            <button class="${isRegister ? 'active' : ''}" data-auth-mode="register">Cadastro</button>
            <button class="${isForgot || isReset ? 'active' : ''}" data-auth-mode="forgot">Senha</button>
          </div>
          <h2 style="margin-top:18px">${isRegister ? 'Criar conta' : isForgot ? 'Recuperar senha' : isReset ? 'Redefinir senha' : 'Acessar conta'}</h2>
          <p>${isRegister ? 'Aceite a LGPD para criar o acesso.' : isForgot ? 'Informe seu e-mail para receber as instruções de recuperação.' : isReset ? 'Informe o código recebido para definir uma nova senha.' : 'Entre para gerenciar a rotina médica dos idosos.'}</p>
          ${renderMessage()}
          <form class="form-grid" id="authForm">
            ${isRegister ? '<div class="field"><label for="nome">Nome</label><input id="nome" name="nome" autocomplete="name" required /></div>' : ''}
            ${(isLogin || isRegister || isForgot) ? '<div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="email" required /></div>' : ''}
            ${(isLogin || isRegister) ? '<div class="field"><label for="senha">Senha</label><input id="senha" name="senha" type="password" minlength="8" autocomplete="current-password" required /></div>' : ''}
            ${isRegister ? '<div class="field"><label for="confirmarSenha">Confirmar senha</label><input id="confirmarSenha" name="confirmarSenha" type="password" minlength="8" required /></div><label class="checkline"><input type="checkbox" name="aceitouLgpd" required /> <span>Li e aceito o uso dos dados conforme a LGPD para gerenciamento de saúde.</span></label>' : ''}
            ${isReset ? '<div class="field"><label for="token">Código de recuperação</label><input id="token" name="token" required /></div><div class="field"><label for="novaSenha">Nova senha</label><input id="novaSenha" name="novaSenha" type="password" minlength="8" required /></div>' : ''}
            <div class="btn-row">
              <button class="btn" type="submit">${isRegister ? 'Cadastrar' : isForgot ? 'Enviar instruções' : isReset ? 'Redefinir' : 'Entrar'}</button>
              ${isForgot ? '<button class="btn secondary" type="button" data-auth-mode="reset">Tenho código</button>' : ''}
              ${!isLogin ? '<button class="btn ghost" type="button" data-auth-mode="login">Voltar</button>' : ''}
            </div>
          </form>
        </div>
      </section>
    </main>
  `;
}

function renderShell() {
  const perfil = state.data.perfil || {};

  return `
    <div class="layout">
      <aside class="sidebar">
        <div class="brand-mark">
          <span class="brand-icon">+</span>
          <span>ExameCare</span>
        </div>
        <nav class="nav-tabs" aria-label="Navegação principal">
          ${tabs
            .map(
              ([id, label]) =>
                `<button class="${state.tab === id ? 'active' : ''}" data-tab="${id}">${label}</button>`,
            )
            .join('')}
        </nav>
      </aside>
      <main class="content">
        <header class="topbar">
          <div class="section-title">
            <p class="eyebrow">${perfil.nome || 'Familiar responsável'}</p>
            <h1>${titleForTab()}</h1>
            <p>${subtitleForTab()}</p>
          </div>
          <div class="btn-row">
            <button class="btn secondary" type="button" data-refresh>${state.loading ? 'Atualizando...' : 'Atualizar'}</button>
            <button class="btn ghost" type="button" data-logout>${icon('logout')} Sair</button>
          </div>
        </header>
        ${renderMessage()}
        ${state.loading ? '<div class="empty-state"><h3>Carregando dados...</h3><p>Buscando informações atualizadas.</p></div>' : renderCurrentTab()}
      </main>
      ${renderModal()}
    </div>
  `;
}

function titleForTab() {
  return {
    dashboard: 'Painel de cuidados',
    idosos: 'Idosos cadastrados',
    exames: 'Exames',
    consultas: 'Consultas',
    historico: 'Histórico médico',
    notificacoes: 'Alertas e lembretes',
    perfil: 'Dados pessoais',
  }[state.tab];
}

function subtitleForTab() {
  return {
    dashboard: 'Resumo da semana, pendências e acompanhamentos prioritários.',
    idosos: 'Dados pessoais usados como base para exames e consultas.',
    exames: 'Agende, edite, cancele, conclua e registre resultados.',
    consultas: 'Gerencie a agenda médica dos idosos acompanhados.',
    historico: 'Veja exames e consultas por idoso em ordem cronológica.',
    notificacoes: 'Lista de eventos próximos e resultados pendentes.',
    perfil: 'Mantenha seus dados pessoais e informações importantes atualizados.',
  }[state.tab];
}

function renderCurrentTab() {
  return {
    dashboard: renderDashboard,
    idosos: renderIdosos,
    exames: renderExames,
    consultas: renderConsultas,
    historico: renderHistorico,
    notificacoes: renderNotificacoes,
    perfil: renderPerfil,
  }[state.tab]();
}

function renderDashboard() {
  const d = state.data.dashboard || {};
  const n = d.notificacoes || {};

  return `
    <section class="cards-grid">
      ${metric('Idosos', d.idosos || 0)}
      ${metric('Exames hoje', d.examesHoje || 0)}
      ${metric('Consultas hoje', d.consultasHoje || 0)}
      ${metric('Alertas', n.total || 0)}
    </section>
    <section class="data-grid" style="margin-top:18px">
      ${noticeCard('Exames próximos', n.examesProximos || 0, 'agenda dos próximos 7 dias')}
      ${noticeCard('Consultas próximas', n.consultasProximas || 0, 'compromissos próximos')}
      ${noticeCard('Resultados pendentes', n.examesSemResultado || 0, 'exames realizados sem laudo')}
    </section>
  `;
}

function metric(label, value) {
  return `<article class="card metric-card"><span>${label}</span><strong>${value}</strong></article>`;
}

function noticeCard(title, count, description) {
  return `<article class="card"><span class="status ${count ? 'alerta' : ''}">${count} alerta(s)</span><h3>${title}</h3><p class="item-meta">${description}</p></article>`;
}

function renderIdosos() {
  return `
    <div class="toolbar">
      <button class="btn" type="button" data-modal="idoso">${icon('plus')} Novo idoso</button>
    </div>
    <section class="data-grid">
      ${state.data.idosos.length ? state.data.idosos.map(renderIdosoCard).join('') : empty('Nenhum idoso cadastrado', 'Cadastre o primeiro idoso para liberar exames, consultas e histórico.')}
    </section>
  `;
}

function renderIdosoCard(idoso) {
  return `
    <article class="card item-card">
      <div class="item-head">
        <h3>${idoso.nome}</h3>
        <span class="status">${calculateAge(idoso.dataNascimento)}</span>
      </div>
      <div class="item-meta">
        <span>CPF: ${idoso.cpf}</span>
        <span>Nascimento: ${formatDate(idoso.dataNascimento)}</span>
        <span>Telefone: ${idoso.telefone || 'Nao informado'}</span>
        <span>${idoso.observacoes || 'Sem observacoes'}</span>
      </div>
      <div class="btn-row">
        <button class="btn secondary small" data-modal="idoso" data-id="${idoso.id}">${icon('edit')} Editar</button>
        <button class="btn danger small" data-delete="/idosos/${idoso.id}">${icon('trash')} Excluir</button>
      </div>
    </article>
  `;
}

function renderExames() {
  return `
    <div class="toolbar">
      <button class="btn" type="button" data-modal="exame">${icon('plus')} Novo exame</button>
    </div>
    <section class="data-grid">
      ${state.data.exames.length ? state.data.exames.map(renderExameCard).join('') : empty('Nenhum exame agendado', 'Crie um agendamento para acompanhar status e resultados.')}
    </section>
  `;
}

function renderExameCard(exame) {
  return `
    <article class="card item-card">
      <div class="item-head">
        <h3>${exame.tipo}</h3>
        <span class="status ${String(exame.status).toLowerCase()}">${exame.status}</span>
      </div>
      <div class="item-meta">
        <span>Idoso: ${exame.idoso?.nome || 'Nao informado'}</span>
        <span>Especialidade: ${exame.especialidade}</span>
        <span>Local: ${exame.local}</span>
        <span>Data: ${formatDate(exame.data)}</span>
        <span>Resultado: ${exame.resultado?.nomeResultado || 'Pendente'}</span>
      </div>
      <div class="btn-row">
        <button class="btn secondary small" data-modal="exame" data-id="${exame.id}">${icon('edit')} Editar</button>
        <button class="btn secondary small" data-action="/exames/${exame.id}/realizar">${icon('check')} Realizar</button>
        <button class="btn secondary small" data-modal="resultado" data-id="${exame.id}">Resultado</button>
        <button class="btn secondary small" data-action="/exames/${exame.id}/cancelar">${icon('cancel')} Cancelar</button>
        <button class="btn danger small" data-delete="/exames/${exame.id}">${icon('trash')} Excluir</button>
      </div>
    </article>
  `;
}

function renderConsultas() {
  return `
    <div class="toolbar">
      <button class="btn" type="button" data-modal="consulta">${icon('plus')} Nova consulta</button>
    </div>
    <section class="data-grid">
      ${state.data.consultas.length ? state.data.consultas.map(renderConsultaCard).join('') : empty('Nenhuma consulta agendada', 'Adicione consultas para manter a rotina organizada.')}
    </section>
  `;
}

function renderConsultaCard(consulta) {
  return `
    <article class="card item-card">
      <div class="item-head">
        <h3>${consulta.especialidade}</h3>
        <span class="status ${String(consulta.status).toLowerCase()}">${consulta.status}</span>
      </div>
      <div class="item-meta">
        <span>Idoso: ${consulta.idoso?.nome || 'Nao informado'}</span>
        <span>Medico: ${consulta.medico}</span>
        <span>Local: ${consulta.local}</span>
        <span>Data: ${formatDate(consulta.data)}</span>
      </div>
      <div class="btn-row">
        <button class="btn secondary small" data-modal="consulta" data-id="${consulta.id}">${icon('edit')} Editar</button>
        <button class="btn secondary small" data-action="/consultas/${consulta.id}/realizar">${icon('check')} Realizar</button>
        <button class="btn secondary small" data-action="/consultas/${consulta.id}/cancelar">${icon('cancel')} Cancelar</button>
        <button class="btn danger small" data-delete="/consultas/${consulta.id}">${icon('trash')} Excluir</button>
      </div>
    </article>
  `;
}

function renderHistorico() {
  if (!state.data.idosos.length) {
    return empty('Historico indisponivel', 'Cadastre um idoso para consultar o historico.');
  }

  const selectedId = state.selectedHistoricoId || state.data.idosos[0].id;
  const idoso = state.data.idosos.find((item) => item.id === Number(selectedId)) || state.data.idosos[0];
  const exames = state.data.exames.filter((exame) => exame.idosoId === idoso.id);
  const consultas = state.data.consultas.filter((consulta) => consulta.idosoId === idoso.id);
  const items = [
    ...exames.map((item) => ({ type: 'exame', date: item.data, title: item.tipo, meta: item.status })),
    ...consultas.map((item) => ({ type: 'consulta', date: item.data, title: item.especialidade, meta: item.status })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return `
    <div class="toolbar">
      <label class="field" style="min-width:260px">
        <span>Idoso</span>
        <select data-history-select>
          ${state.data.idosos.map((item) => `<option value="${item.id}" ${item.id === idoso.id ? 'selected' : ''}>${item.nome}</option>`).join('')}
        </select>
      </label>
    </div>
    <section class="history-list">
      ${items.length ? items.map((item) => `<article class="timeline-item ${item.type}"><strong>${item.title}</strong><div class="item-meta"><span>${item.type === 'exame' ? 'Exame' : 'Consulta'} - ${item.meta}</span><span>${formatDate(item.date)}</span></div></article>`).join('') : empty('Sem historico para este idoso', 'Exames e consultas aparecerao aqui conforme forem cadastrados.')}
    </section>
  `;
}

function renderNotificacoes() {
  const today = new Date();
  const inSevenDays = new Date();
  inSevenDays.setDate(today.getDate() + 7);

  const upcomingExams = state.data.exames.filter((exame) => {
    const date = new Date(exame.data);
    return exame.status === 'AGENDADO' && date >= today && date <= inSevenDays;
  });

  const upcomingConsultas = state.data.consultas.filter((consulta) => {
    const date = new Date(consulta.data);
    return consulta.status === 'AGENDADA' && date >= today && date <= inSevenDays;
  });

  const pendingResults = state.data.exames.filter(
    (exame) => exame.status === 'REALIZADO' && !exame.resultado,
  );

  const alerts = [
    ...upcomingExams.map((item) => ({
      title: `Exame próximo: ${item.tipo}`,
      detail: `${item.idoso?.nome || 'Idoso'} em ${formatDate(item.data)}`,
    })),
    ...upcomingConsultas.map((item) => ({
      title: `Consulta próxima: ${item.especialidade}`,
      detail: `${item.idoso?.nome || 'Idoso'} em ${formatDate(item.data)}`,
    })),
    ...pendingResults.map((item) => ({
      title: `Resultado pendente: ${item.tipo}`,
      detail: `${item.idoso?.nome || 'Idoso'} precisa de registro de resultado`,
    })),
  ];

  return `
    <section class="data-grid">
      ${alerts.length ? alerts.map((alert) => `<article class="card item-card"><span class="status alerta">Alerta</span><h3>${alert.title}</h3><p class="item-meta">${alert.detail}</p></article>`).join('') : empty('Nenhum alerta no momento', 'Eventos próximos e resultados pendentes aparecerão aqui.')}
    </section>
  `;
}

function renderPerfil() {
  const perfil = state.data.perfil || {};

  return `
    <section class="card">
      <form class="form-grid two" id="perfilForm">
        <div class="field"><label for="nome">Nome completo</label><input id="nome" name="nome" value="${perfil.nome || ''}" pattern="[A-Za-zÀ-ÿ\\s'.-]{3,}" autocomplete="name" required /></div>
        <div class="field"><label for="telefone">Número</label><input id="telefone" name="telefone" value="${perfil.telefone || ''}" inputmode="tel" autocomplete="tel" placeholder="(61) 99999-9999" pattern="\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}" /></div>
        <div class="field"><label for="endereco">Endereço</label><input id="endereco" name="endereco" value="${perfil.endereco || ''}" autocomplete="street-address" /></div>
        <div class="field"><label for="alergias">Alergias</label><input id="alergias" name="alergias" value="${perfil.alergias || ''}" /></div>
        <div class="field"><label for="observacoesImportantes">Observações importantes</label><textarea id="observacoesImportantes" name="observacoesImportantes">${perfil.observacoesImportantes || ''}</textarea></div>
        <div class="btn-row"><button class="btn" type="submit">${icon('save')} Salvar dados</button></div>
      </form>
    </section>
  `;
}

function empty(title, text) {
  return `<div class="empty-state"><h3>${title}</h3><p>${text}</p></div>`;
}

function renderModal() {
  if (!state.modal) {
    return '';
  }

  const { type, item } = state.modal;
  const titles = {
    idoso: item ? 'Editar idoso' : 'Novo idoso',
    exame: item ? 'Editar exame' : 'Novo exame',
    consulta: item ? 'Editar consulta' : 'Nova consulta',
    resultado: 'Registrar resultado',
  };

  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true">
      <div class="modal">
        <div class="modal-title">
          <h2>${titles[type]}</h2>
          <button class="btn secondary small" type="button" data-close-modal>${icon('close')}</button>
        </div>
        <div class="modal-body">
          ${renderModalBody(type, item)}
        </div>
      </div>
    </div>
  `;
}

function renderModalBody(type, item) {
  if (type === 'idoso') {
    return `
      <form class="form-grid two" id="idosoForm">
        <div class="field"><label>Nome</label><input name="nome" value="${item?.nome || ''}" pattern="[A-Za-zÀ-ÿ\\s'.-]{3,}" autocomplete="name" required /></div>
        <div class="field"><label>CPF</label><input name="cpf" value="${item?.cpf || ''}" inputmode="numeric" placeholder="000.000.000-00" pattern="\\d{11}|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}" required /></div>
        <div class="field"><label>Data de nascimento</label><input name="dataNascimento" type="date" value="${toInputDate(item?.dataNascimento)}" max="${todayInputDate()}" required /></div>
        <div class="field"><label>Sexo</label><select name="sexo" required><option value="">Selecione</option><option value="Feminino" ${item?.sexo === 'Feminino' ? 'selected' : ''}>Feminino</option><option value="Masculino" ${item?.sexo === 'Masculino' ? 'selected' : ''}>Masculino</option><option value="Outro" ${item?.sexo === 'Outro' ? 'selected' : ''}>Outro</option></select></div>
        <div class="field"><label>Telefone</label><input name="telefone" value="${item?.telefone || ''}" inputmode="tel" placeholder="(61) 99999-9999" pattern="\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}" /></div>
        <div class="field"><label>Observações</label><textarea name="observacoes">${item?.observacoes || ''}</textarea></div>
        <div class="btn-row"><button class="btn" type="submit">${icon('save')} Salvar</button></div>
      </form>
    `;
  }

  if (type === 'exame') {
    return `
      <form class="form-grid two" id="exameForm">
        ${selectIdoso(item?.idosoId)}
        <div class="field"><label>Tipo</label><input name="tipo" value="${item?.tipo || ''}" required /></div>
        <div class="field"><label>Especialidade</label><input name="especialidade" value="${item?.especialidade || ''}" required /></div>
        <div class="field"><label>Local</label><input name="local" value="${item?.local || ''}" required /></div>
        <div class="field"><label>Data</label><input name="data" type="date" value="${toInputDate(item?.data)}" min="${todayInputDate()}" required /></div>
        <div class="field"><label>Observações</label><textarea name="observacoes">${item?.observacoes || ''}</textarea></div>
        <div class="btn-row"><button class="btn" type="submit">${icon('save')} Salvar</button></div>
      </form>
    `;
  }

  if (type === 'consulta') {
    return `
      <form class="form-grid two" id="consultaForm">
        ${selectIdoso(item?.idosoId)}
        <div class="field"><label>Médico</label><input name="medico" value="${item?.medico || ''}" pattern="[A-Za-zÀ-ÿ\\s'.-]{3,}" required /></div>
        <div class="field"><label>Especialidade</label><input name="especialidade" value="${item?.especialidade || ''}" required /></div>
        <div class="field"><label>Local</label><input name="local" value="${item?.local || ''}" required /></div>
        <div class="field"><label>Data</label><input name="data" type="date" value="${toInputDate(item?.data)}" min="${tomorrowInputDate()}" required /></div>
        <div class="btn-row"><button class="btn" type="submit">${icon('save')} Salvar</button></div>
      </form>
    `;
  }

  return `
    <form class="form-grid" id="resultadoForm">
      <div class="field"><label>Nome do resultado</label><input name="nomeResultado" value="${item?.resultado?.nomeResultado || ''}" required /></div>
      <div class="field"><label>URL do arquivo</label><input name="arquivoUrl" value="${item?.resultado?.arquivoUrl || ''}" /></div>
      <div class="field"><label>Resumo</label><textarea name="resumo">${item?.resultado?.resumo || ''}</textarea></div>
      <div class="btn-row"><button class="btn" type="submit">${icon('save')} Registrar</button></div>
    </form>
  `;
}

function selectIdoso(selectedId) {
  return `
    <div class="field">
      <label>Idoso</label>
      <select name="idosoId" required>
        <option value="">Selecione</option>
        ${state.data.idosos.map((idoso) => `<option value="${idoso.id}" ${idoso.id === selectedId ? 'selected' : ''}>${idoso.nome}</option>`).join('')}
      </select>
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll('[data-auth-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      state.authMode = button.dataset.authMode;
      clearMessage();
      render();
    });
  });

  document.querySelector('#authForm')?.addEventListener('submit', handleAuth);

  document.querySelectorAll('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.tab = button.dataset.tab;
      clearMessage();
      render();
    });
  });

  document.querySelector('[data-refresh]')?.addEventListener('click', loadData);
  document.querySelector('[data-logout]')?.addEventListener('click', () => logout());
  document.querySelector('[data-close-modal]')?.addEventListener('click', closeModal);

  document.querySelectorAll('[data-modal]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.modal;
      const id = Number(button.dataset.id);
      const collections = {
        idoso: state.data.idosos,
        exame: state.data.exames,
        consulta: state.data.consultas,
        resultado: state.data.exames,
      };
      openModal(type, id ? collections[type].find((item) => item.id === id) : null);
    });
  });

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => action(button.dataset.action));
  });

  document.querySelectorAll('[data-delete]').forEach((button) => {
    button.addEventListener('click', () => removeEntity(button.dataset.delete));
  });

  document.querySelector('[data-history-select]')?.addEventListener('change', (event) => {
    state.selectedHistoricoId = Number(event.target.value);
    render();
  });

  const idoso = state.modal?.type === 'idoso' ? state.modal.item : null;
  const exame = state.modal?.type === 'exame' ? state.modal.item : null;
  const consulta = state.modal?.type === 'consulta' ? state.modal.item : null;
  const resultado = state.modal?.type === 'resultado' ? state.modal.item : null;

  document.querySelector('#idosoForm')?.addEventListener('submit', (event) => submitIdoso(event, idoso));
  document.querySelector('#exameForm')?.addEventListener('submit', (event) => submitExame(event, exame));
  document.querySelector('#consultaForm')?.addEventListener('submit', (event) => submitConsulta(event, consulta));
  document
    .querySelector('#resultadoForm')
    ?.addEventListener('submit', (event) => submitResultado(event, resultado));
  document.querySelector('#perfilForm')?.addEventListener('submit', submitPerfil);
}

function render() {
  app.innerHTML = state.token ? renderShell() : renderAuth();
  bindEvents();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  });
}

applyPreferences();
render();

if (state.token) {
  loadData();
}
