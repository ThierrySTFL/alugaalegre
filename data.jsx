import React from "react";

// ─── Entidades normalizadas (modelo ER) ───────────────────────────────────────

const CIDADES = [
  { idCidade: "c-01", nome: "Alegre", estado: "ES" },
];

const TIPOS = [
  { idTipo: "t-01", nome: "Apartamento" },
  { idTipo: "t-02", nome: "Casa"        },
  { idTipo: "t-03", nome: "Kitnet"      },
  { idTipo: "t-04", nome: "Sobrado"     },
  { idTipo: "t-05", nome: "Sítio"       },
];

const COMODIDADES = [
  { idComodidade: "cm-01", nome: "Wi-Fi"           },
  { idComodidade: "cm-02", nome: "Garagem"          },
  { idComodidade: "cm-03", nome: "Mobiliado"        },
  { idComodidade: "cm-04", nome: "Quintal"          },
  { idComodidade: "cm-05", nome: "Aceita pets"      },
  { idComodidade: "cm-06", nome: "Ar-condicionado"  },
  { idComodidade: "cm-07", nome: "Área de serviço"  },
  { idComodidade: "cm-08", nome: "Portaria"         },
  { idComodidade: "cm-09", nome: "Churrasqueira"    },
  { idComodidade: "cm-10", nome: "Próximo à UFES"   },
];

// ─── PESSOA (entidade base) ───────────────────────────────────────────────────
// idPessoa | nome | email | senha (hash fictício no protótipo)

const PESSOAS = [
  { idPessoa: "pe-01", nome: "Marina Toledo",    email: "marina@email.com",    senha: "hash_mt2023" },
  { idPessoa: "pe-02", nome: "Henrique Sá",      email: "henrique@email.com",  senha: "hash_hs2022" },
  { idPessoa: "pe-03", nome: "Camila Reis",      email: "camila@email.com",    senha: "hash_cr2024" },
  { idPessoa: "pe-04", nome: "Patrícia Almeida", email: "patricia@email.com",  senha: "hash_pa2021" },
  { idPessoa: "pe-05", nome: "Diego Watanabe",   email: "diego@email.com",     senha: "hash_dw2023" },
  { idPessoa: "pe-06", nome: "Renata Coutinho",  email: "renata@email.com",    senha: "hash_rc2022" },
  { idPessoa: "pe-07", nome: "Antônio Bezerra",  email: "antonio@email.com",   senha: "hash_ab2024" },
  // Clientes (inquilinos)
  { idPessoa: "pe-08", nome: "Lucas Ferreira",   email: "lucas@email.com",     senha: "hash_lf2024" },
  { idPessoa: "pe-09", nome: "Beatriz Nunes",    email: "bea@email.com",       senha: "hash_bn2024" },
  { idPessoa: "pe-10", nome: "Rafael Duarte",    email: "rafael@email.com",    senha: "hash_rd2025" },
  // Admin
  { idPessoa: "pe-11", nome: "Admin AlugaAlegre", email: "adm@alugaalegre.com", senha: "hash_adm001" },
];

// ─── LOCATÁRIO (especialização de PESSOA) ────────────────────────────────────
// idLocatario | idPessoa | CPF | telefone | desde

const LOCATARIOS = [
  { idLocatario: "lo-01", idPessoa: "pe-01", CPF: "111.222.333-44", telefone: "+55 28 99876-5432", desde: "2023" },
  { idLocatario: "lo-02", idPessoa: "pe-02", CPF: "222.333.444-55", telefone: "+55 28 99182-3344", desde: "2022" },
  { idLocatario: "lo-03", idPessoa: "pe-03", CPF: "333.444.555-66", telefone: "+55 28 99411-7788", desde: "2024" },
  { idLocatario: "lo-04", idPessoa: "pe-04", CPF: "444.555.666-77", telefone: "+55 28 99887-1122", desde: "2021" },
  { idLocatario: "lo-05", idPessoa: "pe-05", CPF: "555.666.777-88", telefone: "+55 28 99100-2244", desde: "2023" },
  { idLocatario: "lo-06", idPessoa: "pe-06", CPF: "666.777.888-99", telefone: "+55 28 99765-0099", desde: "2022" },
  { idLocatario: "lo-07", idPessoa: "pe-07", CPF: "777.888.999-00", telefone: "+55 28 99554-3210", desde: "2024" },
];

