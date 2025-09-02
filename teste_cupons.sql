-- =====================================================
-- TESTE COMPLETO DO SISTEMA DE CUPONS
-- =====================================================

-- 1. Verificar se a tabela coupons existe e está acessível
SELECT 'Teste 1: Tabela coupons existe' as teste;
SELECT COUNT(*) as total_cupons FROM coupons;

-- 2. Inserir cupom de teste
INSERT INTO coupons (name, code, discount_percentage, profit_percentage, is_active) VALUES
('Teste Cupom', 'TESTE10', 10, 5, true),
('Cupom AKEJR', 'AKEJR', 15, 7, true)
ON CONFLICT (code) DO NOTHING;

-- 3. Verificar cupons inseridos
SELECT 'Teste 2: Cupons inseridos' as teste;
SELECT * FROM coupons WHERE code IN ('TESTE10', 'AKEJR');

-- 4. Testar busca de cupom específico (simulando a query do frontend)
SELECT 'Teste 3: Busca cupom AKEJR' as teste;
SELECT * FROM coupons 
WHERE code = 'AKEJR' AND is_active = true;

-- 5. Testar busca de cupom inexistente
SELECT 'Teste 4: Busca cupom inexistente' as teste;
SELECT * FROM coupons 
WHERE code = 'INEXISTENTE' AND is_active = true;

-- 6. Verificar status do RLS
SELECT 'Teste 5: Status RLS' as teste;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'coupons';

-- 7. Verificar políticas ativas
SELECT 'Teste 6: Políticas RLS' as teste;
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'coupons';
