# Review: Endpoint de Login `/login`

Fase de revisão independente do spec [endpoint-login.spec.md](./endpoint-login.spec.md) e tarefas [endpoint-login.tasks.md](./endpoint-login.tasks.md).

## Resultado final: **PASS** ✔

---

## Checkpoints de AC (todos `rule` validados)

| AC | Tipo | Descrição | Evidência | Resultado |
|---|---|---|---|---|
| AC01 | rule | Login professor → 200 com token/role/usuario corretos | curl E2E 200 `{"token":"professor-dev-token-change-me","role":"PROFESSOR","usuario":{"id":1,...}}` | ✔ PASS |
| AC02 | rule | Login aluno → 200 com token/role/usuario corretos | curl E2E 200 `{"token":"aluno-dev-token-change-me","role":"ALUNO",...}` | ✔ PASS |
| AC03 | rule | Email não cadastrado → 401 Unauthorized | Teste unitário (jest `rejects.toThrow(UnauthorizedError)`) | ✔ PASS |
| AC04 | rule | Email ok + senha errada → 401 Unauthorized | curl E2E 401 `{"message":"Unauthorized"}` (sem distinção de campo) | ✔ PASS |
| AC05 | rule | Body inválido → 400 Validation error com fieldErrors | curl E2E `{}` retorna 400 com `errors.email`, `errors.senha` do Zod | ✔ PASS |
| AC06 | rule | Token obtido no login funciona em GET /posts | curl E2E: login → extrai token → `GET /posts` retorna HTTP 200 | ✔ PASS |
| AC07 | rule | npm run lint | exit 0, sem erros | ✔ PASS |
| AC08 | rule | npm test | 13 suites / **38 testes** (33 originais + 5 novos login) | ✔ PASS |
| AC09 | rule | npm run build | Build success in 23ms, chunks gerados | ✔ PASS |
| AC10 | rule | initializeSchema() popula techchallenge_usertype | `env.PROFESSOR_ACCESS_TOKEN` e `env.ALUNO_ACCESS_TOKEN` passados via placeholders $1/$2 no INSERT ON CONFLICT | ✔ PASS |

## Rubricas

### AC11 — Adesão à arquitetura em camadas (0-2)
- Score: **2/2**  (threshold ≥ 2: PASS)
- Rationale: Todas as 5 camadas implementadas no padrão do `CreatePostUseCase`:
  1. entities/models: [user.model.ts](file:///var/home/celso/Documentos/fiap/repos/techchallenge/src/entities/models/user.model.ts), [user.ts](file:///var/home/celso/Documentos/fiap/repos/techchallenge/src/entities/user.ts), [usertype.ts](file:///var/home/celso/Documentos/fiap/repos/techchallenge/src/entities/usertype.ts)
  2. repository interface: [user.repository.interface.ts](file:///var/home/celso/Documentos/fiap/repos/techchallenge/src/repositories/user.repository.interface.ts)
  3. repository impl PG: [user.repository.ts](file:///var/home/celso/Documentos/fiap/repos/techchallenge/src/repositories/pg/user.repository.ts)
  4. use-case + factory: [login.use-case.ts](file:///var/home/celso/Documentos/fiap/repos/techchallenge/src/use-cases/login.use-case.ts), [make-login-use-case.ts](file:///var/home/celso/Documentos/fiap/repos/techchallenge/src/use-cases/factory/make-login-use-case.ts)
  5. http controller registrado em app: [auth/routes.ts](file:///var/home/celso/Documentos/fiap/repos/techchallenge/src/http/controllers/auth/routes.ts), [app.ts](file:///var/home/celso/Documentos/fiap/repos/techchallenge/src/app.ts)
- Evidência: Criação de POST paralelo ao LoginUseCase, mesmo estilo de factory, mesma extensão de arquivo.

### AC12 — Segurança SQL + 401 genérico (0-2)
- Score: **2/2** (threshold ≥ 2: PASS)
- Rationale:
  - Queries usam placeholders em ambos os métodos do repository: `WHERE email = $1 AND senha = $2` e `WHERE id = $1` — nenhuma concatenação.
  - 3 casos distintos (email não encontrado, senha errada, userType ausente) lançam **mesmo** `UnauthorizedError` → resposta 401 genérica `{"message":"Unauthorized"}`, sem vazar qual campo foi inválido.
- Evidência: [user.repository.ts L32](file:///var/home/celso/Documentos/fiap/repos/techchallenge/src/repositories/pg/user.repository.ts#L31-L39) e [login.use-case.ts](file:///var/home/celso/Documentos/fiap/repos/techchallenge/src/use-cases/login.use-case.ts) L16 + L25.

## Achados (nenhum bloqueante / todos advisory)

1. **[Advisory]** Validação de body aceita `email: z.string().min(1)` (sem validação de formato). Escolha intencional para aceitar "username" caso front use nome como login. Se quiser endurecer, trocar para `.email()` em [auth/routes.ts L6](file:///var/home/celso/Documentos/fiap/repos/techchallenge/src/http/controllers/auth/routes.ts#L6).
2. **[Advisory]** Senha em texto plano no banco e na comparação. Conforme "Não-objetivos" do spec — consciente, não é dívida técnica aqui, apenas nota para a fase 2.

## Histórico de Review

| Data | Revisor | Resultado | Motivo |
|---|---|---|---|
| 2026-09-07 | Implementer-indep | PASS | Todos 10 rule ACs + 2 rubricas (score máximo) evidenciados |
