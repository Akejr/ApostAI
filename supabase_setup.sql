-- Script de configuração do Supabase para o Painel Admin
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    plan VARCHAR(20) CHECK (plan IN ('Básico', 'Pro', 'Premium')) NOT NULL,
    credits INTEGER DEFAULT 0,
    analyses INTEGER DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('active', 'expired')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inserir usuário admin padrão (senha: aeiou123)
INSERT INTO admin_users (username, password_hash) 
VALUES ('ecasanovs', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (username) DO NOTHING;

-- 4. Inserir alguns usuários de exemplo
INSERT INTO users (name, code, plan, credits, analyses, status, expires_at) VALUES
('João Silva', 'JS2024001', 'Pro', 15, 47, 'active', NOW() + INTERVAL '30 days'),
('Maria Santos', 'MS2024002', 'Básico', 7, 23, 'active', NOW() + INTERVAL '30 days'),
('Pedro Costa', 'PC2024003', 'Premium', 0, 89, 'expired', NOW() - INTERVAL '5 days')
ON CONFLICT (code) DO NOTHING;

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Criar trigger para atualizar updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Configurar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas de acesso (permitir leitura e escrita para todos - em produção seria mais restritivo)
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on admin_users" ON admin_users
    FOR ALL USING (true);

-- 9. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_code ON users(code);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_expires_at ON users(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- 10. Comentários para documentação
COMMENT ON TABLE users IS 'Tabela de usuários do sistema de apostas';
COMMENT ON TABLE admin_users IS 'Tabela de administradores do sistema';
COMMENT ON COLUMN users.code IS 'Código único de acesso do usuário';
COMMENT ON COLUMN users.credits IS 'Créditos restantes para análises';
COMMENT ON COLUMN users.analyses IS 'Número total de análises realizadas';
COMMENT ON COLUMN users.expires_at IS 'Data de expiração do plano';

-- Verificar se as tabelas foram criadas corretamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'admin_users')
ORDER BY table_name, ordinal_position;
