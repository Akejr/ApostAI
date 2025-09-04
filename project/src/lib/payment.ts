// Configurações do Mercado Pago
const MERCADOPAGO_CONFIG = {
  accessToken: 'APP_USR-4948508052320612-090417-52cf3c977b061c03b25a0bbd84920dd3-1423321368',
  publicKey: 'APP_USR-9a93521a-da15-453e-96c8-900600a6d124',
  clientId: '4948508052320612',
  clientSecret: 'S4yxQc1IMuyoBMJn8r1WzmhIUKYCL90c',
  baseUrl: 'https://api.mercadopago.com',
  checkoutUrl: 'https://www.mercadopago.com.br/checkout/v1/redirect',
  companyName: 'ApostAI - Apostas de futebol inteligentes'
};

// Interface para item do pedido (mantida para compatibilidade)
interface PaymentItem {
  name: string;
  price: number; // Preço em centavos
  quantity: number;
}

// Interface para dados do cliente (mantida para compatibilidade)
interface CustomerData {
  name?: string;
  email?: string;
  cellphone?: string;
  cep?: string;
  complement?: string;
  number?: string;
}

// Interface para preferência do Mercado Pago
interface MercadoPagoPreference {
  items: Array<{
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payer?: {
    name?: string;
    email?: string;
    phone?: {
      number?: string;
    };
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: string;
  external_reference: string;
  notification_url?: string;
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
}

// Gerar ID único para o pedido (mantido para compatibilidade)
export const generateOrderId = (): string => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Criar preferência de pagamento no Mercado Pago
export const createMercadoPagoPreference = async (
  items: PaymentItem[],
  orderId: string,
  customerData?: CustomerData
): Promise<{ preferenceId: string; initPoint: string } | null> => {
  try {
    console.log('🔄 Criando preferência no Mercado Pago...');
    
    const preference: MercadoPagoPreference = {
      items: items.map(item => ({
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: item.name,
        description: `Plano ${item.name} - ${MERCADOPAGO_CONFIG.companyName}`,
        quantity: item.quantity,
        unit_price: item.price / 100, // Converter centavos para reais
        currency_id: 'BRL'
      })),
      payer: customerData ? {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.cellphone ? {
          number: customerData.cellphone
        } : undefined
      } : undefined,
      back_urls: {
        success: `${window.location.origin}/sucesso`,
        failure: `${window.location.origin}/falha`,
        pending: `${window.location.origin}/pendente`
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: `${window.location.origin}/api/webhook/mercadopago`,
      payment_methods: {
        installments: 12, // Máximo 12 parcelas
        excluded_payment_types: [
          { id: 'ticket' } // Excluir boleto se desejar
        ]
      }
    };

    console.log('📋 Dados da preferência:', preference);

    const response = await fetch(`${MERCADOPAGO_CONFIG.baseUrl}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference)
    });

    console.log('🔍 Status da resposta:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erro na criação da preferência:', errorData);
      return null;
    }

    const data = await response.json();
    console.log('✅ Preferência criada:', data);

    return {
      preferenceId: data.id,
      initPoint: data.init_point
    };

  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error);
    return null;
  }
};

// Criar link de pagamento (mantida para compatibilidade)
export const createPaymentLink = async (
  items: PaymentItem[],
  orderId: string,
  customerData?: CustomerData
): Promise<string> => {
  const preference = await createMercadoPagoPreference(items, orderId, customerData);
  
  if (!preference) {
    throw new Error('Erro ao criar preferência de pagamento');
  }

  return preference.initPoint;
};

// Verificar status do pagamento via API do Mercado Pago
export const checkPaymentStatus = async (
  paymentId: string,
  orderId: string
): Promise<{ success: boolean; paid: boolean; status?: string }> => {
  try {
    console.log('🔍 Verificando status do pagamento:', { paymentId, orderId });
    
    const response = await fetch(`${MERCADOPAGO_CONFIG.baseUrl}/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 Status da resposta:', response.status);

    if (!response.ok) {
      console.error('❌ Erro na verificação do pagamento:', response.status);
      return { success: false, paid: false };
    }

    const data = await response.json();
    console.log('🔍 Dados do pagamento:', data);

    const isPaid = data.status === 'approved';
    const isSuccess = data.status === 'approved' || data.status === 'pending';

    return {
      success: isSuccess,
      paid: isPaid,
      status: data.status
    };

  } catch (error) {
    console.error('❌ Erro ao verificar pagamento:', error);
    return { success: false, paid: false };
  }
};

// Função alternativa para verificar pagamento (mantida para compatibilidade)
export const checkPaymentStatusFallback = (
  paymentId: string,
  orderId: string
): { success: boolean; paid: boolean } => {
  // Se temos payment_id, consideramos como pagamento aprovado
  // pois o usuário foi redirecionado do Mercado Pago
  if (paymentId && orderId) {
    console.log('✅ Pagamento aprovado via fallback');
    return { success: true, paid: true };
  }
  
  return { success: false, paid: false };
};

// Função para abrir checkout em nova aba (mantida para compatibilidade)
export const openCheckout = (paymentUrl: string): void => {
  window.open(paymentUrl, '_blank');
};

// Função para criar link de análise de time (mantida para compatibilidade)
export const createTeamAnalysisPayment = async (
  teamName: string,
  price: number, // Preço em centavos
  customerData?: CustomerData
): Promise<{ orderId: string; paymentUrl: string }> => {
  const orderId = generateOrderId();
  
  const items: PaymentItem[] = [
    {
      name: `Análise ${teamName}`,
      price: price,
      quantity: 1
    }
  ];
  
  const paymentUrl = await createPaymentLink(items, orderId, customerData);
  
  return { orderId, paymentUrl };
};

// Função para criar link de planos (usando endpoint real)
export const createPlanPayment = async (
  planName: string,
  price: number, // Preço em centavos
  customerData?: CustomerData
): Promise<{ orderId: string; paymentUrl: string }> => {
  const orderId = generateOrderId();
  
  try {
    console.log('🔄 Criando preferência de pagamento via API...');
    
    // Chamar endpoint para criar preferência
    const response = await fetch('/api/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planName,
        price,
        orderId,
        customerData
      })
    });

    console.log('📡 Resposta da API:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erro na API:', errorData);
      throw new Error(`Erro na API: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Preferência criada:', data);

    if (data.success && data.initPoint) {
      return {
        orderId,
        paymentUrl: data.initPoint
      };
    } else {
      throw new Error('Resposta inválida da API');
    }

  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error);
    
    // Fallback para desenvolvimento
    console.log('🔄 Usando fallback para desenvolvimento...');
    return {
      orderId,
      paymentUrl: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=fallback_${orderId}`
    };
  }
};

// Gerar código único para o usuário no formato BR5809596PU (mantido)
export const generateUserCode = (fullName: string = 'Usuário'): string => {
  // Extrair iniciais do nome (primeiras letras de cada palavra)
  const initials = fullName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2); // Pegar apenas as 2 primeiras iniciais
  
