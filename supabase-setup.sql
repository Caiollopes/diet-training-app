-- 📊 SCRIPT PARA CRIAR TABELAS NO SUPABASE
-- Copie e cole isto no SQL Editor do Supabase

-- Tabela de Usuários
CREATE TABLE users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Dietas
CREATE TABLE diets (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  phone TEXT UNIQUE NOT NULL REFERENCES users(phone) ON DELETE CASCADE,
  plans JSONB NOT NULL DEFAULT '[]',
  diet_data JSONB NOT NULL DEFAULT '{}',
  period_order TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Treinos
CREATE TABLE workouts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  phone TEXT UNIQUE NOT NULL REFERENCES users(phone) ON DELETE CASCADE,
  plans JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_diets_phone ON diets(phone);
CREATE INDEX idx_workouts_phone ON workouts(phone);

-- Desabilitar RLS (Row Level Security) para desenvolvimento
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE diets DISABLE ROW LEVEL SECURITY;
ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Enable all for users" ON users;
DROP POLICY IF EXISTS "Enable all for diets" ON diets;
DROP POLICY IF EXISTS "Enable all for workouts" ON workouts;

-- Nota: Para produção, implemente políticas RLS adequadas
-- Por enquanto, RLS está desabilitado para desenvolvimento
