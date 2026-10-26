# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

API REST (Fastify 5 + PostgreSQL via `pg`, TypeScript ESM, Node 22+) do Tech Challenge FIAP. README, mensagens de erro e nomes de tabelas/colunas estão em português.

## Comandos

- `docker compose up -d` — sobe o PostgreSQL (necessário para rodar a API; os testes não precisam)
- `cp .env.example .env` — configuração inicial (valores devem bater com o `docker-compose.yml`)
- `npm run start:dev` — servidor com hot reload (`tsx watch src/server.ts`)
- `npm run build` — `tsup` gera ESM em `build/`
- `npm run lint` — `eslint src`; `npm run format` — prettier
- `npm test` — Jest; teste único: `npm test -- src/__tests__/use-cases/login.use-case.test.ts` (ou `-t "nome do teste"`)
- `docker build -t techchallenge .` — gera a imagem da API (`Dockerfile`); `docker-compose.prod.yml` sobe API + PostgreSQL a partir de uma imagem publicada (`DOCKER_IMAGE=...`)
- `npm run test:coverage` — cobertura com threshold global de 30%
- Seed opcional: `docker exec -i techchallenge-postgres psql -U root -d techchallenge < ./bd/schema_completo.sql`

O CI (`.github/workflows/main.yaml`) roda lint → test → build.

Atenção: o script `start` aponta para `tsx src/server.js`, mas o fonte é `src/server.ts`; use `start:dev` para rodar localmente.

## Arquitetura

Camadas: `http/controllers` (rotas Fastify + validação Zod) → `use-cases` → interfaces de repositório (`repositories/*.interface.ts`) → implementações `repositories/pg/*` que usam o `pool` de `lib/pg` com SQL puro (placeholders `$1, $2`). TypeORM está no `package.json`, mas não é usado.

- **Injeção de dependências manual**: cada use case tem uma factory em `use-cases/factory/make-*.ts` que instancia o repositório concreto. Controllers chamam a factory; testes instanciam o use case com repositório mockado (`src/__tests__/mocks`).
- **`src/app.ts`** monta o Fastify (rotas + `globalErrorHandler`); **`src/server.ts`** faz o listen e chama `initializeSchema()` (`lib/pg/init-schema.ts`), que cria as 3 tabelas (`techchallenge_posts`, `techchallenge_usertype`, `techchallenge_user`) e faz upsert dos tipos PROFESSOR/ALUNO com os tokens do `.env`.
- **Autenticação não é JWT**: o token é uma string estática por papel. `POST /login` valida email/senha e devolve o token de `techchallenge_usertype`; o middleware `authenticate` ignora o banco e compara o Bearer token com `PROFESSOR_ACCESS_TOKEN`/`ALUNO_ACCESS_TOKEN` do `.env` (`timingSafeEqual`), preenchendo `request.auth = { role }` (tipado em `src/@types/fastify.d.ts`). `authorize(...roles)` é uma factory de preHandler que checa `request.auth.role`.
- **Recursos**: posts (`/posts`), professores (`/professores`) e alunos (`/alunos`). Leitura de posts aceita PROFESSOR e ALUNO; escrita de posts e **todas** as rotas de professores e alunos exigem PROFESSOR.
- **Professores e alunos não têm tabela própria**: são linhas de `techchallenge_user` filtradas pelo tipo em `techchallenge_usertype` (`descricao = 'PROFESSOR'`/`'ALUNO'`, nunca id fixo). `repositories/pg/user-by-role.repository.ts` concentra o SQL (toda query filtra pelo papel, então um id de outro papel dá 404); `ProfessorRepository`/`AlunoRepository` só passam o papel e o mapeamento da entidade. A `senha` nunca é retornada, no `PUT` é opcional (`COALESCE` mantém a atual), e o email é único na tabela inteira (`isEmailInUse` → `EmailAlreadyInUseError`). Quem é cadastrado por essas rotas já autentica via `/login`.
- **Erros**: use cases lançam `UnauthorizedError`, `ForbiddenError`, `ResourceNotFoundError` ou `EmailAlreadyInUseError`; `utils/global-error-handler.ts` os mapeia para 401/403/404/409, e `ZodError` para 400 (resto 500).
- **Variáveis de ambiente** são validadas com Zod em `src/env/index.ts`; novas variáveis precisam ser adicionadas ali e em `.env.example`.

## Fluxo de trabalho (Git)

- Nunca commitar direto na `master`. Toda alteração deve ser feita em uma branch própria (ex.: `feat/...`, `fix/...`, `docs/...`) e levada para a `master` via Pull Request (`gh pr create`).
- Se estiver na `master` com alterações pendentes, crie a branch antes de commitar.
- Mensagens de commit seguem Conventional Commits em português (ex.: `feat(auth): ...`), como no histórico.
- O PR só deve ser mergeado com o CI (lint → test → build) passando.

## Convenções

- Imports relativos usam sufixo `.js` (ESM); o Jest mapeia isso via `moduleNameMapper`, então não remova o sufixo.
- Testes ficam em `src/__tests__/**/*.test.ts`, espelhando a estrutura de `src`. `http/`, `lib/`, `env/`, factories e `app/server` estão fora da cobertura.
- `.trae/specs/` contém specs/tarefas de features anteriores (ex.: endpoint de login), úteis como contexto de decisões.
