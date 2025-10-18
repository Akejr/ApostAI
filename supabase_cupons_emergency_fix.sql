-- =====================================================
-- CORREÇÃO EMERGENCIAL - DESABILITAR RLS COMPLETAMENTE
-- =====================================================

-- 1. Desabilitar RLS na tabela coupons
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas que podem estar causando conflito
DROP POLICY IF EXISTS "Cupons são visíveis para todos" ON coupons;
DROP POLICY IF EXISTS "Apenas admins podem inserir cupons" ON coupons;
DROP POLICY IF EXISTS "Apenas admins podem atualizar cupons" ON coupons;
DROP POLICY IF EXISTS "Apenas admins podem deletar cupons" ON coupons;
DROP POLICY IF EXISTS "Usuários autenticados podem ver cupons" ON coupons;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir cupons" ON coupons;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar cupons" ON coupons;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar cupons" ON coupons;
DROP POLICY IF EXISTS "Todos podem ver cupons" ON coupons;

-- 3. Verificar se a tabela existe e está acessível
SELECT COUNT(*) as total_cupons FROM coupons;

-- 4. Inserir alguns cupons de exemplo para testar
INSERT INTO coupons (name, code, discount_percentage, profit_percentage, is_active) VALUES
('Teste Influenciador', 'TESTE10', 10, 5, true),
('Promo Teste', 'PROMO15', 15, 7, true)
ON CONFLICT (code) DO NOTHING;

-- 5. Verificar se os cupons foram inseridos
SELECT * FROM coupons ORDER BY created_at DESC;

-- 6. Status final
SELECT 
  'RLS Status' as check_item,
  CASE WHEN rowsecurity THEN 'HABILITADO (PROBLEMA)' ELSE 'DESABILITADO (OK)' END as status
FROM pg_tables 
WHERE tablename = 'coupons';
