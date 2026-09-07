# Tech Challenge

API REST em Node.js e TypeScript com Fastify e PostgreSQL, desenvolvida como parte do Tech Challenge da Pós Tech (FIAP).

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) 22 ou superior
- [npm](https://www.npmjs.com/) (incluso na instalação do Node.js)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

## Instalação

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd techchallenge
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

Os valores devem corresponder às credenciais definidas no `docker-compose.yml`:

```env
PORT=3000

POSTGRES_USER=root
POSTGRES_PASSWORD=techchallenge
POSTGRES_DB=techchallenge
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

PROFESSOR_ACCESS_TOKEN=professor-dev-token-change-me
ALUNO_ACCESS_TOKEN=aluno-dev-token-change-me
```

### 3. Subir o banco de dados

O PostgreSQL roda em container via Docker Compose. Na primeira execução, o script `bd/schema_bd.sql` é aplicado automaticamente:

```bash
docker compose up -d
```

Para verificar se o container está saudável:

```bash
docker compose ps
```

Para parar o banco:

```bash
docker compose down
```

Para gerar primeiros registros no banco para testes (tabelas, tipos de usuário com tokens, 2 usuários de mock e 2 posts):
```bash
docker exec -i techchallenge-postgres psql -U root -d techchallenge < ./bd/schema_completo.sql
```

> **Aplicação também auto-inicializa o schema**: ao subir o servidor (`npm run start:dev` ou `npm run start`), o módulo `src/lib/pg/init-schema.ts` garante que as 3 tabelas (`techchallenge_posts`, `techchallenge_usertype`, `techchallenge_user`) existam e insere os dois tipos de usuário padrão (PROFESSOR e ALUNO) com os tokens do `.env`. Ou seja: mesmo em um banco vazio/volume novo, basta subir a app e o schema + roles são criados automaticamente.

### 4. Instalar dependências

```bash
npm install
```

### 5. Executar a aplicação

**Desenvolvimento** (com hot reload):

```bash
npm run start:dev
```

**Produção local** (build + execução):

```bash
npm run build
npm run start
```

A API ficará disponível em `http://localhost:3000` (ou na porta definida em `PORT`).

## Arquitetura

A aplicação segue uma arquitetura em camadas: controllers HTTP delegam para use cases, que dependem de interfaces de repositório implementadas com o driver `pg`.

| Camada              | Responsabilidade                             |
| ------------------- | -------------------------------------------- |
| `http/controllers/` | Rotas e handlers HTTP                        |
| `http/middleware/`  | Autenticação e autorização por access_token  |
| `use-cases/`        | Regras de aplicação e orquestração           |
| `repositories/`     | Contratos e implementações de acesso a dados |
| `entities/`         | Modelos de domínio (`Post`)                  |
| `lib/pg/`           | Pool de conexão PostgreSQL                   |
| `env/`              | Validação de variáveis de ambiente com Zod   |
| `utils/`            | Tratamento global de erros                   |

## Autenticação

Todas as rotas de **conteúdo** (`/posts/*`) exigem um `access_token` enviado no header:

```
Authorization: Bearer <access_token>
```

### 🔑 Como o front obtém o token: endpoint `/login`

O front-end **não precisa saber os tokens hardcoded do `.env`**. Em vez disso:

1. O usuário informa suas credenciais (email + senha) em uma tela de login no front
2. O front chama `POST /login` passando `{ email, senha }`
3. O backend:
   - Valida email+senha na tabela `techchallenge_user`
   - Resolve o papel (role) via `techchallenge_user.tipo_usuario_id` → `techchallenge_usertype`
   - Retorna `{ token, role, usuario }`
4. O front usa o `token` recebido no header `Authorization: Bearer <token>` nas próximas chamadas a `/posts/*`

> ⚠️ **Nota**: nesta versão, o **token não é JWT**. É uma string estática, idêntica em todos os logins do mesmo papel, e salva em `techchallenge_usertype.token`. O middleware `authenticate` continua comparando os tokens com os valores do `.env` (que estão sincronizados com o banco pela inicialização automática). Em versões futuras pode ser substituído por JWT sem alterar a interface do `/login`.

### Tokens e permissões

Os tokens são configurados estaticamente no `.env` e automaticamente sincronizados na tabela `techchallenge_usertype` quando a aplicação sobe:

| Variável | Papel (`role`) | Permissões |
| -------- | ----- | ---------- |
| `PROFESSOR_ACCESS_TOKEN` | `PROFESSOR` | Leitura e escrita (GET, POST, PUT, DELETE) |
| `ALUNO_ACCESS_TOKEN` | `ALUNO` | Apenas leitura (GET `/posts`, GET `/posts/search`, GET `/posts/:id`) |

### Respostas de erro (autenticação / autorização)

| Status | Situação |
| ------ | -------- |
| `400` | Body inválido no `/login` (campos ausentes / vazios) — via Zod |
| `401` | Credenciais inválidas no `/login` (email ou senha errados; ou inconsistência no role) **ou** token ausente/malformado/inválido nos endpoints de posts |
| `403` | Token válido, mas sem permissão para a operação (ex.: aluno tentando criar/editar/deletar post) |

---

### 🗄️ Modelo de dados do login (PostgreSQL)

O schema completo (incluindo tabelas de login) está em `bd/schema_completo.sql`.

**Tabela `techchallenge_usertype`** — papéis / roles + token de acesso:

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `id` | BIGSERIAL PK | |
| `descricao` | VARCHAR(50) | `PROFESSOR` ou `ALUNO` |
| `token` | VARCHAR(255) | access_token usado no header `Authorization` |

Registros padrão (criados automaticamente):

| id | descricao | token |
| --- | --- | --- |
| 1 | PROFESSOR | `professor-dev-token-change-me` |
| 2 | ALUNO | `aluno-dev-token-change-me` |

**Tabela `techchallenge_user`** — usuários cadastrados:

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `id` | BIGSERIAL PK | |
| `nome` | VARCHAR(255) | Nome completo do usuário |
| `email` | VARCHAR(255) UNIQUE | **Login do usuário** (identificador único) |
| `senha` | VARCHAR(255) | Senha em texto plano nesta versão |
| `tipo_usuario_id` | BIGINT FK → `techchallenge_usertype.id` | PAPEL do usuário (PROFESSOR / ALUNO) |
| `data_criacao` | TIMESTAMPTZ | default `CURRENT_TIMESTAMP` |

Usuários de mock do `schema_completo.sql`:

| nome | email | senha | papel |
| --- | --- | --- | --- |
| Dr. Carlos Mendes | `carlos.mendes@professor.fiap.br` | `senha-professor-123` | PROFESSOR |
| Ana Beatriz Silva | `ana.beatriz@aluno.fiap.br` | `senha-aluno-456` | ALUNO |

## Endpoints da API

### Autenticação

| Método | Rota    | Descrição                 | Autenticação       | Body / Query params                                                           |
| ------ | ------- | ------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| `POST` | `/login`| Autentica usuário e retorna token (Bearer) para chamar os outros endpoints | **Pública** (sem header) | `{ "email": "string", "senha": "string" }` — retorna `200` com `{ token, role, usuario }`, `401` se credenciais inválidas, `400` se body inválido |

### Posts (requerem Bearer token retornado no `/login`)

| Método   | Rota              | Descrição                                      | Autenticação | Body / Query params                                                                                |
| -------- | ----------------- | ---------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `GET`    | `/posts`          | Lista posts com paginação                      | Professor ou Aluno | `page` (padrão: 1), `limit` (padrão: 10, máx: 100)                                                 |
| `GET`    | `/posts/search`   | Busca posts por palavra-chave no título/conteúdo | Professor ou Aluno | `search` (obrigatório) — retorna `200` com lista de posts                                          |
| `GET`    | `/posts/:id`      | Busca um post pelo id                          | Professor ou Aluno | `id` na URL — retorna `404` se não encontrado                                                      |
| `POST`   | `/posts`          | Cria um novo post                              | Professor | `{ "titulo": "string", "conteudo": "string" }`                                                     |
| `PUT`    | `/posts/:id`      | Atualiza um post pelo id                       | Professor | `id` na URL; body `{ "titulo": "string", "conteudo": "string" }` — retorna `404` se não encontrado |
| `DELETE` | `/posts/:id`      | Remove um post pelo id                         | Professor | `id` na URL — retorna `404` se não encontrado                                                      |

### ⚡ Fluxo recomendado para o front-end (passo-a-passo)

```
Tela de login do usuário  ──► POST /login {email,senha}
                                   │
                                   ├── 400 → mostra erros de validação dos campos (Zod)
                                   ├── 401 → mostra "email ou senha inválidos" (mensagem genérica)
                                   └── 200 → salva {token, role, usuario} no estado do front (ex.: localStorage)
                                               │
                                               ▼
                                   Todas as próximas requisições a /posts enviam:
                                       Authorization: Bearer <token>
```

---

### Exemplo — login de professor

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "carlos.mendes@professor.fiap.br", "senha": "senha-professor-123"}'
```

Resposta (`200`):

```json
{
  "token": "professor-dev-token-change-me",
  "role": "PROFESSOR",
  "usuario": {
    "id": 1,
    "nome": "Dr. Carlos Mendes",
    "email": "carlos.mendes@professor.fiap.br"
  }
}
```

---

### Exemplo — login de aluno

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ana.beatriz@aluno.fiap.br", "senha": "senha-aluno-456"}'
```