// ─── CLIENTE (especialização de PESSOA) ──────────────────────────────────────
// idCliente | idPessoa

const CLIENTES = [
  { idCliente: "cl-01", idPessoa: "pe-08" },
  { idCliente: "cl-02", idPessoa: "pe-09" },
  { idCliente: "cl-03", idPessoa: "pe-10" },
];

// ─── ADM (especialização de PESSOA) ──────────────────────────────────────────
// idAdm | idPessoa

const ADMS = [
  { idAdm: "adm-01", idPessoa: "pe-11" },
];

// ─── ENDEREÇO ─────────────────────────────────────────────────────────────────
// idEndereco | rua | numero | bairro | CEP | idCidade

const ENDERECOS = [
  { idEndereco: "e-01", rua: "Rua XV de Novembro", numero: "120", bairro: "Centro",     CEP: "29500-000", idCidade: "c-01" },
  { idEndereco: "e-03", rua: "Rua das Acácias",    numero: "88",  bairro: "Vila do Sul", CEP: "29500-100", idCidade: "c-01" },
  { idEndereco: "e-05", rua: "Rua do Café",        numero: "22",  bairro: "Café",        CEP: "29500-200", idCidade: "c-01" },
  { idEndereco: "e-09", rua: "Rua Guararema",      numero: "67",  bairro: "Guararema",   CEP: "29500-300", idCidade: "c-01" },
];

// ─── IMÓVEL ───────────────────────────────────────────────────────────────────
// idImovel | titulo | descricao | desc | preco | quartos | banheiros | area
// status (active | inactive | draft) | idLocatario | idEndereco | idTipo

const IMOVEIS = [
  {
    idImovel:   "p-001",
    titulo:     "Apartamento amplo no Centro de Alegre",
    descricao:  "Apartamento reformado a duas quadras da praça central. Ideal para estudantes da UFES-CCA ou para casais. Comércio, mercado e farmácia ao redor.",
    desc:       "Reformado, mobiliado, 2 quartos",
    preco:      1400,
    quartos:    2,
    banheiros:  2,
    area:       78,
    status:     "active",
    idLocatario: "lo-01",
    idEndereco:  "e-01",
    idTipo:      "t-01",
  },
  {
    idImovel:   "p-003",
    titulo:     "Kitnet mobiliada perto da UFES",
    descricao:  "Kitnet funcional, com cama box, frigobar e cozinha equipada. A 8 minutos a pé do campus da UFES-CCA. Ideal para estudantes.",
    desc:       "Mobiliada, próxima ao campus da UFES",
    preco:      750,
    quartos:    1,
    banheiros:  1,
    area:       32,
    status:     "active",
    idLocatario: "lo-03",
    idEndereco:  "e-03",
    idTipo:      "t-03",
  },
  {
    idImovel:   "p-005",
    titulo:     "Apartamento no Café, Alegre",
    descricao:  "Edifício de baixa vertical, em rua tranquila do bairro Café. Apartamento entregue mobiliado, com janela ampla e ventilação cruzada.",
    desc:       "1 quarto, mobiliado, edifício novo",
    preco:      1100,
    quartos:    1,
    banheiros:  1,
    area:       48,
    status:     "active",
    idLocatario: "lo-05",
    idEndereco:  "e-05",
    idTipo:      "t-01",
  },
  {
    idImovel:   "p-009",
    titulo:     "Kitnet em Guararema, Alegre",
    descricao:  "Kitnet compacta e bem ventilada, em rua arborizada. Ideal para estudantes da UFES ou profissionais que passam pouco tempo em casa.",
    desc:       "Compacta, perto da UFES",
    preco:      680,
    quartos:    1,
    banheiros:  1,
    area:       28,
    status:     "inactive",
    idLocatario: "lo-01",
    idEndereco:  "e-09",
    idTipo:      "t-03",
  },
];

