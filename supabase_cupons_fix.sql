-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA CUPONS
-- =====================================================

-- 1. Remover políticas existentes que estão causando erro
DROP POLICY IF EXISTS "Cupons são visíveis para todos" ON coupons;
DROP POLICY IF EXISTS "Apenas admins podem inserir cupons" ON coupons;
DROP POLICY IF EXISTS "Apenas admins podem atualizar cupons" ON coupons;
DROP POLICY IF EXISTS "Apenas admins podem deletar cupons" ON coupons;

-- 2. Criar políticas mais permissivas para usuários autenticados
CREATE POLICY "Usuários autenticados podem ver cupons" ON coupons
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem inserir cupons" ON coupons
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar cupons" ON coupons
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar cupons" ON coupons
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 3. Verificar se RLS está habilitado
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- 4. Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'coupons';
