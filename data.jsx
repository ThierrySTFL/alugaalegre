import React from "react";

// ─── Entidades normalizadas (modelo ER) ───────────────────────────────────────

const CIDADES = [
  { idCidade: "c-01", nome: "Alegre",                    estado: "ES" },
  { idCidade: "c-02", nome: "Guaçuí",                    estado: "ES" },
  { idCidade: "c-03", nome: "Jerônimo Monteiro",          estado: "ES" },
  { idCidade: "c-04", nome: "Cachoeiro de Itapemirim",    estado: "ES" },
  { idCidade: "c-05", nome: "Muniz Freire",               estado: "ES" },
  { idCidade: "c-06", nome: "Ibitirama",                  estado: "ES" },
  { idCidade: "c-07", nome: "Iúna",                       estado: "ES" },
  { idCidade: "c-08", nome: "São José do Calçado",        estado: "ES" },
  { idCidade: "c-09", nome: "Bom Jesus do Norte",         estado: "ES" },
  { idCidade: "c-10", nome: "Mimoso do Sul",              estado: "ES" },
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
  { idEndereco: "e-01", rua: "Rua XV de Novembro",   numero: "120", bairro: "Centro",         CEP: "29500-000", idCidade: "c-01" },
  { idEndereco: "e-02", rua: "Rua São Roque",        numero: "45",  bairro: "São Roque",       CEP: "29560-000", idCidade: "c-02" },
  { idEndereco: "e-03", rua: "Rua das Acácias",      numero: "88",  bairro: "Vila do Sul",     CEP: "29500-100", idCidade: "c-01" },
  { idEndereco: "e-04", rua: "Av. Independência",    numero: "310", bairro: "Independência",   CEP: "29300-000", idCidade: "c-04" },
  { idEndereco: "e-05", rua: "Rua do Café",          numero: "22",  bairro: "Café",            CEP: "29500-200", idCidade: "c-01" },
  { idEndereco: "e-06", rua: "Estrada da Cachoeira", numero: "s/n", bairro: "Zona rural",      CEP: "29590-000", idCidade: "c-05" },
  { idEndereco: "e-07", rua: "Rua Serra Verde",      numero: "15",  bairro: "Centro",          CEP: "29545-000", idCidade: "c-06" },
  { idEndereco: "e-08", rua: "Av. Principal",        numero: "200", bairro: "Centro",          CEP: "29480-000", idCidade: "c-03" },
  { idEndereco: "e-09", rua: "Rua Guararema",        numero: "67",  bairro: "Guararema",       CEP: "29500-300", idCidade: "c-01" },
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
    idImovel:   "p-002",
    titulo:     "Casa com quintal em Guaçuí",
    descricao:  "Casa térrea em rua tranquila, com quintal arborizado e churrasqueira. Aceita pets de pequeno e médio porte. A 5 minutos do centro de Guaçuí.",
    desc:       "3 quartos, quintal, aceita pets",
    preco:      1850,
    quartos:    3,
    banheiros:  2,
    area:       142,
    status:     "active",
    idLocatario: "lo-02",
    idEndereco:  "e-02",
    idTipo:      "t-02",
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
    idImovel:   "p-004",
    titulo:     "Sobrado em Cachoeiro de Itapemirim",
    descricao:  "Sobrado em bairro residencial, com 3 quartos sendo 1 suíte, quintal nos fundos e garagem para 2 carros. Próximo ao Shopping Cachoeiro.",
    desc:       "3 quartos, suíte, garagem dupla",
    preco:      3200,
    quartos:    3,
    banheiros:  3,
    area:       180,
    status:     "active",
    idLocatario: "lo-04",
    idEndereco:  "e-04",
    idTipo:      "t-04",
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
    idImovel:   "p-006",
    titulo:     "Sítio com cachoeira em Muniz Freire",
    descricao:  "Sítio com 2 quartos, varanda com rede e acesso a uma pequena cachoeira no terreno. A 20 minutos do centro de Muniz Freire.",
    desc:       "Cachoeira no terreno, varanda",
    preco:      2400,
    quartos:    2,
    banheiros:  2,
    area:       130,
    status:     "draft",
    idLocatario: "lo-06",
    idEndereco:  "e-06",
    idTipo:      "t-05",
  },
  {
    idImovel:   "p-007",
    titulo:     "Casa de campo em Ibitirama",
    descricao:  "Casinha aconchegante no centro de Ibitirama, com vista para a serra. Próximo à entrada do Parque Nacional do Caparaó.",
    desc:       "Vista da serra, perto do Caparaó",
    preco:      1600,
    quartos:    2,
    banheiros:  1,
    area:       90,
    status:     "active",
    idLocatario: "lo-01",
    idEndereco:  "e-07",
    idTipo:      "t-02",
  },
  {
    idImovel:   "p-008",
    titulo:     "Apartamento em Jerônimo Monteiro",
    descricao:  "Apartamento em prédio de 4 andares, no centro de Jerônimo Monteiro. A 15 minutos de Alegre. Vaga de garagem coberta.",
    desc:       "2 quartos, garagem, central",
    preco:      1250,
    quartos:    2,
    banheiros:  1,
    area:       70,
    status:     "active",
    idLocatario: "lo-07",
    idEndereco:  "e-08",
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
  // p-002
  { idFoto: "f-002-1", idImovel: "p-002", legenda: "Fachada",            ordem: 1 },
  { idFoto: "f-002-2", idImovel: "p-002", legenda: "Sala ampla",         ordem: 2 },
  { idFoto: "f-002-3", idImovel: "p-002", legenda: "Cozinha",            ordem: 3 },
  { idFoto: "f-002-4", idImovel: "p-002", legenda: "Quarto 1",           ordem: 4 },
  { idFoto: "f-002-5", idImovel: "p-002", legenda: "Quintal",            ordem: 5 },
  { idFoto: "f-002-6", idImovel: "p-002", legenda: "Churrasqueira",      ordem: 6 },
  // p-003
  { idFoto: "f-003-1", idImovel: "p-003", legenda: "Vista do quarto",    ordem: 1 },
  { idFoto: "f-003-2", idImovel: "p-003", legenda: "Kitchenette",        ordem: 2 },
  { idFoto: "f-003-3", idImovel: "p-003", legenda: "Banheiro",           ordem: 3 },
  { idFoto: "f-003-4", idImovel: "p-003", legenda: "Hall",               ordem: 4 },
  { idFoto: "f-003-5", idImovel: "p-003", legenda: "Vista da janela",    ordem: 5 },
  // p-004
  { idFoto: "f-004-1", idImovel: "p-004", legenda: "Fachada",            ordem: 1 },
  { idFoto: "f-004-2", idImovel: "p-004", legenda: "Sala dois ambientes",ordem: 2 },
  { idFoto: "f-004-3", idImovel: "p-004", legenda: "Cozinha planejada",  ordem: 3 },
  { idFoto: "f-004-4", idImovel: "p-004", legenda: "Suíte master",       ordem: 4 },
  { idFoto: "f-004-5", idImovel: "p-004", legenda: "Quintal",            ordem: 5 },
  { idFoto: "f-004-6", idImovel: "p-004", legenda: "Garagem",            ordem: 6 },
  // p-005
  { idFoto: "f-005-1", idImovel: "p-005", legenda: "Living",             ordem: 1 },
  { idFoto: "f-005-2", idImovel: "p-005", legenda: "Cozinha",            ordem: 2 },
  { idFoto: "f-005-3", idImovel: "p-005", legenda: "Quarto",             ordem: 3 },
  { idFoto: "f-005-4", idImovel: "p-005", legenda: "Banheiro",           ordem: 4 },
  { idFoto: "f-005-5", idImovel: "p-005", legenda: "Área comum",         ordem: 5 },
  // p-006
  { idFoto: "f-006-1", idImovel: "p-006", legenda: "Fachada",            ordem: 1 },
  { idFoto: "f-006-2", idImovel: "p-006", legenda: "Sala com lareira",   ordem: 2 },
  { idFoto: "f-006-3", idImovel: "p-006", legenda: "Cozinha rústica",    ordem: 3 },
  { idFoto: "f-006-4", idImovel: "p-006", legenda: "Quarto principal",   ordem: 4 },
  { idFoto: "f-006-5", idImovel: "p-006", legenda: "Varanda",            ordem: 5 },
  { idFoto: "f-006-6", idImovel: "p-006", legenda: "Cachoeira",          ordem: 6 },
  // p-007
  { idFoto: "f-007-1", idImovel: "p-007", legenda: "Fachada",            ordem: 1 },
  { idFoto: "f-007-2", idImovel: "p-007", legenda: "Sala",               ordem: 2 },
  { idFoto: "f-007-3", idImovel: "p-007", legenda: "Cozinha",            ordem: 3 },
  { idFoto: "f-007-4", idImovel: "p-007", legenda: "Quarto",             ordem: 4 },
  { idFoto: "f-007-5", idImovel: "p-007", legenda: "Quintal",            ordem: 5 },
  // p-008
  { idFoto: "f-008-1", idImovel: "p-008", legenda: "Sala",               ordem: 1 },
  { idFoto: "f-008-2", idImovel: "p-008", legenda: "Cozinha",            ordem: 2 },
  { idFoto: "f-008-3", idImovel: "p-008", legenda: "Quarto principal",   ordem: 3 },
  { idFoto: "f-008-4", idImovel: "p-008", legenda: "Varanda",            ordem: 4 },
  { idFoto: "f-008-5", idImovel: "p-008", legenda: "Fachada",            ordem: 5 },
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
  // p-002
  { idImovel: "p-002", idComodidade: "cm-02" },
  { idImovel: "p-002", idComodidade: "cm-05" },
  { idImovel: "p-002", idComodidade: "cm-09" },
  { idImovel: "p-002", idComodidade: "cm-04" },
  // p-003
  { idImovel: "p-003", idComodidade: "cm-01" },
  { idImovel: "p-003", idComodidade: "cm-03" },
  { idImovel: "p-003", idComodidade: "cm-06" },
  { idImovel: "p-003", idComodidade: "cm-10" },
  // p-004
  { idImovel: "p-004", idComodidade: "cm-02" },
  { idImovel: "p-004", idComodidade: "cm-04" },
  { idImovel: "p-004", idComodidade: "cm-09" },
  { idImovel: "p-004", idComodidade: "cm-07" },
  // p-005
  { idImovel: "p-005", idComodidade: "cm-01" },
  { idImovel: "p-005", idComodidade: "cm-03" },
  { idImovel: "p-005", idComodidade: "cm-08" },
  { idImovel: "p-005", idComodidade: "cm-10" },
  // p-006
  { idImovel: "p-006", idComodidade: "cm-02" },
  { idImovel: "p-006", idComodidade: "cm-05" },
  { idImovel: "p-006", idComodidade: "cm-09" },
  { idImovel: "p-006", idComodidade: "cm-04" },
  // p-007
  { idImovel: "p-007", idComodidade: "cm-01" },
  { idImovel: "p-007", idComodidade: "cm-03" },
  { idImovel: "p-007", idComodidade: "cm-05" },
  { idImovel: "p-007", idComodidade: "cm-04" },
  // p-008
  { idImovel: "p-008", idComodidade: "cm-02" },
  { idImovel: "p-008", idComodidade: "cm-08" },
  { idImovel: "p-008", idComodidade: "cm-07" },
  { idImovel: "p-008", idComodidade: "cm-06" },
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

const DENUNCIAS = [
  { idDenuncia: "d-01", idPessoa: "pe-08", idImovel: "p-004", descricao: "Fotos não correspondem ao imóvel real — área menor do que anunciado.", data: "2025-02-14", status: "pendente"  },
  { idDenuncia: "d-02", idPessoa: "pe-09", idImovel: "p-006", descricao: "Imóvel anunciado como disponível mas locador não responde há semanas.", data: "2025-03-01", status: "resolvida" },
];

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
