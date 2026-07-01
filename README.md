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

| Camada | Responsabilidade |
|--------|------------------|
| `http/controllers/` | Rotas e handlers HTTP |
| `use-cases/` | Regras de aplicação e orquestração |
| `repositories/` | Contratos e implementações de acesso a dados |
| `entities/` | Modelos de domínio (`Post`) |
| `lib/pg/` | Pool de conexão PostgreSQL |
| `env/` | Validação de variáveis de ambiente com Zod |
| `utils/` | Tratamento global de erros |

## Endpoints da API

| Método | Rota | Descrição | Query params |
|--------|------|-----------|--------------|
| `GET` | `/posts` | Lista posts com paginação | `page` (padrão: 1), `limit` (padrão: 10, máx: 100) |

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

## Scripts disponíveis

| Script        | Comando                        | Descrição                              |
|---------------|--------------------------------|----------------------------------------|
| `start:dev`   | `tsx watch src/server.ts`      | Desenvolvimento com recarga automática |
| `start`       | `tsx src/server.js`            | Execução após build                    |
| `build`       | `tsup src --out-dir build`     | Compila TypeScript para `build/`       |
| `lint`        | `eslint src`                   | Verifica problemas de lint             |
| `format`      | `prettier --write .`           | Formata os arquivos do projeto         |

## Estrutura do repositório

```
techchallenge/
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
│   │   └── post/               # Rotas de posts (GET /posts)
│   ├── lib/pg/                 # Pool PostgreSQL
│   ├── repositories/
│   │   ├── post.repository.interface.ts
│   │   └── pg/                 # Implementação com driver pg
│   ├── use-cases/
│   │   ├── find-posts.use-case.ts
│   │   ├── errors/
│   │   └── factory/
│   └── utils/                  # Tratamento global de erros
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
