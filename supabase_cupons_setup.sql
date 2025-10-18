-- =====================================================
-- SISTEMA DE CUPONS PARA APOSTA CERTA
-- =====================================================

-- 1. Criar tabela de cupons
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  profit_percentage INTEGER NOT NULL CHECK (profit_percentage >= 0 AND profit_percentage <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar coluna coupon_code na tabela users (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'coupon_code') THEN
    ALTER TABLE users ADD COLUMN coupon_code VARCHAR(50);
  END IF;
END $$;

-- 3. Criar índice para busca rápida de cupons
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_users_coupon_code ON users(coupon_code);

-- 4. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger para atualizar updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_coupons_updated_at') THEN
    CREATE TRIGGER update_coupons_updated_at
      BEFORE UPDATE ON coupons
      FOR EACH ROW
      EXECUTE FUNCTION update_coupons_updated_at();
  END IF;
END $$;

-- 6. Criar função para calcular lucro do influenciador
CREATE OR REPLACE FUNCTION calculate_influencer_profit(
  p_coupon_code VARCHAR(50),
  p_plan_name VARCHAR(50)
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_profit_percentage INTEGER;
  v_plan_price DECIMAL(10,2);
  v_profit_amount DECIMAL(10,2);
BEGIN
  -- Buscar porcentagem de lucro do cupom
  SELECT profit_percentage INTO v_profit_percentage
  FROM coupons 
  WHERE code = p_coupon_code AND is_active = true;
  
  IF v_profit_percentage IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Definir preço do plano
  CASE p_plan_name
    WHEN 'Básico' THEN v_plan_price := 35.00;
    WHEN 'Pro' THEN v_plan_price := 45.00;
    WHEN 'Premium' THEN v_plan_price := 99.00;
    ELSE v_plan_price := 0;
  END CASE;
  
  -- Calcular lucro
  v_profit_amount := (v_plan_price * v_profit_percentage) / 100;
  
  RETURN v_profit_amount;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar view para relatório de influenciadores
CREATE OR REPLACE VIEW influencer_report AS
SELECT 
  c.id as coupon_id,
  c.name as influencer_name,
  c.code as coupon_code,
  c.discount_percentage,
  c.profit_percentage,
  c.is_active,
  COUNT(u.id) as total_users,
  COUNT(CASE WHEN u.status = 'active' THEN 1 END) as active_users,
  SUM(CASE 
    WHEN u.plan = 'Básico' THEN 35.00
    WHEN u.plan = 'Pro' THEN 45.00
    WHEN u.plan = 'Premium' THEN 99.00
    ELSE 0
  END) as total_revenue,
  SUM(calculate_influencer_profit(c.code, u.plan)) as total_profit
FROM coupons c
LEFT JOIN users u ON c.code = u.coupon_code
GROUP BY c.id, c.name, c.code, c.discount_percentage, c.profit_percentage, c.is_active
ORDER BY total_profit DESC;

-- 8. Inserir alguns cupons de exemplo
INSERT INTO coupons (name, code, discount_percentage, profit_percentage, is_active) VALUES
('Influenciador A', 'INFLUENCER10', 10, 5, true),
('Influenciador B', 'PROMO20', 20, 8, true),
('Influenciador C', 'BLACKFRIDAY', 30, 10, true),
('Influenciador D', 'BEMVINDO', 15, 6, true)
ON CONFLICT (code) DO NOTHING;

-- 9. Configurar RLS (Row Level Security)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- 10. Criar políticas de acesso
CREATE POLICY "Cupons são visíveis para todos" ON coupons
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem inserir cupons" ON coupons
  FOR INSERT WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Apenas admins podem atualizar cupons" ON coupons
  FOR UPDATE USING (auth.role() = 'admin');

CREATE POLICY "Apenas admins podem deletar cupons" ON coupons
  FOR DELETE USING (auth.role() = 'admin');

-- 11. Criar função para registrar uso de cupom
CREATE OR REPLACE FUNCTION register_coupon_usage(
  p_user_id UUID,
  p_coupon_code VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_coupon_exists BOOLEAN;
BEGIN
  -- Verificar se o cupom existe e está ativo
  SELECT EXISTS(
    SELECT 1 FROM coupons 
    WHERE code = p_coupon_code AND is_active = true
  ) INTO v_coupon_exists;
  
  IF NOT v_coupon_exists THEN
    RETURN false;
  END IF;
  
  -- Atualizar usuário com o código do cupom
  UPDATE users 
  SET coupon_code = p_coupon_code, updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 12. Criar tabela de histórico de uso de cupons (opcional)
CREATE TABLE IF NOT EXISTS coupon_usage_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  coupon_code VARCHAR(50) REFERENCES coupons(code),
  plan_name VARCHAR(50) NOT NULL,
  plan_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  profit_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Criar índice para histórico
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage_history(coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_date ON coupon_usage_history(used_at);

-- =====================================================
-- VERIFICAÇÕES E TESTES
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 'Tabela coupons criada:' as status, COUNT(*) as total FROM coupons;

-- Verificar se a coluna coupon_code foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'coupon_code';

-- Verificar se as funções foram criadas
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('calculate_influencer_profit', 'register_coupon_usage');

-- Verificar se a view foi criada
SELECT viewname FROM pg_views WHERE viewname = 'influencer_report';

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================

/*
1. EXECUTAR ESTE SCRIPT NO SUPABASE SQL EDITOR
2. VERIFICAR SE TODAS AS TABELAS, FUNÇÕES E VIEWS FORAM CRIADAS
3. TESTAR INSERÇÃO DE CUPONS
4. TESTAR APLICAÇÃO DE CUPONS NO CHECKOUT
5. VERIFICAR RELATÓRIOS NO PAINEL ADMIN

NOTAS:
- Os cupons são aplicados automaticamente no checkout
- O sistema calcula lucros baseado no plano escolhido
- Usuários aparecem tanto na aba de usuários quanto na de cupons
- Relatórios mostram lucros totais por influenciador
*/
