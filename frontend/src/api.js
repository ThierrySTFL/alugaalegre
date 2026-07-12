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
async function request(method, path, { body, auth = false, query, includeHeaders = false } = {}) {
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
    const erro = new Error(msg);
    erro.status = res.status;
    throw erro;
  }
  if (includeHeaders) return { data, headers: res.headers };
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
  // filtros: { cidade, tipo, quartos, preco_min, preco_max, busca, limit, offset, ordem }
  listarImoveis: (filtros = {}) => request("GET", "/imoveis", { query: filtros }),
  listarImoveisPaginado: async (filtros = {}) => {
    const { data, headers } = await request("GET", "/imoveis", {
      query: filtros,
      includeHeaders: true,
    });
    return {
      imoveis: data,
      total: Number(headers.get("X-Total-Count") || data.length),
    };
  },
  detalheImovel: (id) => request("GET", `/imoveis/${id}`),

  // --- referências (para o form de publicar) ---
  getTipos: () => request("GET", "/tipos"), // [{ idtipo, nome }]
  getComodidades: () => request("GET", "/comodidades"), // [{ idcomodidade, nome }]
  getCidades: () => request("GET", "/cidades"), // [{ nome, uf }] — só cidades com anúncio ativo

  // --- imóveis (autenticado) ---
  // dados: {
  //   idtipo, titulo, preco, descricao, quartos, banheiros, area,
  //   endereco: { rua, numero, bairro, cep, cidade, uf },
  //   comodidade_ids: [int], fotos: [{ url, descricao?, capa }]
  // }
  criarImovel: (dados) => request("POST", "/imoveis", { body: dados, auth: true }),
  editarImovel: (id, dados) => request("PATCH", `/imoveis/${id}`, { body: dados, auth: true }),
  excluirImovel: (id) => request("DELETE", `/imoveis/${id}`, { auth: true }),
  // Registra o interesse e devolve { whatsapp } do locador.
  contatarImovel: (id) => request("POST", `/imoveis/${id}/contato`, { auth: true }),
  // Denuncia o anúncio; repetir para o mesmo anúncio devolve a denúncia existente.
  denunciarImovel: (id, descricao) =>
    request("POST", `/imoveis/${id}/denuncia`, { body: { descricao }, auth: true }),

  // --- avaliações de locador ---
  // Lista pública: [{ idavaliacao, estrelas, descricao, cliente_nome, dataavaliacao }]
  getAvaliacoes: (idlocador) => request("GET", `/locadores/${idlocador}/avaliacoes`),
  // { elegivel, motivo } — o front usa para esconder o botão "Avaliar".
  podeAvaliar: (idlocador) =>
    request("GET", `/locadores/${idlocador}/avaliacoes/elegivel`, { auth: true }),
  criarAvaliacao: (idlocador, estrelas, descricao) =>
    request("POST", `/locadores/${idlocador}/avaliacoes`, {
      body: { estrelas, descricao: descricao || undefined },
      auth: true,
    }),

  // --- painel do locador ---
  meusImoveis: () => request("GET", "/meus-imoveis", { auth: true }),
  meusContatos: () => request("GET", "/meus-contatos", { auth: true }),

  // --- favoritos ---
  // GET devolve a lista de ids favoritados; POST alterna e devolve { idanuncio, favoritado }.
  listarFavoritos: () => request("GET", "/favoritos", { auth: true }),
  toggleFavorito: (idanuncio) =>
    request("POST", "/favoritos", { body: { idanuncio }, auth: true }),

  // --- painel do administrador ---
  // Lista todas as denúncias (abertas primeiro), com título do anúncio e nome do denunciante.
  listarDenunciasAdmin: () => request("GET", "/admin/denuncias", { auth: true }),
  // desfecho: "procedente" (fecha e pausa o anúncio) | "improcedente" (só fecha).
  resolverDenuncia: (iddenuncia, desfecho) =>
    request("PATCH", `/admin/denuncias/${iddenuncia}`, { body: { desfecho }, auth: true }),
};

window.api = api;
