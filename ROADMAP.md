# Roadmap — AlugaAlegre

**Stack decidida:**

| Peça | Escolha | Por quê |
|---|---|---|
| Banco | Postgres no **Supabase** | Hospedado, grátis pra começar, já temos o `.sql` pronto |
| Fotos | **Supabase Storage** | Mesmo serviço, upload direto do front, URL pública |
| Login | **E-mail + senha, com hash no backend** | Mais simples de implementar e de debugar que OAuth |
| Backend | **FastAPI + SQLAlchemy** | API REST, cuida do cadastro/login e emite o próprio JWT |
| Front | React (o que já existe) | Trocar dados mock por chamadas à API |

**Como as peças se conectam:**

```
Front (React) ──login (email/senha)──▶ FastAPI ──bcrypt + JWT──▶ front guarda o token
Front (React) ──fotos──▶ Supabase Storage
Front (React) ──dados──▶ FastAPI ──SQLAlchemy──▶ Postgres (Supabase)
                           └─ valida o JWT (emitido pelo próprio FastAPI) em cada request
```

> O Supabase entra só como Postgres hospedado + Storage de fotos — a
> autenticação é toda nossa, não usa o Supabase Auth.

> ⚠️ O arquivo `.sql` do banco ainda não está neste repositório — copiar para
> cá (ex: `db/schema.sql`) antes da Etapa 1.

---

## Etapa 1 — Supabase (banco + storage + auth) · ~1 dia

