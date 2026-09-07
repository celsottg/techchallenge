-- ============================================================
--  TECH CHALLENGE — Schema completo + dados de mock
--  Este script cria todas as tabelas e insere registros iniciais
-- ============================================================

-- ------------------------------------------------------------
-- TABELA: techchallenge_posts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS techchallenge_posts (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- TABELA: techchallenge_usertype
-- Armazena os papéis (roles) e seus respectivos access_tokens
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS techchallenge_usertype (
    id BIGSERIAL PRIMARY KEY,
    descricao VARCHAR(50) NOT NULL,
    token VARCHAR(255) NOT NULL
);

-- ------------------------------------------------------------
-- TABELA: techchallenge_user
-- Usuários da plataforma (professores e alunos)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS techchallenge_user (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(50) NOT NULL,
    tipo_usuario_id BIGINT
        REFERENCES techchallenge_usertype(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DADOS DE MOCK
-- ============================================================

-- ------------------------------------------------------------
-- 1) Tipos de usuário (roles) com seus access_tokens
-- ------------------------------------------------------------
INSERT INTO techchallenge_usertype (id, descricao, token)
VALUES
    (1, 'PROFESSOR', 'professor-dev-token-change-me'),
    (2, 'ALUNO',     'aluno-dev-token-change-me')
ON CONFLICT (id) DO NOTHING;

-- Garante que a sequência do SERIAL fique alinhada após inserts manuais
SELECT setval(pg_get_serial_sequence('techchallenge_usertype', 'id'),
              (SELECT COALESCE(MAX(id), 0) FROM techchallenge_usertype));

-- ------------------------------------------------------------
-- 2) Usuários de mock: 1 professor + 1 aluno
-- ------------------------------------------------------------
INSERT INTO techchallenge_user (nome, email, senha, tipo_usuario_id)
VALUES
    (
        'Dr. Carlos Mendes',
        'carlos.mendes@professor.fiap.br',
        'senha-professor-123',
        1
    ),
    (
        'Ana Beatriz Silva',
        'ana.beatriz@aluno.fiap.br',
        'senha-aluno-456',
        2
    )
ON CONFLICT (email) DO NOTHING;

-- ------------------------------------------------------------
-- 3) Posts de mock (2 registros como solicitado)
-- ------------------------------------------------------------
INSERT INTO techchallenge_posts (id, titulo, conteudo, data_publicacao, data_atualizacao)
VALUES
    (
        1,
        'Boas-vindas ao Tech Challenge',
        E'Olá, turma!\n\nSejam todos muito bem-vindos ao nosso Tech Challenge. Neste módulo construiremos uma API REST completa com Node.js, TypeScript, Fastify e PostgreSQL. Preparei o material de apoio na área do aluno.\n\nQualquer dúvida, estou à disposição.\n\nAtenciosamente,\nProf. Carlos Mendes',
        '2026-08-01 09:00:00-03',
        '2026-08-01 09:00:00-03'
    ),
    (
        2,
        'Aula 02 — Arquitetura em Camadas e Use Cases',
        E'Na aula de hoje vamos explorar a arquitetura em camadas:\n\n1. Controllers HTTP (rotas e handlers)\n2. Use Cases (regras de aplicação)\n3. Repositories (acesso a dados via interface)\n4. Entities (modelos de domínio)\n\nLembre-se de fazer os exercícios propostos e subir a sua branch no repositório até a próxima sexta-feira.\n\nBons estudos!',
        '2026-08-05 19:30:00-03',
        '2026-08-06 10:15:00-03'
    )
ON CONFLICT (id) DO NOTHING;

-- Garante que a sequência do SERIAL dos posts fique alinhada
SELECT setval(pg_get_serial_sequence('techchallenge_posts', 'id'),
              (SELECT COALESCE(MAX(id), 0) FROM techchallenge_posts));
