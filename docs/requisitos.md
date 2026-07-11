# Requisitos — AlugaAlegre

Plataforma web de aluguel de imóveis direto entre locador e cliente (sem
imobiliária), atendendo a cidade de Alegre, ES. Este documento reflete o
sistema **como implementado**; itens planejados estão marcados como futuros.

**Perfis de usuário**
- **Visitante** — não autenticado; busca e visualiza imóveis.
- **Cliente** — autenticado; favorita imóveis e solicita contato.
- **Locador** — cliente com perfil completo (CPF + telefone); publica e
  gerencia anúncios.

---

## Requisitos Funcionais (RF)

### Conta e acesso

| ID | Requisito |
|---|---|
| RF01 | O sistema deve permitir o cadastro de usuário com nome, e-mail e senha, retornando uma sessão autenticada (token JWT). |
| RF02 | O sistema deve permitir login com e-mail e senha. |
| RF03 | O sistema deve manter a sessão do usuário entre visitas (token persistido no navegador e restaurado ao carregar o app). |
| RF04 | O sistema deve permitir que um usuário autenticado se torne locador completando o perfil com CPF e telefone (WhatsApp). |

### Busca e visualização (público)

| ID | Requisito |
|---|---|
| RF05 | O sistema deve listar os imóveis com anúncio ativo, com filtros combináveis: cidade, tipo, nº mínimo de quartos, preço máximo e busca textual (título/descrição). |
| RF06 | O sistema deve permitir ordenar os resultados por mais recentes, menor preço, maior preço e maior área. |
| RF07 | O sistema deve exibir a página de detalhe do imóvel com fotos, características, comodidades, endereço (bairro/cidade) e dados públicos do locador (nome, desde quando anuncia, avaliação média). |
| RF08 | O sistema deve fornecer as opções dos filtros dinamicamente: tipos de imóvel e cidades que possuem ao menos um anúncio ativo. |

### Publicação e gestão de anúncios (locador)

| ID | Requisito |
|---|---|
| RF09 | O sistema deve permitir ao locador publicar um imóvel informando: tipo, endereço completo (rua, número, bairro, CEP, cidade/UF), título, descrição, preço mensal, quartos, banheiros, área e comodidades. |
| RF10 | O sistema deve permitir o envio de fotos do imóvel (mínimo 3), com upload para armazenamento em nuvem e definição de foto de capa. |
| RF11 | O sistema deve permitir ao locador editar seu anúncio (título, preço, descrição, quartos, banheiros, área). |
| RF12 | O sistema deve permitir ao locador pausar e reativar um anúncio; anúncios pausados não aparecem na busca pública. |
| RF13 | O sistema deve permitir ao locador excluir um anúncio, removendo em cascata fotos, favoritos, contatos e denúncias associados. |
| RF14 | O sistema deve oferecer um painel do locador com seus imóveis (filtráveis por status) e indicadores: total de imóveis, ativos e contatos recebidos. |

### Interesse e contato (cliente)

| ID | Requisito |
|---|---|
| RF15 | O sistema deve permitir ao cliente autenticado solicitar contato por um imóvel, registrando o interesse e exibindo o WhatsApp do locador. |
| RF16 | O sistema deve registrar no máximo um contato por cliente por anúncio (repetições apenas reexibem o WhatsApp). |
| RF17 | O sistema deve listar para o locador os contatos recebidos (nome do interessado, anúncio e data/hora), do mais recente ao mais antigo. |
| RF18 | O sistema deve permitir ao cliente autenticado favoritar e desfavoritar imóveis, com persistência entre sessões. |

### Funcionalidades futuras (planejadas — ver Etapa 6 do ROADMAP)

| ID | Requisito |
|---|---|
| RF19 | O sistema deverá permitir ao cliente avaliar um locador (1 a 5 estrelas e comentário opcional), limitado a uma avaliação por cliente e apenas a quem já solicitou contato de um anúncio dele; a média deve refletir no perfil público do locador. |
| RF20 | O sistema deverá permitir a um usuário autenticado denunciar um anúncio com justificativa, limitado a uma denúncia por usuário por anúncio. |
| RF21 | O sistema deverá oferecer um painel administrativo para triagem de denúncias: marcar como procedente (pausa o anúncio) ou improcedente (apenas encerra). |
| RF22 | O sistema deverá notificar o locador por e-mail ao receber um contato. |
| RF23 | O sistema deverá paginar a listagem de imóveis (carregamento incremental). |

