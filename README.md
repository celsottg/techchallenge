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

Crie um arquivo `.env` na raiz do projeto com o conteúdo abaixo. Os valores devem corresponder às credenciais definidas no `docker-compose.yml`:

```env
PORT=3000

POSTGRES_USER=root
POSTGRES_PASSWORD=techchallenge
POSTGRES_DB=techchallenge
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

> O arquivo `.env` não é versionado. Nunca commite credenciais reais no repositório.

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

> **Atenção:** `docker compose down -v` remove também o volume de dados do PostgreSQL.

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
│   └── schema_bd.sql       # Script de inicialização do banco
├── docs/
│   └── README.md           # Documentação detalhada da API e arquitetura
├── src/                    # Código-fonte da aplicação
├── docker-compose.yml      # Configuração do PostgreSQL
├── package.json
└── .env                    # Variáveis de ambiente (criar localmente)
```

## Documentação adicional

Para detalhes sobre arquitetura, endpoints e exemplos de requisições, consulte [docs/README.md](docs/README.md).

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
