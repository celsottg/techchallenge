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
| `use-cases/`        | Regras de aplicação e orquestração           |
| `repositories/`     | Contratos e implementações de acesso a dados |
| `entities/`         | Modelos de domínio (`Post`)                  |
| `lib/pg/`           | Pool de conexão PostgreSQL                   |
| `env/`              | Validação de variáveis de ambiente com Zod   |
| `utils/`            | Tratamento global de erros                   |

## Endpoints da API

| Método   | Rota              | Descrição                                      | Body / Query params                                                                                |
| -------- | ----------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `GET`    | `/posts`          | Lista posts com paginação                      | `page` (padrão: 1), `limit` (padrão: 10, máx: 100)                                                 |
| `GET`    | `/posts/search`   | Busca posts por palavra-chave no título/conteúdo | `search` (obrigatório) — retorna `200` com lista de posts                                          |
| `GET`    | `/posts/:id`      | Busca um post pelo id                          | `id` na URL — retorna `404` se não encontrado                                                      |
| `POST`   | `/posts`          | Cria um novo post                              | `{ "titulo": "string", "conteudo": "string" }`                                                     |
| `PUT`    | `/posts/:id`      | Atualiza um post pelo id                       | `id` na URL; body `{ "titulo": "string", "conteudo": "string" }` — retorna `404` se não encontrado |
| `DELETE` | `/posts/:id`      | Remove um post pelo id                         | `id` na URL — retorna `404` se não encontrado                                                      |

### Exemplo — criar post

```bash
curl -X POST http://localhost:3000/posts \
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
curl -X DELETE http://localhost:3000/posts/1
```

Resposta (`204`): sem corpo.

### Exemplo — atualizar post

```bash
curl -X PUT http://localhost:3000/posts/1 \
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
curl "http://localhost:3000/posts?page=1&limit=10"
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
curl http://localhost:3000/posts/1
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
curl "http://localhost:3000/posts/search?search=primeiro"
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
│   └── schema_bd.sql           # Script de inicialização do banco
├── src/
│   ├── app.ts                  # Bootstrap Fastify e registro de rotas
│   ├── server.ts               # Entrada do servidor HTTP
│   ├── entities/
│   │   ├── models/             # Contratos TypeScript (IPost)
│   │   └── post.ts             # Classe de domínio Post
│   ├── env/                    # Validação de variáveis de ambiente
│   ├── http/controllers/
│   │   └── post/               # Rotas de posts (GET, POST, PUT e DELETE /posts)
│   ├── lib/pg/                 # Pool PostgreSQL
│   ├── repositories/
│   │   ├── post.repository.interface.ts
│   │   └── pg/                 # Implementação com driver pg
│   ├── use-cases/
│   │   ├── find-posts.use-case.ts
│   │   ├── find-post-by-id.use-case.ts
│   │   ├── search-posts.use-case.ts
│   │   ├── create-post.use-case.ts
│   │   ├── update-post.use-case.ts
│   │   ├── delete-post.use-case.ts
│   │   ├── errors/
│   │   └── factory/
│   ├── __tests__/              # Testes unitários (Jest + mocks)
│   └── utils/                  # Tratamento global de erros
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
