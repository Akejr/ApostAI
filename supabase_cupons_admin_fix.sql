-- =====================================================
-- CORREÇÃO COMPLETA DO SISTEMA DE CUPONS
-- =====================================================

-- 1. Primeiro, vamos desabilitar RLS temporariamente
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Cupons são visíveis para todos" ON coupons;
DROP POLICY IF EXISTS "Apenas admins podem inserir cupons" ON coupons;
DROP POLICY IF EXISTS "Apenas admins podem atualizar cupons" ON coupons;
DROP POLICY IF EXISTS "Apenas admins podem deletar cupons" ON coupons;
DROP POLICY IF EXISTS "Usuários autenticados podem ver cupons" ON coupons;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir cupons" ON coupons;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar cupons" ON coupons;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar cupons" ON coupons;

-- 3. Verificar se a tabela de admins existe
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Inserir o admin padrão (substitua pelo email correto)
INSERT INTO admin_users (email, name) VALUES 
('ecasanovo@gmail.com', 'Admin Evandro')
ON CONFLICT (email) DO NOTHING;

-- 5. Criar função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Reabilitar RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas usando a função is_admin()
CREATE POLICY "Todos podem ver cupons" ON coupons
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem inserir cupons" ON coupons
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Apenas admins podem atualizar cupons" ON coupons
  FOR UPDATE USING (is_admin());

CREATE POLICY "Apenas admins podem deletar cupons" ON coupons
  FOR DELETE USING (is_admin());

-- 8. Verificar configuração
SELECT 
  'Tabela coupons:' as item,
  CASE WHEN rowsecurity THEN 'RLS Habilitado' ELSE 'RLS Desabilitado' END as status
FROM pg_tables WHERE tablename = 'coupons'
UNION ALL
SELECT 
  'Políticas criadas:' as item,
  COUNT(*)::text as status
FROM pg_policies WHERE tablename = 'coupons'
UNION ALL
SELECT 
  'Admin cadastrado:' as item,
  CASE WHEN EXISTS(SELECT 1 FROM admin_users WHERE email = 'ecasanovo@gmail.com') 
    THEN 'Sim' ELSE 'Não' END as status;