- [X] Criar projeto em [supabase.com](https://supabase.com) (plano free)
- [X] Rodar o `schema.sql` existente no SQL Editor do Supabase
- [X] Conferir se o schema cobre tudo que o `data.jsx` usa:
      pessoa, locatário, cliente, endereço, cidade, imóvel, foto,
      comodidade, imóvel_comodidade, avaliação, denúncia
- [X] Popular com os dados mock do `data.jsx` como seed (valida o schema)
- [X] Criar bucket público `fotos-imoveis` em Storage
- [X] Anotar: `SUPABASE_URL`, `ANON_KEY`, `DATABASE_URL` (connection string)

## Etapa 2 — Backend FastAPI · ~3-4 dias

- [X] Criar pasta `backend/` com FastAPI + SQLAlchemy + `.env`
- [X] Modelos SQLAlchemy espelhando as tabelas do schema
- [X] Hash de senha com `passlib[bcrypt]` (duas funções: `hash_senha` e
      `verificar_senha`, bem diretas) e geração/validação de JWT próprio
      com `python-jose`
- [X] Endpoints, nesta ordem (do mais simples pro mais complexo):

  | Endpoint | O que faz | Auth? |
  |---|---|---|
  | `GET /imoveis` | Lista com filtros (cidade, tipo, quartos, preço, busca) | Não |
  | `GET /imoveis/{id}` | Detalhe do imóvel | Não |
  | `POST /auth/cadastro` | Cria pessoa (nome, e-mail, senha) e devolve JWT | Não |
  | `POST /auth/login` | Confere e-mail + senha (hash) e devolve JWT | Não |
  | `POST /usuarios/completar-perfil` | Salva CPF + telefone do locador (vira locador) | Sim |
  | `POST /imoveis` | Publicar imóvel | Sim (locador) |
  | `PATCH /imoveis/{id}` | Editar / ativar / pausar | Sim (dono) |
  | `DELETE /imoveis/{id}` | Excluir | Sim (dono) |
  | `POST /imoveis/{id}/contato` | Cliente pediu contato → registra e devolve o WhatsApp | Sim |
  | `GET /meus-imoveis` | Lista do painel do locador | Sim (locador) |
  | `GET /meus-contatos` | "Contatos recentes" do painel | Sim (locador) |
  | `GET/POST /favoritos` | Favoritos do usuário | Sim |

- [X] Testar tudo pelo `/docs` (Swagger automático do FastAPI)

## Etapa 3 — Ligar o front no backend · ~3-4 dias

- [X] Instalar `@supabase/supabase-js` no front (só para upload de foto no
      Storage — login não passa por ele)
- [X] Criar `api.js`: um módulo único com todas as chamadas à API
- [X] **Login**: trocar o `GooglePicker` fake (`modals.jsx`) por um form
      simples de e-mail + senha, chamando `POST /auth/login` /
      `POST /auth/cadastro` — o modal de contas hardcoded sai inteiro
- [X] **Sessão**: guardar o JWT retornado no `localStorage` e restaurar o
      usuário ao carregar o app (hoje o F5 desloga)
- [X] **CORS**: ligar o `CORSMiddleware` no FastAPI já agora (liberando o
      front em dev), para conseguir testar as chamadas no navegador — a
      Etapa 5 só valida os domínios de produção
- [X] **Home**: buscar imóveis de `GET /imoveis` em vez de `window.DATA`
      (filtros viram query params)
- [X] **Contato**: botão chama `POST /imoveis/{id}/contato` e mostra o
      WhatsApp retornado
- [X] **Publicar imóvel** — o `POST /imoveis` hoje exige `idtipo`,
      `idendereco` e `comodidade_ids` prontos e não guarda fotos; o form não
      coleta rua/número/CEP e o botão de foto só cria um rótulo de texto.
      Dividido em passos (backend primeiro, depois o front):
  - [X] **Back — referências**: `GET /tipos` e `GET /comodidades`
        (id + nome) para o form montar as opções com os ids reais
  - [X] **Back — endereço inline**: `POST /imoveis` passa a aceitar o
        endereço (rua, número, bairro, CEP, cidade, UF) e cria/reaproveita
        `cidade` + `endereco` no servidor, em vez de exigir `idendereco`
  - [X] **Back — fotos**: `AnuncioCreate` recebe a lista de fotos
        (`url` + flag de capa) e grava na tabela `foto` (as URLs vêm do
        Supabase Storage)
  - [X] **Front — api.js**: `getTipos()`, `getComodidades()` e ajustar
        `criarImovel` para o novo contrato (endereço + fotos)
  - [X] **Front — form**: carregar tipos/comodidades da API e adicionar os
        campos que faltam (rua, número, CEP)
  - [X] **Front — upload real**: trocar o botão fake por `<input
        type="file">` que sobe as imagens pro Storage via `window.uploadFoto`,
        com preview e a primeira como capa
  - [X] **Front — submeter**: `publish()` chama `POST /imoveis` com
        tipo/endereço/comodidades/fotos reais, com loading e erro; ao
        concluir vai pro painel
- [X] **Painel**: usar `GET /meus-imoveis` e `GET /meus-contatos`; ligar
      editar/pausar/excluir nos endpoints (hoje "Editar" é um `alert()`)
- [X] **Favoritos**: persistir via API (hoje é um `Set` em memória)
- [X] Adicionar estados de loading e erro: home, auth, contato, publicar
      imóvel, painel e favoritos têm feedback/bloqueio de ações assíncronas.

## Etapa 4 — Acabamento do front · ~2-3 dias

- [X] **Fotos reais**: trocar o componente `Photo` (placeholder de texto)
      por `<img>` com as URLs do Storage
- [X] **Responsividade**: não existe nenhum `@media` no projeto — os grids
      de 3 colunas quebram no celular. Prioridade: home → detalhe → painel
- [X] Ligar o "Ordenar por" da home (o `<select>` existe mas não tem `onChange`)
- [X] Remover o painel de Tweaks do build de produção (é ferramenta de design)

## Etapa 5 — Deploy · ~1 dia ✅ (2026-07-11)

**No ar:** front em https://alugaalegre.vercel.app · API em
https://alugaalegre-api.onrender.com

- [X] **Banco de produção**: decidido **reusar o projeto Supabase de dev**
      (schema, seeds, bucket e policy já aplicados e validados; linhas de
      teste removidas). O passo-a-passo de um banco novo segue abaixo como
      referência, com os seeds versionados em `db/seed_referencia.sql`:
  - [X] ~~Aplicar o `db/schema.sql` no banco novo~~ (já aplicado)
  - [X] ~~Semear referência~~ → versionado em `db/seed_referencia.sql`
  - [X] ~~Bucket + policy de INSERT~~ (já criados à mão no projeto atual)
- [X] Backend no **Render** (free tier, blueprint `render.yaml`; spin-down
      após inatividade — primeira request pode demorar ~30s)
- [X] Front no **Vercel** (projeto `alugaalegre`, deploy via CLI; env vars
      `VITE_*` no dashboard)
- [X] CORS validado em produção: `GET /imoveis` com `Origin` do domínio da
      Vercel devolve 200 + `access-control-allow-origin` correto
- [X] **Variáveis de ambiente** — nada de segredo hardcoded no código nem
      commitado (`.env` está no `.gitignore`). Onde cada coisa ficou:
  - [X] **Na Vercel** (front) — só as `VITE_*`, que são **públicas** (entram
        no bundle; qualquer um lê no navegador). Portanto, aqui **só** o que
        pode ser público:
        - `VITE_API_URL` — URL do backend em produção
        - `VITE_SUPABASE_URL`
        - `VITE_SUPABASE_ANON_KEY` — a *anon key* é pública por design
          (protegida por RLS no bucket). **Nunca** pôr a `service_role` key aqui.
  - [X] **No Render** (backend) — segredos, que **jamais** podem ir pra
        Vercel/pro front:
        - `SECRET_KEY` — chave do JWT, gerada pelo próprio Render
          (`generateValue` no blueprint); se vazar, tokens ficam forjáveis
        - `DATABASE_URL` — contém a senha do Postgres
        - `CORS_ORIGINS` — domínio do front em produção
        - `FOTO_URL_PREFIXO` — prefixo do bucket do Storage (só aceita URLs
          de foto vindas de lá)

---

## Etapa 6 — Pós-MVP básico · ~3-4 dias

Versões mínimas de quatro itens do backlog. Nada de tabela nova: `avaliacao`,
`denuncia` e `administrador` já existem no schema **e** nos models — é só
expor endpoint + UI. Ordem pensada: paginação (isolada) → denúncia →
avaliação → admin (o painel consome as denúncias, então vem por último).

### 6.1 Paginação na listagem · ~meio dia

- [X] **Back**: `GET /imoveis` aceita `limit` (default 20, máx 50) e `offset`;
      resposta continua sendo a lista, com o total em um header
      `X-Total-Count` (não quebra o contrato atual do front)
- [X] **Front**: home busca a primeira página e mostra botão **"Carregar
      mais"** que anexa a próxima (`offset += limit`); some quando
      `listings.length >= X-Total-Count`. Trocar filtro/ordenação reseta pro
      início. Sem números de página — é o mínimo que cumpre o papel

### 6.2 Denúncia de anúncio · ~meio dia

- [X] **Back**: `POST /imoveis/{id}/denuncia` (auth, qualquer logado) com
      `descricao` obrigatória (≤200, coluna é VARCHAR(200)); status nasce
      `"A"` (aberta, default do schema). Uma denúncia por pessoa/anúncio
      (mesmo padrão do dedup de contato) e rate limit `5/minute`
- [X] **Front**: link discreto "Denunciar anúncio" na página de detalhe →
      modal com textarea e confirmação. Logado; senão abre o AuthModal
- [X] O tratamento da denúncia é só no painel admin (6.4) — o denunciante
      não acompanha status (fora do escopo do básico)

### 6.3 Avaliação de locador · ~1 dia

- [X] **Back**: `GET /locadores/{id}/avaliacoes` (público: estrelas,
      descrição, nome do cliente, data) e `POST /locadores/{id}/avaliacoes`
      (auth) com `estrelas` 1–5 e `descricao` opcional (≤200)
- [X] **Regras mínimas**: uma avaliação por cliente/locador (sem edição);
      só avalia quem já pediu contato de algum anúncio do locador (1 query
      em `contato` — barra avaliação de quem nunca interagiu); locador não
      avalia a si mesmo
- [X] **Back**: ao criar, recalcular `locador.mediaavaliacao` (média das
      estrelas) — o campo denormalizado já existe e o detalhe já o exibe
- [X] **Front**: no detalhe do imóvel, bloco "Avaliações do locador"
      (média + lista) e botão "Avaliar" (modal: 5 estrelas clicáveis +
      texto). Esconder o botão se não elegível (a API responde 403 de
      qualquer forma — o front consulta `GET .../avaliacoes/elegivel`)

### 6.4 Painel do administrador · ~1-1,5 dia

- [X] **Sem UI de gestão de admins**: admin é criado à mão no banco
      (`INSERT INTO administrador VALUES (idpessoa)`) — a tabela é só a
      FK pra pessoa. Documentar isso no README
- [X] **Back**: dependency `get_current_admin` (espelho do
      `get_current_locador`); `GET /auth/me` passa a devolver `is_admin`
- [ ] **Back**: `GET /admin/denuncias` (abertas primeiro, com título do
      anúncio e denunciante) e `PATCH /admin/denuncias/{id}` com dois
      desfechos: **procedente** (fecha a denúncia e pausa o anúncio,
      `status="P"` — reutiliza o fluxo de pausa que já existe) ou
      **improcedente** (só fecha). Fechar = `denuncia.status`: `A`→`R`/`I`
- [ ] **Back**: ao marcar procedente, incrementar `locador.qtddenuncias`
      (campo já existe, hoje sempre 0)
- [ ] **Front**: view `admin` no SPA (mesmo padrão das outras), visível só
      com `is_admin`: tabela de denúncias com descrição, anúncio (link) e
      botões "Procedente" / "Improcedente". Só isso — sem dashboard de
      métricas, sem gestão de usuários

---

## Backlog (depois do MVP)

- Notificação por e-mail quando alguém pede contato
- ~~Rate limit no endpoint de contato (evita scraping de telefones)~~
  ✅ feito (10/min por IP + dedup por cliente/anúncio)
- Denunciante acompanhar o status da própria denúncia
- Editar/excluir a própria avaliação; resposta do locador
- Paginação numerada (a 6.1 entrega só "carregar mais")

## Notas

- **Segurança (hardening já feito)**: rate limiting no `/auth` (login 10/min,
  cadastro 5/min por IP, via `slowapi`) contra brute-force e enumeração de
  e-mail; `GET /imoveis/{id}` só retorna anúncios com `status = "A"`;
  `AnuncioUpdate.status` restrito a `A`/`P`; URLs de foto exigem `https://` e,
  se `FOTO_URL_PREFIXO` estiver setado, precisam vir do bucket do Storage.
  *Obs.: o rate limit usa storage em memória (por processo) — com vários
  workers em produção, apontar o `Limiter` pra um Redis via `storage_uri`.*
- **Nomenclatura**: no protótipo, `LOCATARIO` = dono do imóvel e `CLIENTE` =
  quem aluga. "Locatário" normalmente significa inquilino — conferir como
  está no `.sql` e alinhar os nomes agora, antes que vire confusão permanente.
- **Senha**: a coluna `senha` da tabela pessoa passa a guardar o hash
  bcrypt de verdade (hoje no `data.jsx` é uma string fixa tipo
  `"hash_hs2022"`, não é hash de nada). Nunca guardar senha em texto puro.
- **Estado do banco / drift (2026-07-10)**: ao rodar local, o banco em nuvem
  (Supabase) estava com uma versão **antiga** do schema aplicada (faltavam
  `contato`, `favorito`, `endereco.numero`, `denuncia.status`). O `db/schema.sql`
  do repo, porém, **está completo e correto** — é a fonte da verdade; foi o banco
  que ficou pra trás, não o arquivo. Reconciliado à mão na sessão. **TODO antes do
  deploy**: versionar o que ainda vive só na nuvem — um `db/seed_referencia.sql`
  (tipos/comodidades) e um `db/storage_policies.sql` (policy de INSERT do bucket) —
  para que a "Preparar o banco de produção" da Etapa 5 seja reproduzível sem
  redescobrir esses passos.
