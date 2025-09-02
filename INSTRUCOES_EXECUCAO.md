# 📋 Instruções para Executar o Sistema de Créditos

## 🚀 **PASSO A PASSO PARA CONFIGURAR NO SUPABASE**

### **1. Acessar o Supabase**
- Entre no [dashboard do Supabase](https://supabase.com/dashboard)
- Selecione seu projeto
- Vá para **SQL Editor**

### **2. Executar o Script Principal**
- Copie todo o conteúdo do arquivo `supabase_setup_fixed.sql`
- Cole no SQL Editor do Supabase
- Clique em **RUN** para executar

### **3. Verificar a Execução**
- O script deve executar sem erros
- Você verá mensagens de NOTICE indicando o que foi criado
- Verifique se as funções foram criadas na aba **Database > Functions**

### **4. Testar o Sistema**
- Execute: `SELECT reset_daily_credits();` para testar o reset manual
- Execute: `SELECT * FROM user_credits_stats;` para ver estatísticas

---

## 🔧 **FUNÇÕES CRIADAS NO SUPABASE**

### **`reset_daily_credits()`**
- **Função:** Reseta créditos diários para todos os usuários ativos
- **Uso:** `SELECT reset_daily_credits();`
- **Reset automático:** Básico → 7 créditos, Pro → 15 créditos

### **`check_and_update_user_credits(user_id)`**
- **Função:** Verifica se usuário pode analisar
- **Retorna:** Status dos créditos e permissões
- **Premium:** Sempre retorna true (créditos ilimitados)

### **`deduct_user_credit_and_increment_analyses(user_id)`**
- **Função:** Desconta crédito e incrementa contador de análises
- **Premium:** Não desconta, apenas incrementa análises
- **Retorna:** Status da operação e créditos restantes

---

## 📊 **VIEWS CRIADAS**

### **`user_credits_stats`**
- Estatísticas por plano
- Contagem de usuários com/sem créditos
- Total de análises por plano

---

## ⚙️ **CONFIGURAÇÃO AUTOMÁTICA (OPCIONAL)**

### **Para Reset Automático Diário:**
1. **Conta Supabase Pro+** (requer pg_cron extension)
2. Execute no SQL Editor:
```sql
-- Habilitar extensão (requer permissão de superuser)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Configurar cron job para 00:00 UTC diariamente
SELECT cron.schedule(
    'reset-daily-credits',
    '0 0 * * *',
    'SELECT reset_daily_credits();'
);
```

### **Alternativa Manual:**
- Execute diariamente: `SELECT reset_daily_credits();`
- Ou configure webhook externo para chamar a função

---

## 🧪 **TESTES RECOMENDADOS**

### **1. Testar Reset de Créditos**
```sql
-- Ver créditos antes
SELECT name, plan, credits FROM users WHERE status = 'active';

-- Executar reset
SELECT reset_daily_credits();

-- Verificar resultado
SELECT name, plan, credits FROM users WHERE status = 'active';
```

### **2. Testar Verificação de Créditos**
```sql
-- Substitua USER_ID pelo ID real de um usuário
SELECT * FROM check_and_update_user_credits('USER_ID');
```

### **3. Testar Desconto de Créditos**
```sql
-- Substitua USER_ID pelo ID real de um usuário
SELECT * FROM deduct_user_credit_and_increment_analyses('USER_ID');
```

---

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### **Erro: "trigger already exists"**
- ✅ **Solução:** Use o arquivo `supabase_setup_fixed.sql` que verifica existência

### **Erro: "function already exists"**
- ✅ **Solução:** O script usa `CREATE OR REPLACE` que sobrescreve funções existentes

### **Erro: "permission denied"**
- ✅ **Solução:** Verifique se está logado como owner do projeto

### **Funções não aparecem**
- ✅ **Solução:** Recarregue a página do Supabase ou vá em Database > Functions

---

## 📱 **INTEGRAÇÃO COM O FRONTEND**

### **Arquivos Modificados:**
1. ✅ `project/src/lib/supabase.ts` - Funções de controle de créditos
2. ✅ `project/src/App.tsx` - Lógica de verificação antes da análise
3. ✅ `project/src/Admin.tsx` - Painel admin com controle de créditos

### **Funcionalidades Implementadas:**
- ✅ Verificação de créditos antes de gerar apostas
- ✅ Desconto automático após gerar apostas com sucesso
- ✅ Usuários Premium com créditos ilimitados
- ✅ Indicador visual de créditos na interface
- ✅ Painel admin para reset manual de créditos

---

## 🎯 **RESULTADO FINAL**

Após executar o script, você terá:

1. **Sistema de créditos funcionando** ✅
2. **Verificação automática** antes de gerar apostas ✅
3. **Desconto de créditos** para usuários não-Premium ✅
4. **Reset diário** configurado (manual ou automático) ✅
5. **Painel admin** para controle total ✅
6. **Interface visual** mostrando créditos disponíveis ✅

---

## 📞 **SUPORTE**

Se encontrar problemas:
1. Verifique os logs de erro no SQL Editor
2. Confirme se todas as funções foram criadas
3. Teste as funções individualmente
4. Verifique permissões do usuário do Supabase

**🎉 Sistema pronto para uso!**
