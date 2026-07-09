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
- [ ] Endpoints, nesta ordem (do mais simples pro mais complexo):

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

- [ ] Testar tudo pelo `/docs` (Swagger automático do FastAPI)

## Etapa 3 — Ligar o front no backend · ~3-4 dias

- [ ] Instalar `@supabase/supabase-js` no front (só para upload de foto no
      Storage — login não passa por ele)
- [ ] Criar `api.js`: um módulo único com todas as chamadas à API
- [ ] **Login**: trocar o `GooglePicker` fake (`modals.jsx`) por um form
      simples de e-mail + senha, chamando `POST /auth/login` /
      `POST /auth/cadastro` — o modal de contas hardcoded sai inteiro
- [ ] **Sessão**: guardar o JWT retornado no `localStorage` e restaurar o
      usuário ao carregar o app (hoje o F5 desloga)
- [ ] **Home**: buscar imóveis de `GET /imoveis` em vez de `window.DATA`
      (filtros viram query params)
- [ ] **Contato**: botão chama `POST /imoveis/{id}/contato` e mostra o
      WhatsApp retornado
- [ ] **Publicar imóvel**: form envia pra `POST /imoveis`; fotos sobem pro
      Supabase Storage via `<input type="file">` (hoje o botão só adiciona
      um rótulo de texto — não existe upload real)
- [ ] **Painel**: usar `GET /meus-imoveis` e `GET /meus-contatos`; ligar
      editar/pausar/excluir nos endpoints (hoje "Editar" é um `alert()`)
- [ ] **Favoritos**: persistir via API (hoje é um `Set` em memória)
- [ ] Adicionar estados de loading e erro (hoje não existem — nada é
      assíncrono)

## Etapa 4 — Acabamento do front · ~2-3 dias

- [ ] **Fotos reais**: trocar o componente `Photo` (placeholder de texto)
      por `<img>` com as URLs do Storage
- [ ] **Responsividade**: não existe nenhum `@media` no projeto — os grids
      de 3 colunas quebram no celular. Prioridade: home → detalhe → painel
- [ ] Ligar o "Ordenar por" da home (o `<select>` existe mas não tem `onChange`)
- [ ] Remover o painel de Tweaks do build de produção (é ferramenta de design)
- [ ] Mapa real na página de detalhe (Leaflet + OpenStreetMap é grátis) —
      *opcional, o mapa fake em CSS segura o MVP*

## Etapa 5 — Deploy · ~1 dia

- [ ] Backend no **Railway** ou **Render** (free tier, deploy por git push)
- [ ] Front no **Vercel** ou **Netlify** (`npm run build` + pasta `dist`)
- [ ] Configurar CORS no FastAPI com o domínio do front
- [ ] Definir a `SECRET_KEY` do JWT como variável de ambiente em produção
      (nunca hardcoded no código)

---

## Backlog (depois do MVP)

- Avaliações de locador (tabela já existe no schema, sem UI)
- Denúncia de anúncio (idem)
- Painel do administrador
- Notificação por e-mail quando alguém pede contato
- Paginação na listagem (só importa com muitos imóveis)
- Rate limit no endpoint de contato (evita scraping de telefones)

## Notas

- **Nomenclatura**: no protótipo, `LOCATARIO` = dono do imóvel e `CLIENTE` =
  quem aluga. "Locatário" normalmente significa inquilino — conferir como
  está no `.sql` e alinhar os nomes agora, antes que vire confusão permanente.
- **Senha**: a coluna `senha` da tabela pessoa passa a guardar o hash
  bcrypt de verdade (hoje no `data.jsx` é uma string fixa tipo
  `"hash_hs2022"`, não é hash de nada). Nunca guardar senha em texto puro.
