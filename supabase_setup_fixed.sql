-- Script de configuração do Supabase para o Painel Admin (VERSÃO CORRIGIDA)
-- Execute este script no SQL Editor do Supabase
-- Este script verifica se os objetos já existem antes de criá-los

-- 1. Criar tabela de usuários (se não existir)
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

-- 2. Criar tabela de administradores (se não existir)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inserir usuário admin padrão (senha: aeiou123) - apenas se não existir
INSERT INTO admin_users (username, password_hash) 
VALUES ('ecasanovs', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (username) DO NOTHING;

-- 4. Inserir alguns usuários de exemplo - apenas se não existirem
INSERT INTO users (name, code, plan, credits, analyses, status, expires_at) VALUES
('João Silva', 'JS2024001', 'Pro', 15, 47, 'active', NOW() + INTERVAL '30 days'),
('Maria Santos', 'MS2024002', 'Básico', 7, 23, 'active', NOW() + INTERVAL '30 days'),
('Pedro Costa', 'PC2024003', 'Premium', 0, 89, 'expired', NOW() - INTERVAL '5 days')
ON CONFLICT (code) DO NOTHING;

-- 5. Criar função para atualizar updated_at automaticamente (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Criar trigger para atualizar updated_at (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_users_updated_at' 
        AND tgrelid = 'users'::regclass
    ) THEN
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger update_users_updated_at criado com sucesso';
    ELSE
        RAISE NOTICE 'Trigger update_users_updated_at já existe, pulando criação';
    END IF;
END $$;

-- 7. Configurar Row Level Security (RLS) - apenas se não estiver habilitado
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'users' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para tabela users';
    ELSE
        RAISE NOTICE 'RLS já está habilitado para tabela users';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'admin_users' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para tabela admin_users';
    ELSE
        RAISE NOTICE 'RLS já está habilitado para tabela admin_users';
    END IF;
END $$;

-- 8. Criar políticas de acesso (permitir leitura e escrita para todos - em produção seria mais restritivo)
-- Verificar se as políticas já existem antes de criar
DO $$
BEGIN
    -- Política para tabela users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Allow all operations on users'
    ) THEN
        CREATE POLICY "Allow all operations on users" ON users
            FOR ALL USING (true);
        RAISE NOTICE 'Política para users criada com sucesso';
    ELSE
        RAISE NOTICE 'Política para users já existe, pulando criação';
    END IF;
    
    -- Política para tabela admin_users
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'admin_users' 
        AND policyname = 'Allow all operations on admin_users'
    ) THEN
        CREATE POLICY "Allow all operations on admin_users" ON admin_users
            FOR ALL USING (true);
        RAISE NOTICE 'Política para admin_users criada com sucesso';
    ELSE
        RAISE NOTICE 'Política para admin_users já existe, pulando criação';
    END IF;
END $$;

-- 9. Criar índices para melhor performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_users_code ON users(code);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_expires_at ON users(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);

-- 10. NOVO: Função para resetar créditos diários automaticamente
CREATE OR REPLACE FUNCTION reset_daily_credits()
RETURNS void AS $$
BEGIN
    -- Resetar créditos para usuários ativos (não Premium)
    UPDATE users 
    SET 
        credits = CASE 
            WHEN plan = 'Básico' THEN 7
            WHEN plan = 'Pro' THEN 15
            ELSE credits
        END,
        updated_at = NOW()
    WHERE status = 'active' 
    AND plan != 'Premium';
    
    -- Log da operação
    RAISE NOTICE 'Créditos diários resetados para usuários ativos (não Premium)';
END;
$$ LANGUAGE plpgsql;

