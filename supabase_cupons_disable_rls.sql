-- =====================================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA TESTE
-- =====================================================

-- Desabilitar RLS na tabela coupons para permitir operações
ALTER TABLE coupons DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'coupons';

-- =====================================================
-- NOTA: Use este script apenas para teste
-- Depois de confirmar que funciona, você pode reabilitar 
-- o RLS com políticas mais específicas
-- =====================================================