// ─── FOTO (entidade fraca de IMÓVEL) ─────────────────────────────────────────
// Identificada por (idFoto, idImovel). Ordem define sequência na galeria.

const FOTOS = [
  // p-001
  { idFoto: "f-001-1", idImovel: "p-001", legenda: "Sala de estar",      ordem: 1 },
  { idFoto: "f-001-2", idImovel: "p-001", legenda: "Cozinha integrada",  ordem: 2 },
  { idFoto: "f-001-3", idImovel: "p-001", legenda: "Quarto principal",   ordem: 3 },
  { idFoto: "f-001-4", idImovel: "p-001", legenda: "Banheiro",           ordem: 4 },
  { idFoto: "f-001-5", idImovel: "p-001", legenda: "Varanda",            ordem: 5 },
  { idFoto: "f-001-6", idImovel: "p-001", legenda: "Fachada",            ordem: 6 },
  // p-003
  { idFoto: "f-003-1", idImovel: "p-003", legenda: "Vista do quarto",    ordem: 1 },
  { idFoto: "f-003-2", idImovel: "p-003", legenda: "Kitchenette",        ordem: 2 },
  { idFoto: "f-003-3", idImovel: "p-003", legenda: "Banheiro",           ordem: 3 },
  { idFoto: "f-003-4", idImovel: "p-003", legenda: "Hall",               ordem: 4 },
  { idFoto: "f-003-5", idImovel: "p-003", legenda: "Vista da janela",    ordem: 5 },
  // p-005
  { idFoto: "f-005-1", idImovel: "p-005", legenda: "Living",             ordem: 1 },
  { idFoto: "f-005-2", idImovel: "p-005", legenda: "Cozinha",            ordem: 2 },
  { idFoto: "f-005-3", idImovel: "p-005", legenda: "Quarto",             ordem: 3 },
  { idFoto: "f-005-4", idImovel: "p-005", legenda: "Banheiro",           ordem: 4 },
  { idFoto: "f-005-5", idImovel: "p-005", legenda: "Área comum",         ordem: 5 },
  // p-009
  { idFoto: "f-009-1", idImovel: "p-009", legenda: "Espaço único",       ordem: 1 },
  { idFoto: "f-009-2", idImovel: "p-009", legenda: "Kitchenette",        ordem: 2 },
  { idFoto: "f-009-3", idImovel: "p-009", legenda: "Banheiro",           ordem: 3 },
  { idFoto: "f-009-4", idImovel: "p-009", legenda: "Janela",             ordem: 4 },
];

// ─── IMOVEL_COMODIDADE (N:N — imóvel ↔ comodidade) ───────────────────────────

const IMOVEL_COMODIDADE = [
  // p-001
  { idImovel: "p-001", idComodidade: "cm-01" },
  { idImovel: "p-001", idComodidade: "cm-02" },
  { idImovel: "p-001", idComodidade: "cm-03" },
  { idImovel: "p-001", idComodidade: "cm-10" },
  // p-003
  { idImovel: "p-003", idComodidade: "cm-01" },
  { idImovel: "p-003", idComodidade: "cm-03" },
  { idImovel: "p-003", idComodidade: "cm-06" },
  { idImovel: "p-003", idComodidade: "cm-10" },
  // p-005
  { idImovel: "p-005", idComodidade: "cm-01" },
  { idImovel: "p-005", idComodidade: "cm-03" },
  { idImovel: "p-005", idComodidade: "cm-08" },
  { idImovel: "p-005", idComodidade: "cm-10" },
  // p-009
  { idImovel: "p-009", idComodidade: "cm-01" },
  { idImovel: "p-009", idComodidade: "cm-03" },
  { idImovel: "p-009", idComodidade: "cm-05" },
  { idImovel: "p-009", idComodidade: "cm-10" },
];

// ─── AVALIAÇÃO ────────────────────────────────────────────────────────────────
// idAvaliacao | idCliente | idLocatario | descricao | estrelas | data

