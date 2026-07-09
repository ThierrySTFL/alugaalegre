// api.js — módulo único com TODAS as chamadas ao backend FastAPI.
// Uso no app: window.api.login(...), window.api.listarImoveis(...), etc.
//
// Autenticação: o backend emite um JWT próprio (não é Supabase Auth). O token
// fica guardado no localStorage e é enviado no header Authorization: Bearer.
// A persistência/restauração da sessão no app é o próximo item da Etapa 3;
// aqui só deixamos setToken/clearToken prontos.

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const TOKEN_KEY = "alugaalegre_token";

let _token = localStorage.getItem(TOKEN_KEY) || null;

function setToken(token) {
  _token = token || null;
  if (_token) localStorage.setItem(TOKEN_KEY, _token);
  else localStorage.removeItem(TOKEN_KEY);
}

function getToken() {
  return _token;
}

// Wrapper único de fetch: monta a URL, anexa o token, serializa o corpo e
// normaliza os erros do FastAPI ({ "detail": "..." }) em Error(message).
async function request(method, path, { body, auth = false, query } = {}) {
  const url = new URL(API_URL + path);
  if (query) {
    for (const [chave, valor] of Object.entries(query)) {
      if (valor !== undefined && valor !== null && valor !== "") {
        url.searchParams.set(chave, valor);
      }
    }
  }

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    if (!_token) throw new Error("Você precisa estar autenticado.");
    headers["Authorization"] = `Bearer ${_token}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. A API está no ar?");
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = data && (data.detail ?? data.message);
    const msg =
      typeof detail === "string"
        ? detail
        : detail
          ? JSON.stringify(detail)
          : `Erro ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

const api = {
  // --- sessão (token) ---
  setToken,
  getToken,
  clearToken: () => setToken(null),

  // --- auth ---
  cadastro: (nome, email, senha) =>
    request("POST", "/auth/cadastro", { body: { nome, email, senha } }),
  login: (email, senha) => request("POST", "/auth/login", { body: { email, senha } }),
  // Quem sou eu (a partir do token): { idpessoa, nome, email, is_locador }.
  me: () => request("GET", "/auth/me", { auth: true }),

  // --- perfil ---
  // Transforma a pessoa em locador (CPF + telefone).
  completarPerfil: (cpf, telefone) =>
    request("POST", "/usuarios/completar-perfil", { body: { cpf, telefone }, auth: true }),

  // --- imóveis (público) ---
  // filtros: { cidade, tipo, quartos, preco_min, preco_max, busca }
  listarImoveis: (filtros = {}) => request("GET", "/imoveis", { query: filtros }),
  detalheImovel: (id) => request("GET", `/imoveis/${id}`),

  // --- imóveis (autenticado) ---
  criarImovel: (dados) => request("POST", "/imoveis", { body: dados, auth: true }),
  editarImovel: (id, dados) => request("PATCH", `/imoveis/${id}`, { body: dados, auth: true }),
  excluirImovel: (id) => request("DELETE", `/imoveis/${id}`, { auth: true }),
  // Registra o interesse e devolve { whatsapp } do locador.
  contatarImovel: (id) => request("POST", `/imoveis/${id}/contato`, { auth: true }),

  // --- painel do locador ---
  meusImoveis: () => request("GET", "/meus-imoveis", { auth: true }),
  meusContatos: () => request("GET", "/meus-contatos", { auth: true }),

  // --- favoritos ---
  // GET devolve a lista de ids favoritados; POST alterna e devolve { idanuncio, favoritado }.
  listarFavoritos: () => request("GET", "/favoritos", { auth: true }),
  toggleFavorito: (idanuncio) =>
    request("POST", "/favoritos", { body: { idanuncio }, auth: true }),
};

window.api = api;
