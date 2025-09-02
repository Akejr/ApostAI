# Sistema de Renovação Diária de Créditos

## 🔄 Como Funciona

### **1. Verificação Automática:**
- **Quando:** Sempre que o usuário acessa o sistema ou sincroniza dados
- **Onde:** Função `checkAndRenewDailyCredits()` no `App.tsx`
- **Trigger:** Chamada automaticamente em `syncUserData()`

### **2. Lógica de Renovação:**
```typescript
// Verifica se passou 1 dia ou mais desde a última atualização
const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

if (daysSinceUpdate >= 1) {
  // Renova créditos baseado no plano
  if (data.plan === 'Básico') newCredits = 7;
  if (data.plan === 'Pro') newCredits = 15;
  if (data.plan === 'Premium') // Não renova (ilimitado)
}
```

### **3. Planos e Créditos:**
- **Básico:** 7 créditos/dia
- **Pro:** 15 créditos/dia  
- **Premium:** Créditos ilimitados (não renova)

### **4. Quando Acontece:**
- ✅ **Login do usuário**
- ✅ **Sincronização de dados** (botão 🔄)
- ✅ **Acesso à rota de análise**
- ✅ **Verificação de créditos**

### **5. Logs no Console:**
```
🔄 Verificando renovação diária de créditos para usuário: [ID]
📅 Dias desde última atualização: 1
📅 Última atualização: 15/12/2024
📅 Data atual: 16/12/2024
🔄 Renovando créditos diários...
✅ Créditos renovados para 7 (plano: Básico)
```

## 🚀 Vantagens

### **Automático:**
- Não precisa de cron jobs externos
- Renova quando usuário acessa o sistema
- Atualiza estado local e localStorage

### **Inteligente:**
- Só renova se passou 1 dia ou mais
- Respeita planos Premium (ilimitados)
- Atualiza `updated_at` no banco

### **Eficiente:**
- Uma única consulta ao banco
- Atualiza estado React automaticamente
- Sincroniza localStorage

## 🔧 Configuração

### **Banco de Dados:**
- Campo `updated_at` deve ser atualizado automaticamente
- Trigger `update_users_updated_at` já configurado
- Função `reset_daily_credits()` disponível para uso manual

### **Frontend:**
- Função integrada ao fluxo de autenticação
- Logs detalhados para debugging
- Tratamento de erros robusto

## 📱 Teste

### **Para Testar:**
1. Faça login com usuário Básico/Pro
2. Use todos os créditos
3. Aguarde 1 dia ou mude a data do sistema
4. Faça login novamente
5. Verifique no console se os créditos foram renovados

### **Verificar no Console:**
- Logs de verificação diária
- Contagem de dias
- Renovação de créditos
- Atualização de estado

---

**Status:** ✅ Implementado e Funcionando
**Última Atualização:** Dezembro 2024
**Responsável:** Sistema Automático