-- 11. NOVO: Função para verificar e atualizar créditos de um usuário
CREATE OR REPLACE FUNCTION check_and_update_user_credits(user_id UUID)
RETURNS TABLE(
    has_credits BOOLEAN,
    credits_left INTEGER,
    plan_type VARCHAR(20),
    can_analyze BOOLEAN
) AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Buscar informações do usuário
    SELECT * INTO user_record 
    FROM users 
    WHERE id = user_id AND status = 'active';
    
    -- Se usuário não encontrado ou inativo
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, 'unknown'::VARCHAR(20), false;
        RETURN;
    END IF;
    
    -- Se for Premium, sempre pode analisar
    IF user_record.plan = 'Premium' THEN
        RETURN QUERY SELECT true, 999, user_record.plan, true;
        RETURN;
    END IF;
    
    -- Verificar se tem créditos
    IF user_record.credits > 0 THEN
        RETURN QUERY SELECT true, user_record.credits, user_record.plan, true;
    ELSE
        RETURN QUERY SELECT false, 0, user_record.plan, false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 12. NOVO: Função para descontar crédito e incrementar análises
CREATE OR REPLACE FUNCTION deduct_user_credit_and_increment_analyses(user_id UUID)
RETURNS TABLE(
    success BOOLEAN,
    credits_left INTEGER,
    analyses_count INTEGER,
    error_message TEXT
) AS $$
DECLARE
    user_record RECORD;
    credit_check RECORD;
BEGIN
    -- Verificar se usuário pode analisar
    SELECT * INTO credit_check 
    FROM check_and_update_user_credits(user_id);
    
    -- Se não pode analisar
    IF NOT credit_check.can_analyze THEN
        RETURN QUERY SELECT false, 0, 0, 'Sem créditos disponíveis ou usuário inativo';
        RETURN;
    END IF;
    
    -- Se for Premium, não desconta mas incrementa análises
    IF credit_check.plan_type = 'Premium' THEN
        UPDATE users 
        SET analyses = analyses + 1, updated_at = NOW()
        WHERE id = user_id;
        
        RETURN QUERY SELECT true, 999, (SELECT analyses FROM users WHERE id = user_id), '';
        RETURN;
    END IF;
    
    -- Descontar crédito e incrementar análises
    UPDATE users 
    SET 
        credits = credits - 1,
        analyses = analyses + 1,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Retornar resultado
    SELECT * INTO user_record FROM users WHERE id = user_id;
    RETURN QUERY SELECT true, user_record.credits, user_record.analyses, '';
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT false, 0, 0, 'Erro interno: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 13. NOVO: Criar view para estatísticas de créditos (se não existir)
CREATE OR REPLACE VIEW user_credits_stats AS
SELECT 
    plan,
    COUNT(*) as total_users,
    AVG(credits) as avg_credits,
    SUM(analyses) as total_analyses,
    COUNT(CASE WHEN credits > 0 THEN 1 END) as users_with_credits,
    COUNT(CASE WHEN credits = 0 THEN 1 END) as users_without_credits
FROM users 
WHERE status = 'active'
GROUP BY plan
ORDER BY plan;

-- 14. Comentários para documentação
COMMENT ON TABLE users IS 'Tabela de usuários do sistema de apostas';
COMMENT ON TABLE admin_users IS 'Tabela de administradores do sistema';
COMMENT ON COLUMN users.code IS 'Código único de acesso do usuário';
COMMENT ON COLUMN users.credits IS 'Créditos restantes para análises (resetam diariamente)';
COMMENT ON COLUMN users.analyses IS 'Número total de análises realizadas';
COMMENT ON COLUMN users.expires_at IS 'Data de expiração do plano';
COMMENT ON FUNCTION reset_daily_credits() IS 'Função para resetar créditos diários automaticamente';
COMMENT ON FUNCTION check_and_update_user_credits(UUID) IS 'Função para verificar créditos e permissões de análise';
COMMENT ON FUNCTION deduct_user_credit_and_increment_analyses(UUID) IS 'Função para descontar crédito e incrementar contador de análises';

-- 15. Verificar se as tabelas foram criadas corretamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'admin_users')
ORDER BY table_name, ordinal_position;

-- 16. Verificar se as funções foram criadas
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('reset_daily_credits', 'check_and_update_user_credits', 'deduct_user_credit_and_increment_analyses')
ORDER BY routine_name;

-- 17. Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'update_users_updated_at';

-- 18. Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('users', 'admin_users');

-- 19. Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Script executado com sucesso!';
    RAISE NOTICE 'Sistema de créditos configurado e funcionando.';
    RAISE NOTICE 'Para reset automático diário, configure cron jobs ou execute manualmente: SELECT reset_daily_credits();';
END $$;