Resposta (`200`):

```json
{
  "token": "aluno-dev-token-change-me",
  "role": "ALUNO",
  "usuario": {
    "id": 2,
    "nome": "Ana Beatriz Silva",
    "email": "ana.beatriz@aluno.fiap.br"
  }
}
```

---

### Exemplo — usar token obtido no login para listar posts (integração front → posts)

```bash
# 1) Faz login (salva o TOKEN retornado)
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos.mendes@professor.fiap.br","senha":"senha-professor-123"}' \
  | node -e "process.stdin.on('data', d => console.log(JSON.parse(d).token))")

# 2) Usa o token para listar posts (qualquer endpoint de /posts)
curl "http://localhost:3000/posts?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Exemplo — erro de credenciais no login (401)

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.beatriz@aluno.fiap.br","senha":"senha-errada"}'
```

Resposta (`401 Unauthorized`, mensagem genérica — não revela se erro foi email ou senha):

```json
{ "message": "Unauthorized" }
```

---

### Exemplo — body inválido no login (400)

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{}'
```

Resposta (`400 Validation error` com detalhes de campo via Zod):

```json
{
  "message": "Validation error",
  "errors": {
    "email":  ["Invalid input: expected string, received undefined"],
    "senha":  ["Invalid input: expected string, received undefined"]
  }
}
```

---

### Exemplo — criar post

```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer professor-dev-token-change-me" \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Novo post", "conteudo": "Texto do post"}'
```

Resposta (`201`):

```json
{
  "id": 3,
  "titulo": "Novo post",
  "conteudo": "Texto do post",
  "data_publicacao": "2026-06-30T01:15:20.103Z",
  "data_atualizacao": "2026-06-30T01:15:20.103Z"
}
```

### Exemplo — remover post

```bash
curl -X DELETE http://localhost:3000/posts/1 \
  -H "Authorization: Bearer professor-dev-token-change-me"
