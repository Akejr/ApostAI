# 🧪 Teste do Sistema de Créditos

## 🔍 **PROBLEMA IDENTIFICADO**

O usuário não está perdendo créditos quando gera apostas. Vamos investigar e corrigir.

## 🚀 **COMO TESTAR**

### **1. Abrir o Console do Navegador**
- Pressione `F12` ou `Ctrl+Shift+I`
- Vá para a aba **Console**

### **2. Fazer Login com Usuário Não-Premium**
- Use um usuário com plano **Básico** ou **Pro**
- Verifique se tem créditos disponíveis

### **3. Gerar Apostas e Observar Logs**
- Pesquise um time
- Selecione uma partida
- Clique em **"Gerar Aposta"**
- Observe os logs no console

## 📊 **LOGS ESPERADOS NO CONSOLE**

### **Ao Clicar em "Gerar Aposta":**
```
🔍 Verificando créditos para usuário: [USER_ID]
🔍 Verificando créditos para usuário: [USER_ID]
🔍 Dados do usuário encontrados: {credits: 7, plan: "Básico"}
🔍 Resultado da verificação: {hasCredits: true, creditsLeft: 7, plan: "Básico"}
✅ Usuário pode gerar apostas. Créditos: 7 Plano: Básico
🔍 Iniciando desconto de crédito para usuário não-Premium
🔍 Iniciando desconto de crédito para usuário: [USER_ID]
🔍 Verificando créditos para usuário: [USER_ID]
🔍 Dados do usuário encontrados: {credits: 7, plan: "Básico"}
🔍 Resultado da verificação: {hasCredits: true, creditsLeft: 7, plan: "Básico"}
🔍 Descontando crédito. Créditos atuais: 7 Novos créditos: 6
✅ Crédito descontado com sucesso. Novos créditos: 6
✅ Análises incrementadas com sucesso
🔍 Resultado do desconto: {success: true, creditsLeft: 6, error: undefined}
✅ Crédito descontado por gerar apostas. Restam: 6 créditos
```

## 🚨 **POSSÍVEIS PROBLEMAS**

### **1. Função não está sendo chamada**
- Verificar se `handleGenerateBets` está sendo executada
- Verificar se `checkUserCredits` está sendo chamada

### **2. Erro na verificação de créditos**
- Verificar se o usuário está sendo encontrado no banco
- Verificar se o campo `credits` existe na tabela

### **3. Erro no desconto**
- Verificar se a query UPDATE está funcionando
- Verificar permissões do Supabase

### **4. Usuário Premium**
- Verificar se o usuário não é Premium (não desconta créditos)

## 🔧 **SOLUÇÕES IMPLEMENTADAS**

### **1. Logs de Debug Adicionados**
- ✅ Logs em `checkUserCredits`
- ✅ Logs em `deductUserCredit`
- ✅ Logs em `handleGenerateBets`

### **2. Correção na Query de Update**
- ✅ Removido `supabase.sql` problemático
- ✅ Separado update de créditos e análises

### **3. Tratamento de Erros Melhorado**
- ✅ Logs detalhados de cada etapa
- ✅ Verificação de sucesso em cada operação

## 📱 **TESTE RÁPIDO**

### **Execute no Console do Navegador:**
```javascript
// Verificar se as funções estão disponíveis
console.log('checkUserCredits:', typeof checkUserCredits);
console.log('deductUserCredit:', typeof deductUserCredit);

// Verificar usuário atual
console.log('currentUser:', currentUser);
```

## 🎯 **PRÓXIMOS PASSOS**

1. **Testar o sistema** com os logs adicionados
2. **Identificar onde está falhando** baseado nos logs
3. **Corrigir o problema específico** encontrado
4. **Verificar se os créditos estão sendo descontados**

---

**Execute o teste e me informe o que aparece no console!** 🔍