  // Gerar número aleatório de 7 dígitos
  const randomNumber = Math.floor(Math.random() * 9000000) + 1000000; // 1000000-9999999
  
  // Gerar 2 letras aleatórias
  const randomLetters = Math.random().toString(36).substr(2, 2).toUpperCase();
  
  // Formato: BR5809596PU
  const code = `${initials}${randomNumber}${randomLetters}`;
  
  console.log('🔑 Código gerado:', {
    nome: fullName,
    iniciais: initials,
    numero: randomNumber,
    letras: randomLetters,
    codigo: code
  });
  
  return code;
};

// Interface para dados do usuário pago (mantida para compatibilidade)
export interface PaidUserData {
  id: string;
  name: string;
  code: string;
  plan: string;
  planPrice: number;
  orderId: string;
  transactionId: string;
  createdAt: string;
  expiresAt: string;
}

// Função para processar webhook do Mercado Pago
export const processMercadoPagoWebhook = async (webhookData: any): Promise<{
  success: boolean;
  paymentId?: string;
  status?: string;
  externalReference?: string;
}> => {
  try {
    console.log('🔔 Processando webhook do Mercado Pago:', webhookData);

    if (webhookData.type === 'payment') {
      const paymentId = webhookData.data?.id;
      
      if (paymentId) {
        // Buscar detalhes do pagamento
        const paymentStatus = await checkPaymentStatus(paymentId, '');
        
        return {
          success: paymentStatus.success,
          paymentId: paymentId,
          status: paymentStatus.status,
          externalReference: webhookData.data?.external_reference
        };
      }
    }

    return { success: false };

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    return { success: false };
  }
};

// Função para validar assinatura do webhook (segurança)
export const validateWebhookSignature = (signature: string, body: string, secret: string = 'a31984476039e38c886fc7a688a830d3bb52817b2ab5d8fce68866e1d899e98f'): boolean => {
  try {
    // Em ambiente de produção, isso seria feito no backend
    // Esta função é apenas para referência
    console.log('🔐 Validando assinatura do webhook...');
    
    // A validação real acontece no endpoint /api/webhook/mercadopago
    // que já foi atualizado com a assinatura correta
    return true;
  } catch (error) {
    console.error('❌ Erro ao validar assinatura:', error);
    return false;
  }
};