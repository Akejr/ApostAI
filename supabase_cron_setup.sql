-- Configuração de Cron Jobs para Reset Automático de Créditos
-- Execute este script no SQL Editor do Supabase após executar o supabase_setup.sql

-- IMPORTANTE: Para usar cron jobs no Supabase, você precisa:
-- 1. Ter uma conta Pro ou superior
-- 2. Habilitar a extensão pg_cron
-- 3. Contatar o suporte do Supabase para ativar

-- 1. Habilitar extensão pg_cron (requer permissão de superuser)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Configurar cron job para resetar créditos diariamente às 00:00 UTC
-- SELECT cron.schedule(
--     'reset-daily-credits',
--     '0 0 * * *', -- Todos os dias às 00:00
--     'SELECT reset_daily_credits();'
-- );

-- 3. Verificar cron jobs ativos
-- SELECT * FROM cron.job;

-- 4. Para cancelar o cron job (se necessário)
-- SELECT cron.unschedule('reset-daily-credits');

-- 5. Para executar manualmente (teste)
-- SELECT reset_daily_credits();

-- 6. Verificar estatísticas de créditos
-- SELECT * FROM user_credits_stats;

-- 7. Verificar usuários sem créditos
-- SELECT 
--     name, 
--     plan, 
--     credits, 
--     analyses,
--     status,
--     expires_at
-- FROM users 
-- WHERE credits = 0 AND plan != 'Premium' AND status = 'active'
-- ORDER BY plan, name;

-- 8. Verificar usuários com créditos disponíveis
-- SELECT 
--     name, 
--     plan, 
--     credits, 
--     analyses,
--     status
-- FROM users 
-- WHERE credits > 0 AND status = 'active'
-- ORDER BY plan, credits DESC;

-- 9. Estatísticas por plano
-- SELECT 
--     plan,
--     COUNT(*) as total_users,
--     AVG(credits) as media_creditos,
--     SUM(analyses) as total_analises,
--     COUNT(CASE WHEN credits > 0 THEN 1 END) as com_creditos,
--     COUNT(CASE WHEN credits = 0 THEN 1 END) as sem_creditos
-- FROM users 
-- WHERE status = 'active'
-- GROUP BY plan
-- ORDER BY plan;

-- 10. Log de atividades recentes (últimas 24h)
-- SELECT 
--     name,
--     plan,
--     credits,
--     analyses,
--     updated_at,
--     CASE 
--         WHEN updated_at > NOW() - INTERVAL '24 hours' THEN 'Ativo nas últimas 24h'
--         ELSE 'Inativo nas últimas 24h'
--     END as status_atividade
-- FROM users 
-- WHERE status = 'active'
-- ORDER BY updated_at DESC;

-- NOTAS IMPORTANTES:
-- 
-- 1. CRON JOBS AUTOMÁTICOS:
--    - Requerem conta Supabase Pro ou superior
--    - Extensão pg_cron deve estar habilitada
--    - Contatar suporte para ativação
--
-- 2. RESET MANUAL ALTERNATIVO:
--    - Se não puder usar cron jobs, execute manualmente:
--    - SELECT reset_daily_credits();
--    - Ou configure um webhook externo para chamar diariamente
--
-- 3. MONITORAMENTO:
--    - Use as views e queries acima para monitorar o sistema
--    - Verifique logs regularmente
--    - Configure alertas para usuários sem créditos
--
-- 4. BACKUP:
--    - Sempre faça backup antes de executar scripts
--    - Teste em ambiente de desenvolvimento primeiro
--    - Mantenha logs de todas as operações