---

## Requisitos Não Funcionais (RNF)

### Segurança

| ID | Requisito |
|---|---|
| RNF01 | Senhas devem ser armazenadas exclusivamente como hash bcrypt com salt — nunca em texto puro. |
| RNF02 | A autenticação deve ser stateless via JWT (HS256) com expiração de 24 h, validado em toda requisição autenticada. |
| RNF03 | Apenas o dono do anúncio pode editá-lo ou excluí-lo; ações de locador exigem perfil de locador completo (controle de autorização no servidor). |
| RNF04 | Endpoints sensíveis devem ter limitação de taxa por IP: login 10/min, cadastro 5/min e solicitação de contato 10/min (contra brute-force, enumeração de contas e colheita de telefones). |
| RNF05 | Toda entrada deve ser validada no servidor (rejeição com HTTP 422): e-mail em formato válido, CPF com 11 dígitos, telefone entre 10 e 13 dígitos, preço/área positivos, limites de texto alinhados às colunas do banco. |
| RNF06 | URLs de foto devem usar HTTPS e pertencer ao bucket de armazenamento do projeto (prefixo configurável) — URLs arbitrárias são rejeitadas. |
| RNF07 | O acesso à API a partir do navegador deve ser restrito às origens configuradas (CORS por variável de ambiente). |
| RNF08 | Segredos (chave JWT, credenciais de banco) devem viver em variáveis de ambiente, fora do controle de versão; o front só recebe chaves públicas por design (anon key). |
| RNF09 | As respostas da API devem expor apenas os campos definidos em schemas de saída (nenhum dado interno do banco, como CPF ou credenciais, é serializado); a mensagem de erro do login não distingue e-mail inexistente de senha errada. |

### Usabilidade

| ID | Requisito |
|---|---|
| RNF10 | A interface deve ser responsiva, funcionando em desktop e celular (breakpoints nas páginas de busca, detalhe e painel). |
| RNF11 | Toda ação assíncrona (busca, login, publicar, editar, excluir, favoritar, contato) deve dar feedback visual de carregamento e de erro, com opção de tentar novamente onde aplicável. |
| RNF12 | A interface deve estar em português do Brasil, com formatação local de moeda (R$) e datas. |
| RNF13 | Ações destrutivas (excluir imóvel) devem exigir confirmação do usuário. |

### Arquitetura, manutenibilidade e portabilidade

| ID | Requisito |
|---|---|
| RNF14 | O sistema deve separar apresentação (SPA React/Vite) e regra de negócio (API REST FastAPI + SQLAlchemy sobre PostgreSQL), comunicando-se por JSON/HTTP. |
| RNF15 | O esquema do banco deve ser versionado no repositório (`db/schema.sql`) como fonte da verdade. |
| RNF16 | O front deve ser publicável como site estático (Vercel/Netlify) e o backend em PaaS (Railway/Render), com banco e storage gerenciados (Supabase) — infraestrutura em free tier. |
| RNF17 | A API deve ser autodocumentada (OpenAPI/Swagger gerado pelo FastAPI em `/docs`). |

### Escalabilidade e desempenho

| ID | Requisito |
|---|---|
| RNF18 | A limitação de taxa usa armazenamento em memória (adequado a um worker); com múltiplos workers deve migrar para armazenamento compartilhado (Redis). |
| RNF19 | O upload de fotos deve ir direto do navegador para o storage (não transita pelo backend), evitando gargalo na API. |
| RNF20 | A busca da home deve usar debounce no cliente e descartar respostas obsoletas, evitando requisições redundantes e resultados fora de ordem. |

---

## Regras de Negócio (RN)

| ID | Regra |
|---|---|
| RN01 | A plataforma atende exclusivamente Alegre, ES (estrutura preparada para expansão por UF/cidade). |
| RN02 | Apenas anúncios com status "Ativo" aparecem na busca e no detalhe públicos; os únicos status manipuláveis são Ativo (A) e Pausado (P). |
| RN03 | Um anúncio exige no mínimo 3 fotos para ser publicado; sem capa explícita, a primeira foto é a capa. |
| RN04 | O contato entre as partes acontece fora da plataforma (WhatsApp); o sistema apenas intermedia a descoberta e registra o interesse. |
| RN05 | Preço e área devem ser maiores que zero; aluguel mínimo aceito no formulário é R$ 100. |
| RN06 | Cidades são criadas sob demanda na publicação (normalizadas por nome + UF para evitar duplicatas). |
