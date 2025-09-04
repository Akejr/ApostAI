-- =====================================================
-- VERIFICAR E ADICIONAR COLUNA ANALYSES
-- =====================================================

-- Verificar se a coluna analyses existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'analyses';

-- Se não existir, adicionar a coluna
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'analyses') THEN
    ALTER TABLE users ADD COLUMN analyses INTEGER DEFAULT 0;
    RAISE NOTICE 'Coluna analyses adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna analyses já existe!';
  END IF;
END $$;

-- Verificar novamente após adicionar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'analyses';

-- Verificar alguns registros
SELECT id, name, code, credits, analyses, status 
FROM users 
LIMIT 5;