const AVALIACOES = [
  { idAvaliacao: "av-01", idCliente: "cl-01", idLocatario: "lo-01", descricao: "Ótima proprietária, muito atenciosa e rápida nas respostas. Imóvel exatamente como anunciado.", estrelas: 5, data: "2024-03-15" },
  { idAvaliacao: "av-02", idCliente: "cl-02", idLocatario: "lo-01", descricao: "Tudo certo na entrega. Apartamento limpo e bem conservado.", estrelas: 4, data: "2024-06-02" },
  { idAvaliacao: "av-03", idCliente: "cl-03", idLocatario: "lo-02", descricao: "Casa espaçosa e quintal excelente. Locador honesto e prestativo.", estrelas: 5, data: "2024-08-20" },
  { idAvaliacao: "av-04", idCliente: "cl-01", idLocatario: "lo-04", descricao: "Sobrado em ótimo estado. Pequeno atraso na entrega das chaves, mas resolvido.", estrelas: 3, data: "2025-01-10" },
];

// ─── DENÚNCIA ─────────────────────────────────────────────────────────────────
// idDenuncia | idPessoa (quem denuncia) | idImovel | descricao | data | status

const DENUNCIAS = [];

// ─── Views derivadas (compatibilidade com o restante do app) ──────────────────

// CITIES — lista de strings "Nome, UF" usada nos selects
const CITIES = CIDADES.map((c) => `${c.nome}, ${c.estado}`);

// TYPES — lista de nomes de tipo usada nos selects e filtros
const TYPES = TIPOS.map((t) => t.nome);

// AMENITIES — lista de nomes de comodidade
const AMENITIES = COMODIDADES.map((c) => c.nome);

// LISTINGS — view plana de imóveis com todos os dados relacionados,
// mantendo os campos que o app já consome (title, type, city, neighborhood…)
const LISTINGS = IMOVEIS.map((imovel) => {
  const locatario  = LOCATARIOS.find((l) => l.idLocatario === imovel.idLocatario);
  const pessoa     = PESSOAS.find((p) => p.idPessoa === locatario.idPessoa);
  const endereco   = ENDERECOS.find((e) => e.idEndereco === imovel.idEndereco);
  const cidade     = CIDADES.find((c) => c.idCidade === endereco.idCidade);
  const tipo       = TIPOS.find((t) => t.idTipo === imovel.idTipo);
  const comodidades = IMOVEL_COMODIDADE
    .filter((ic) => ic.idImovel === imovel.idImovel)
    .map((ic) => COMODIDADES.find((c) => c.idComodidade === ic.idComodidade).nome);
  const fotos = FOTOS
    .filter((f) => f.idImovel === imovel.idImovel)
    .sort((a, b) => a.ordem - b.ordem)
    .map((f) => f.legenda);
  const totalImoveis = IMOVEIS.filter((i) => i.idLocatario === imovel.idLocatario).length;

  return {
    id:           imovel.idImovel,
    title:        imovel.titulo,
    type:         tipo.nome,
    city:         `${cidade.nome}, ${cidade.estado}`,
    neighborhood: endereco.bairro,
    price:        imovel.preco,
    bedrooms:     imovel.quartos,
    bathrooms:    imovel.banheiros,
    area:         imovel.area,
    amenities:    comodidades,
    photoTags:    fotos,
    landlord: {
      name:     pessoa.nome,
      phone:    locatario.telefone,
      since:    locatario.desde,
      listings: totalImoveis,
    },
    description: imovel.descricao,
    desc:        imovel.desc,
    status:      imovel.status,
  };
});

// Locatário demo (Marina Toledo) — usado no dashboard e fluxo de login
const DEMO_LOCATARIO = LOCATARIOS.find((l) => l.idLocatario === "lo-01");
const DEMO_LANDLORD  = PESSOAS.find((p) => p.idPessoa === DEMO_LOCATARIO.idPessoa).nome;

window.DATA = {
  // Entidades normalizadas
  CIDADES, TIPOS, COMODIDADES,
  PESSOAS, LOCATARIOS, CLIENTES, ADMS,
  ENDERECOS, IMOVEIS, FOTOS, IMOVEL_COMODIDADE,
  AVALIACOES, DENUNCIAS,
  // Views derivadas (usadas pelo app)
  CITIES, TYPES, AMENITIES, LISTINGS, DEMO_LANDLORD,
};
