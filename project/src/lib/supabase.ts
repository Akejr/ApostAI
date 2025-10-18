import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ltddqzrthrraiohxnjbc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0ZGRxenJ0aHJyYWlvaHhuamJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0OTY1MzQsImV4cCI6MjA3MjA3MjUzNH0.dnk4g8nuvp7RK3hdGUbO8PHAnlMOowDX9dooN4DkRzw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interface para dados do usuário pago (usando tabela users existente)
export interface PaidUser {
  id: string;
  name: string;
  code: string;
  plan: 'Básico' | 'Pro' | 'Premium';
  credits: number;
  analyses: number;
  status: 'active' | 'expired';
  created_at: string;
  expires_at: string;
  updated_at: string;
  coupon_code?: string;
}

// Salvar usuário pago na tabela users existente
export const savePaidUser = async (userData: {
  name: string;
  code: string;
  plan: string;
  planPrice: number;
  orderId: string;
  transactionId: string;
  couponCode?: string; // Cupom opcional
}): Promise<PaidUser | null> => {
  try {
    // Calcular data de expiração (30 dias a partir de agora)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Mapear nomes dos planos para valores aceitos pela constraint
    const planMapping: { [key: string]: 'Básico' | 'Pro' | 'Premium' } = {
      'Plano Básico': 'Básico',
      'Plano Pro': 'Pro',
      'Plano Premium': 'Premium'
    };

    // Definir créditos baseado no plano
    const creditsByPlan = {
      'Plano Básico': 7,
      'Plano Pro': 15,
      'Plano Premium': 999 // Ilimitado
    };

    // Obter o valor correto do plano
    const correctPlan = planMapping[userData.plan] || 'Básico';
    
    console.log('🔍 Mapeamento de plano:', {
      originalPlan: userData.plan,
      mappedPlan: correctPlan,
      availablePlans: Object.keys(planMapping)
    });

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: userData.name,
          code: userData.code,
          plan: correctPlan,
          credits: creditsByPlan[userData.plan as keyof typeof creditsByPlan] || 7,
          analyses: 0,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          coupon_code: userData.couponCode || null // Usar cupom se fornecido
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar usuário:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao salvar usuário no Supabase:', error);
    return null;
  }
};

// Buscar usuário por código na tabela users
export const getUserByCode = async (code: string): Promise<PaidUser | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('code', code)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar usuário no Supabase:', error);
    return null;
  }
};

// Função para verificar se usuário tem créditos disponíveis
export const checkUserCredits = async (userId: string): Promise<{ hasCredits: boolean; creditsLeft: number; plan: string }> => {
  try {
    console.log('🔍 Verificando créditos para usuário:', userId);
    
    const { data, error } = await supabase
      .from('users')
      .select('credits, plan')
      .eq('id', userId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      console.log('❌ Erro ao buscar usuário ou usuário não encontrado:', error);
      return { hasCredits: false, creditsLeft: 0, plan: 'unknown' };
    }

    console.log('🔍 Dados do usuário encontrados:', { credits: data.credits, plan: data.plan });

    // Usuários Premium têm créditos ilimitados
    if (data.plan === 'Premium') {
      console.log('💎 Usuário Premium detectado');
      return { hasCredits: true, creditsLeft: 999, plan: 'Premium' };
    }

    const hasCredits = data.credits > 0;
    console.log('🔍 Resultado da verificação:', { hasCredits, creditsLeft: data.credits, plan: data.plan });
    return { hasCredits, creditsLeft: data.credits, plan: data.plan };
  } catch (error) {
    console.error('❌ Erro ao verificar créditos:', error);
    return { hasCredits: false, creditsLeft: 0, plan: 'unknown' };
  }
};

