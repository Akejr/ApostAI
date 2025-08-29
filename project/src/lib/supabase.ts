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
}

// Salvar usuário pago na tabela users existente
export const savePaidUser = async (userData: {
  name: string;
  code: string;
  plan: string;
  planPrice: number;
  orderId: string;
  transactionId: string;
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
          expires_at: expiresAt.toISOString()
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
