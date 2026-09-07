# Tasks: Endpoint de Login `/login`

Cobertura dos ACs do spec [endpoint-login.spec.md](./endpoint-login.spec.md)

---

## Task 1: Camada de entidade/model — criar User e UserType

- **Status**: pending
- **Priority**: high
- **Cobre ACs**: AC11
- **Descrição**:
  - Criar `src/entities/models/user.model.ts` com interfaces: `IUser`, `IUserType`, `ILoginRequest`, `ILoginResponse`
  - Criar `src/entities/user.ts` (classe de domínio User, similar a `Post`)
  - Criar `src/entities/usertype.ts` (classe de domínio UserType, similar a `Post`)
- **TR (rule)**: Interfaces compilam sem erro de TypeScript e seguem estrutura das tabelas:
  - IUser: id, nome, email, senha, tipo_usuario_id, data_criacao
  - IUserType: id, descricao, token (descricao ∈ {"PROFESSOR","ALUNO"})
  - ILoginRequest: { email: string, senha: string }
  - ILoginResponse: { token, role, usuario: { id, nome, email } }

## Task 2: Repository (interface + impl PG) para User e UserType

- **Status**: pending
- **Priority**: high
- **Depende de**: Task 1
- **Cobre ACs**: AC03, AC05, AC12
- **Descrição**:
  - Criar `src/repositories/user.repository.interface.ts` (IUserRepository com `findByEmailAndPassword(email, senha): Promise<IUser | null>` e `findUserTypeById(id): Promise<IUserType | null>`)
  - Criar `src/repositories/pg/user.repository.ts` (impl com pool de pg e placeholders `$1, $2` SEM concatenação)
- **TR (rule)**: Query de findByEmailAndPassword usa `WHERE email = $1 AND senha = $2` (ambos via placeholder) e retorna 0 ou 1 linha.
- **TR (rule)**: findUserTypeById usa `WHERE id = $1`.

## Task 3: Classe de erro (ou reuso) + UseCase Login

- **Status**: pending
- **Priority**: high
- **Depende de**: Task 2
- **Cobre ACs**: AC03, AC04, AC05, AC06, AC12
- **Descrição**:
  - Verificar se `UnauthorizedError` atende (já retorna 401); se sim, reutilizar. Senão criar `InvalidCredentialsError.ts` em use-cases/errors e adicionar case no `globalErrorHandler`
  - Criar `src/use-cases/login.use-case.ts`:
    - `constructor(private userRepository: IUserRepository)`
    - `execute({ email, senha }: ILoginRequest): Promise<ILoginResponse>`
    - fluxo: findByEmailAndPassword → null? throw 401 → findUserTypeById(tipo_usuario_id) → null? throw 401 → monta { token, role=descricao, usuario: {id,nome,email} }
- **TR (rule)**: Email não encontrado → lança UnauthorizedError sem distinção
- **TR (rule)**: Senha errada → lança UnauthorizedError sem distinção
- **TR (rule)**: User encontrado, UserType nulo (inconsistência) → lança UnauthorizedError
- **TR (rule)**: Happy path → retorna objeto com 3 chaves: `token`, `role`, `usuario`

## Task 4: Factory do LoginUseCase

- **Status**: pending
- **Priority**: medium
- **Depende de**: Task 3
- **Cobre ACs**: AC11
- **Descrição**: Criar `src/use-cases/factory/make-login-use-case.ts` seguindo o padrão de `make-create-post-use-case.ts` (instancia `UserRepository` PG e injeta no `LoginUseCase`)

## Task 5: Controller/Rota `POST /login`

- **Status**: pending
- **Priority**: high
- **Depende de**: Task 4
- **Cobre ACs**: AC01, AC02, AC03, AC04, AC05, AC06, AC08
- **Descrição**:
  - Opção 1: novo arquivo `src/http/controllers/auth/routes.ts` com `authRoutes(app: FastifyInstance)` contendo apenas `POST /login`
  - Opção 2: adicionar rota em post/routes.ts (não recomendado — separar concerns)
  - Body validado com Zod (z.object({ email: z.string().email() ou min(1), senha: z.string().min(1) })) — decidir: email com validação de formato `.email()` ou só `.string().min(1)`? (Usar `.min(1)` para aceitar qualquer "user" caso a pessoa use nome como login; mas campo é email no banco.)
  - Importante: **não** aplicar preHandlers `authenticate` / `authorize` nesta rota.
  - Registrar `authRoutes` no `src/app.ts`
- **TR (rule)**: `POST /login` sem header Authorization funciona (rota pública)
- **TR (rule)**: Body inválido (campos ausentes/vazios) → 400 com fieldErrors do Zod

## Task 6: Atualizar `init-schema.ts` para criar users e popular tipos

- **Status**: pending
- **Priority**: high
- **Cobre ACs**: AC09, AC10
- **Descrição**:
  - Em `src/lib/pg/init-schema.ts` adicionar:
    - CREATE TABLE IF NOT EXISTS `techchallenge_usertype` (id, descricao, token)
    - CREATE TABLE IF NOT EXISTS `techchallenge_user` (id, nome, email UNIQUE, senha, tipo_usuario_id REFERENCES ... ON DELETE CASCADE ON UPDATE CASCADE, data_criacao)
    - INSERT ... ON CONFLICT DO NOTHING dos 2 tipos de usuário com os tokens do `.env` — usar `env.PROFESSOR_ACCESS_TOKEN` e `env.ALUNO_ACCESS_TOKEN` na query (ou valores hardcoded iguais aos do env). Preferência: values com env para sincronia.
    - Ajustar sequences com `setval`
- **TR (rule)**: `initializeSchema()` roda sem erro mesmo se tabelas já existirem
- **TR (rule)**: Após rodar init, `techchallenge_usertype` tem 2 linhas com tokens corretos

## Task 7: Testes unitários do LoginUseCase

- **Status**: pending
- **Priority**: high
- **Depende de**: Task 3
- **Cobre ACs**: AC01, AC02, AC03, AC04, AC06, AC12
- **Descrição**: Criar `src/__tests__/use-cases/login.use-case.test.ts` + `src/__tests__/mocks/user.mock.ts`:
  - Caso 1: login professor → retorna token + role PROFESSOR + usuario
  - Caso 2: login aluno → retorna token + role ALUNO + usuario
  - Caso 3: email não existe → UnauthorizedError
  - Caso 4: senha errada → UnauthorizedError
  - Caso 5: user existe mas userType não encontra → UnauthorizedError
- **TR (rule)**: `npm test` roda todos os 5 casos e todos passam (junto dos 33 testes já existentes)

## Task 8: Validação final (lint, test, build) + teste E2E com curl

- **Status**: pending
- **Priority**: high
- **Depende de**: Task 1..7
- **Cobre ACs**: AC01..AC10
- **Descrição**:
  - `npm run lint`
  - `npm test`
  - `npm run build`
  - curl E2E:
    - POST /login credenciais professor → 200 + token
    - Usar token para GET /posts → 200 (integração)
    - POST /login senha errada → 401
    - POST /login body vazio → 400
- **TR (rule)**: Lint: exit 0
- **TR (rule)**: Testes: todos passam
- **TR (rule)**: Build: exit 0
- **TR (rule)**: 4 curls E2E com status HTTP esperados