```

Resposta (`204`): sem corpo.

### Exemplo — atualizar post

```bash
curl -X PUT http://localhost:3000/posts/1 \
  -H "Authorization: Bearer professor-dev-token-change-me" \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Post atualizado", "conteudo": "Novo conteúdo do post"}'
```

Resposta (`200`):

```json
{
  "id": 1,
  "titulo": "Post atualizado",
  "conteudo": "Novo conteúdo do post",
  "data_publicacao": "2026-06-30T01:15:20.103Z",
  "data_atualizacao": "2026-07-05T17:30:00.000Z"
}
```

### Exemplo — listar posts

```bash
curl "http://localhost:3000/posts?page=1&limit=10" \
  -H "Authorization: Bearer aluno-dev-token-change-me"
```

Resposta (`200`):

```json
{
  "posts": [
    {
      "id": 1,
      "titulo": "Primeiro post",
      "conteudo": "Conteúdo do primeiro post",
      "data_publicacao": "2026-06-30T01:15:20.103Z",
      "data_atualizacao": "2026-06-30T01:15:20.103Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1
}
```

### Exemplo — buscar post por id

```bash
curl http://localhost:3000/posts/1 \
  -H "Authorization: Bearer aluno-dev-token-change-me"
```

Resposta (`200`):

```json
{
  "id": 1,
  "titulo": "Primeiro post",
  "conteudo": "Conteúdo do primeiro post",
  "data_publicacao": "2026-06-30T01:15:20.103Z",
  "data_atualizacao": "2026-06-30T01:15:20.103Z"
}
```

### Exemplo — buscar posts por palavra-chave

```bash
curl "http://localhost:3000/posts/search?search=primeiro" \
  -H "Authorization: Bearer aluno-dev-token-change-me"
```

Resposta (`200`):

```json
{
  "posts": [
    {
      "id": 1,
      "titulo": "Primeiro post",
      "conteudo": "Conteúdo do primeiro post",
      "data_publicacao": "2026-06-30T01:15:20.103Z",
      "data_atualizacao": "2026-06-30T01:15:20.103Z"
    }
  ]
}
```

## Scripts disponíveis

| Script      | Comando                    | Descrição                              |
| ----------- | -------------------------- | -------------------------------------- |
| `start:dev` | `tsx watch src/server.ts`  | Desenvolvimento com recarga automática |
| `start`     | `tsx src/server.js`        | Execução após build                    |
| `build`     | `tsup src --out-dir build` | Compila TypeScript para `build/`       |
| `lint`      | `eslint src`               | Verifica problemas de lint             |
| `format`    | `prettier --write .`       | Formata os arquivos do projeto         |
| `test`      | `jest`                     | Executa testes unitários               |
| `test:coverage` | `jest --coverage`      | Executa testes e gera relatório de cobertura |

## Testes unitários

Os testes utilizam **Jest** com mocks de repositório e banco de dados, portanto **não dependem** do PostgreSQL estar em execução.

```bash

npm test

npm run test:coverage
```

## Validação de código

```bash
npm run lint
```

O comando analisa os arquivos em `src/` usando ESLint com as regras recomendadas para JavaScript/TypeScript. Se houver problemas, o ESLint lista o arquivo, a linha e a regra violada para que possam ser corrigidos os apontamentos. Executar novamente até o comando terminar sem erros.

Para formatar o código automaticamente com Prettier:

```bash
npm run format
```

A configuração do ESLint fica em `eslint.config.js` na raiz do projeto.

## Integração contínua

O projeto possui um workflow de CI no GitHub Actions em [`.github/workflows/main.yaml`](.github/workflows/main.yaml).

O pipeline é executado automaticamente em **push** e **pull request** para a branch `master`, com as seguintes etapas:

1. Instalação de dependências (`npm install`)
2. Lint (`npm run lint`)
3. Testes unitários (`npm test`)
4. Build (`npm run build`)

Os testes no CI utilizam mocks e **não exigem** PostgreSQL. Para validar localmente antes do push:

```bash
npm install
npm run lint
npm test
npm run build
```

O status das execuções pode ser acompanhado na aba **Actions** do repositório no GitHub.

## Estrutura do repositório

```
techchallenge/
├── .github/
│   └── workflows/
│       └── main.yaml           # Pipeline de CI (lint, test, build)
├── bd/
│   ├── schema_bd.sql           # Script mínimo de inicialização (tabela de posts)
│   └── schema_completo.sql     # Schema completo + dados de mock (posts, users, usertypes)
├── src/
│   ├── app.ts                  # Bootstrap Fastify e registro de rotas (auth + posts)
│   ├── server.ts               # Entrada do servidor HTTP + inicialização do schema
│   ├── entities/
│   │   ├── models/             # Contratos TypeScript:
│   │   │   ├── post.model.ts   #   IPost, ICreatePost, IUpdatePost
│   │   │   ├── auth.model.ts   #   Role ("PROFESSOR"|"ALUNO"), AuthContext
│   │   │   └── user.model.ts   #   IUser, IUserType, ILoginRequest, ILoginResponse
│   │   ├── post.ts             # Classe de domínio Post
│   │   ├── user.ts             # Classe de domínio User
│   │   └── usertype.ts         # Classe de domínio UserType
│   ├── env/                    # Validação de variáveis de ambiente com Zod
│   ├── http/
│   │   ├── controllers/
│   │   │   ├── auth/
│   │   │   │   └── routes.ts   # POST /login (pública, sem autenticação)
│   │   │   └── post/
│   │   │       └── routes.ts   # GET/POST/PUT/DELETE /posts (protegidas)
│   │   └── middleware/
│   │       ├── authenticate.ts # Valida Bearer token (comparando com .env)
│   │       └── authorize.ts    # Valida papel (role) permitido na rota
│   ├── lib/pg/
│   │   ├── index.ts            # Pool de conexão PostgreSQL (driver pg)
│   │   └── init-schema.ts      # Auto-cria 3 tabelas + roles/tokens na inicialização
│   ├── repositories/
│   │   ├── post.repository.interface.ts
│   │   ├── user.repository.interface.ts
│   │   └── pg/                 # Implementações PostRepository, UserRepository (placeholders $1,$2)
│   ├── use-cases/
│   │   ├── find-posts.use-case.ts
│   │   ├── find-post-by-id.use-case.ts
│   │   ├── search-posts.use-case.ts
│   │   ├── create-post.use-case.ts
│   │   ├── update-post.use-case.ts
│   │   ├── delete-post.use-case.ts
│   │   ├── login.use-case.ts   # Valida credenciais e resolve token/role
│   │   ├── errors/             # UnauthorizedError, ForbiddenError, ResourceNotFoundError
│   │   └── factory/            # Factories: make-create-post-use-case, make-login-use-case, ...
│   ├── __tests__/              # Testes unitários (Jest + mocks) — 38 testes
│   └── utils/global-error-handler.ts  # Tratamento global (Zod 400, 401, 403, 404, 500)
├── jest.config.ts              # Configuração do Jest
├── coverage/                   # Relatório de cobertura (gerado por npm run test:coverage)
├── docker-compose.yml          # Configuração do PostgreSQL
├── .env.example                # Modelo de variáveis de ambiente
├── package.json
└── .env                        # Variáveis de ambiente (criar localmente)
```

## Solução de problemas

**Porta 5432 já em uso**

Altere a porta no `docker-compose.yml` (ex.: `"5433:5432"`) e atualize `POSTGRES_PORT` no `.env`.

**Container do PostgreSQL não inicia**

Verifique os logs:

```bash
docker compose logs postgres
```

**Erro de conexão com o banco**

Confirme que o container está rodando (`docker compose ps`) e que as variáveis do `.env` coincidem com as do `docker-compose.yml`.

## Release

Foi criada uma release no GitHub, de modo a taguear o "fim" dessa fase. Não sei como será a continuidade, mas se seguirmos este projeto, acredito que fará sentido para acompanhar os marcos de entrega.


## Dificuldades no projeto

**Tempo para o volume de aulas**

Encontrei dificuldade em conseguir acompanhar todas as aulas em vídeo, por conta de tempo disponível X volume de aulas.
Com isso, tentei realizar a entrega mais próxima possível do que vi em aula, e utilizei-me do recurso de IA para principalmente apoiar na documentação do projeto.
