# Especificação: Endpoint de Login `/login`

## Problema

Hoje a autenticação do backend é baseada em `access_token` estático vindo do `.env` (PROFESSOR_ACCESS_TOKEN / ALUNO_ACCESS_TOKEN). O cliente front-end não possui nenhum ponto de entrada para descobrir qual token usar; o usuário/cliente precisa saber o token com antecedência. Precisamos criar um endpoint `/login` onde o front envia credenciais (usuário + senha), o backend valida contra as tabelas `techchallenge_user` e `techchallenge_usertype`, e retorna o token correspondente ao papel do usuário para ser usado nos demais endpoints.

## Usuários

- **Front-end**: consome o endpoint `/login` com credenciais e usa o token retornado no header `Authorization: Bearer <token>` dos demais endpoints.
- **Professor / Aluno**: donos finais das credenciais que serão autenticados pelo sistema.

## Objetivos

- Criar endpoint público `POST /login` (sem exigir autenticação prévia)
- Receber credenciais (`email` + `senha`) no body JSON
- Validar usuário na tabela `techchallenge_user` (email + senha exatos)
- Resolver papel/token via tabela `techchallenge_usertype` relacionada por `tipo_usuario_id`
- Retornar `{ token, role, usuario }` para o front
- Integrar com o tratamento global de erros existente (401 para credenciais inválidas, 400 para validação de schema)
- Atualizar a inicialização automática de schema (`init-schema.ts`) para incluir as tabelas de usuário/tipo-usuario, garantindo que o novo endpoint funcione mesmo em volumes PostgreSQL limpos ou existentes
- Seguir os padrões existentes do projeto (camadas entity/model → repository interface → PG impl → use case → factory → controller/route; testes unitários com Jest + mocks)
- **Não alterar** os middwares `authenticate.ts`/`authorize.ts` nem os demais endpoints de posts (continuam funcionando via Bearer token estático)
- **Não** implementar JWT nessa entrega, apenas retornar o token cadastrado em `techchallenge_usertype.token`

## Não-objetivos

- Não alterar endpoints de `/posts` ou seus fluxos de autorização
- Não adicionar hash de senha (bcrypt/scrypt) agora — senha é comparada em texto plano como cadastrado no mock
- Não implementar refresh token, expiração ou logout
- Não implementar endpoint de cadastro de usuário
- Não alterar os tokens estáticos do `.env` (ambos os modos — `.env` antigo e tabela `techchallenge_usertype` — coexistem para compatibilidade; o middleware `authenticate` permanece lendo do `.env`)

## Requisitos Funcionais (RF)

1. **RF01 — Receber credenciais**: `POST /login` aceita body JSON `{ email: string, senha: string }`.
2. **RF02 — Validação de schema**: Campos ausentes, strings vazias ou tipos inválidos → `400` com mensagens estruturadas (via Zod integrado ao `globalErrorHandler`).
3. **RF03 — Buscar usuário**: Consulta `techchallenge_user` por `email` único e compara `senha` exata (case-sensitive).
4. **RF04 — Credenciais inválidas**: Se email não existir OU senha divergir → `401 Unauthorized` (mensagem genérica, sem vazar qual campo falhou).
5. **RF05 — Resolver tipo do usuário**: Pega `tipo_usuario_id` do usuário encontrado e busca o registro correspondente em `techchallenge_usertype` (campos `descricao` e `token`).
6. **RF06 — Token ausente por inconsistência**: Se tipo do usuário não existir na tabela (inconsistencia de dados) → `401 Unauthorized`.
7. **RF07 — Resposta de sucesso**: `200 OK` com `{ token: string, role: "PROFESSOR" | "ALUNO", usuario: { id, nome, email } }`.
8. **RF08 — Endpoint público**: `/login` **não** passa pelos preHandlers `authenticate` nem `authorize`.
9. **RF09 — Init schema automático**: `initializeSchema()` em `src/lib/pg/init-schema.ts` também cria `techchallenge_usertype` e `techchallenge_user` se não existirem, usando a mesma estrutura do `bd/schema_completo.sql` (FKs corretas).

## Requisitos Não-Funcionais (RNF)