// Função para desconta um crédito do usuário
export const deductUserCredit = async (userId: string): Promise<{ success: boolean; creditsLeft: number; error?: string }> => {
  try {
    console.log('🔍 Iniciando desconto de crédito para usuário:', userId);
    
    // Primeiro verificar se o usuário tem créditos
    const creditCheck = await checkUserCredits(userId);
    console.log('🔍 Verificação de créditos:', creditCheck);
    
    if (!creditCheck.hasCredits) {
      console.log('❌ Usuário sem créditos disponíveis');
      return { success: false, creditsLeft: 0, error: 'Sem créditos disponíveis' };
    }

    let newCredits = creditCheck.creditsLeft;
    let shouldUpdateCredits = true;

    // Se for Premium, não desconta créditos (mas ainda incrementa análises)
    if (creditCheck.plan === 'Premium') {
      console.log('💎 Usuário Premium - créditos ilimitados, mas incrementando análises');
      shouldUpdateCredits = false;
    } else {
      console.log('🔍 Descontando crédito. Créditos atuais:', creditCheck.creditsLeft, 'Novos créditos:', creditCheck.creditsLeft - 1);
      newCredits = creditCheck.creditsLeft - 1;
    }

    // Se for Premium, não precisa fazer nada (créditos ilimitados)
    if (!shouldUpdateCredits) {
      console.log('💎 Usuário Premium - nenhuma atualização necessária');
      return { 
        success: true, 
        creditsLeft: 999, 
        error: undefined 
      };
    }

    // Para usuários não-Premium, descontar crédito
    const { data, error } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userId)
      .eq('status', 'active')
      .select('credits')
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar créditos:', error);
      return { success: false, creditsLeft: creditCheck.creditsLeft, error: 'Erro ao atualizar créditos' };
    }

    console.log('✅ Créditos atualizados com sucesso:', {
      credits: data.credits,
      isPremium: false
    });

    return { 
      success: true, 
      creditsLeft: data.credits, 
      error: undefined 
    };
  } catch (error) {
    console.error('Erro ao descontar crédito:', error);
    return { success: false, creditsLeft: 0, error: 'Erro interno' };
  }
};

// Função para incrementar apenas análises (sem mexer nos créditos)
export const incrementUserAnalyses = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📊 Incrementando análises para usuário:', userId);
    
    // Buscar dados atuais do usuário
    const { data: currentData, error: fetchError } = await supabase
      .from('users')
      .select('analyses')
      .eq('id', userId)
      .eq('status', 'active')
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar dados do usuário:', fetchError);
      return { success: false, error: 'Erro ao buscar dados do usuário' };
    }

    // Incrementar análises
    const { error } = await supabase
      .from('users')
      .update({ 
        analyses: (currentData.analyses || 0) + 1
      })
      .eq('id', userId)
      .eq('status', 'active');

    if (error) {
      console.error('❌ Erro ao incrementar análises:', error);
      return { success: false, error: 'Erro ao incrementar análises' };
    }

    console.log('✅ Análises incrementadas com sucesso');
    return { success: true };
  } catch (error) {
    console.error('Erro ao incrementar análises:', error);
    return { success: false, error: 'Erro interno' };
  }
};

// Função para resetar créditos diariamente (será chamada pelo Supabase Edge Functions)
export const resetDailyCredits = async (): Promise<void> => {
  try {
    // Resetar créditos para usuários ativos (não Premium)
    const { error } = await supabase
      .from('users')
      .update({ 
        credits: supabase.sql`CASE 
          WHEN plan = 'Básico' THEN 7
          WHEN plan = 'Pro' THEN 15
          ELSE credits
        END`
      })
      .eq('status', 'active')
      .neq('plan', 'Premium');

    if (error) {
      console.error('Erro ao resetar créditos:', error);
    } else {
      console.log('✅ Créditos diários resetados com sucesso');
    }
  } catch (error) {
    console.error('Erro ao resetar créditos diários:', error);
  }
};

// Função para obter informações completas do usuário incluindo créditos
export const getUserWithCredits = async (userId: string): Promise<{
  user: PaidUser | null;
  creditsInfo: { hasCredits: boolean; creditsLeft: number; plan: string };
}> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return { user: null, creditsInfo: { hasCredits: false, creditsLeft: 0, plan: 'unknown' } };
    }

    const creditsInfo = await checkUserCredits(userId);
    
    return { user: data, creditsInfo };
  } catch (error) {
    console.error('Erro ao buscar usuário com créditos:', error);
    return { user: null, creditsInfo: { hasCredits: false, creditsLeft: 0, plan: 'unknown' } };
  }
};

// Tipos para o banco de dados
export interface DatabaseUser {
  id: string;
  name: string;
  code: string;
  plan: 'Básico' | 'Pro' | 'Premium';
  credits: number;
  analyses: number;
  status: 'active' | 'expired';
  created_at: string;
  expires_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}