1. **RNF01 — Arquitetura em camadas**: seguir estritamente o padrão existente (entities/models, repositories, use-cases, factories, http/controllers).
2. **RNF02 — Erros customizados**: usar classe específica de erro (ex.: `InvalidCredentialsError`) ou reutilizar `UnauthorizedError` já tratada pelo `globalErrorHandler` → `401`.
3. **RNF03 — Query parametrizada**: todas as queries no repository devem usar placeholders `$1, $2` do `pg` (nunca concatenação de string com entrada do usuário).
4. **RNF04 — Idempotência de schema**: SQL de inicialização usa `CREATE TABLE IF NOT EXISTS` e `INSERT ... ON CONFLICT DO NOTHING` para os tipos de usuário padrão com os tokens do `.env` (garante tokens consistentes no banco).
5. **RNF05 — Testes unitários**: cobertura do use case `LoginUseCase` com mock de repositório (pelo menos casos: sucesso, email não encontrado, senha errada, tipo de usuário faltante).
6. **RNF06 — Lint e build**: `npm run lint`, `npm test` e `npm run build` passam sem erros após as alterações.
7. **RNF07 — Sem dependências novas**: não instalar novos pacotes; aproveitar zod, pg, jest já existentes.

## Restrições / Dependências

- Tabelas `techchallenge_usertype` e `techchallenge_user` estão definidas em `bd/schema_completo.sql`
- Tokens existentes: `professor-dev-token-change-me` (PROFESSOR, id=1) e `aluno-dev-token-change-me` (ALUNO, id=2)
- Usuários mock cadastrados para teste:
  - Professor: `carlos.mendes@professor.fiap.br` / `senha-professor-123`
  - Aluno: `ana.beatriz@aluno.fiap.br` / `senha-aluno-456`
- Middleware `authenticate` continua lendo tokens de `env.PROFESSOR_ACCESS_TOKEN` e `env.ALUNO_ACCESS_TOKEN` → o login retornará os mesmos valores, garantindo compatibilidade.

## Premissas

- Campo de login é o `email` da tabela `techchallenge_user` (único por constraint UNIQUE). O usuário mencionou "user e senha"; mapeamos "user" → `email` por ser o identificador único existente na tabela. Se preferir outro campo (ex.: nome como login), ajustar na implementação.
- Senhas são armazenadas e comparadas em texto plano por enquanto (conforme "não-objetivos" acima).
- O token retornado é idêntico ao `token` da tabela `techchallenge_usertype`, que por sua vez replica os valores do `.env` (compatibilidade).

## Questões em Aberto

Nenhuma. Identificador "user" mapeado para `email` conforme estrutura da tabela.

## Critérios de Aceite (AC)

### `rule`

- **AC01 (rule)**: Ao enviar `POST /login` com `{ email: "carlos.mendes@professor.fiap.br", senha: "senha-professor-123" }`, a resposta é `200` contendo `{ token: "professor-dev-token-change-me", role: "PROFESSOR", usuario: { id, nome, email } }` e `email` do usuário bate.
- **AC02 (rule)**: Ao enviar `POST /login` com `{ email: "ana.beatriz@aluno.fiap.br", senha: "senha-aluno-456" }`, a resposta é `200` contendo `{ token: "aluno-dev-token-change-me", role: "ALUNO", ... }`.
- **AC03 (rule)**: Ao enviar email não cadastrado, retorna `401 Unauthorized` sem detalhes.
- **AC04 (rule)**: Ao enviar email correto + senha errada, retorna `401 Unauthorized` sem detalhes.
- **AC05 (rule)**: Body com `{ email: "", senha: "x" }` ou campos ausentes retorna `400 Validation error` com erros de campo via Zod.
- **AC06 (rule)**: Requisição para `GET /posts` com o token obtido em login de professor retorna `200` com lista de posts (integração token → middleware existente).
- **AC07 (rule)**: `npm run lint` passa sem erros após a implementação.
- **AC08 (rule)**: `npm test` passa com todos os testes (incluindo os novos de login).
- **AC09 (rule)**: `npm run build` completa com sucesso.
- **AC10 (rule)**: Em um banco vazio, após rodar `initializeSchema()` existem 2 registros em `techchallenge_usertype` (PROFESSOR e ALUNO) com os tokens corretos.

### `rubric`

- **AC11 (rubric)**: Adesão à arquitetura em camadas (0-2):
  - 0: código amontoado em rota, sem repository/use case
  - 1: camadas existem mas fiam interfaces ou factory
  - 2: entity/model → interface repository → impl PG → use case → factory → rota, todos presentes e seguindo exatamente o estilo do `CreatePostUseCase` (pass)
- **AC12 (rubric)**: Segurança e boas práticas SQL (0-2):
  - 0: concatenação de strings na query
  - 1: placeholders mas erro vaza detalhes de email/senha
  - 2: placeholders `$1/$2`, erro 401 genérico sem distinção entre email ou senha (pass)
