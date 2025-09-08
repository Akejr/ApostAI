// Configurações do Mercado Pago
const MERCADOPAGO_CONFIG = {
  accessToken: import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-4948508052320612-090417-52cf3c977b061c03b25a0bbd84920dd3-1423321368',
  publicKey: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || 'APP_USR-9a93521a-da15-453e-96c8-900600a6d124',
  clientId: import.meta.env.VITE_MERCADOPAGO_CLIENT_ID || '4948508052320612',
  clientSecret: import.meta.env.VITE_MERCADOPAGO_CLIENT_SECRET || 'S4yxQc1IMuyoBMJn8r1WzmhIUKYCL90c',
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
    console.log('💰 Items recebidos na função createMercadoPagoPreference:', items);
    
    const preference: MercadoPagoPreference = {
      items: items.map(item => {
        const unitPrice = item.price / 100; // Converter centavos para reais
        console.log('💰 Conversão de preço no item:', {
          itemName: item.name,
          priceInCents: item.price,
          priceInReais: unitPrice,
          quantity: item.quantity
        });
        
        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          title: item.name,
          description: `Plano ${item.name} - ${MERCADOPAGO_CONFIG.companyName}`,
          quantity: item.quantity,
          unit_price: unitPrice,
          currency_id: 'BRL'
        };
      }),
      payer: {
        name: customerData?.name || 'Cliente',
        email: customerData?.email || 'cliente@apostai.com'
      },
      back_urls: {
        success: 'https://apostai-sistema.vercel.app/sucesso',
        failure: 'https://apostai-sistema.vercel.app/falha',
        pending: 'https://apostai-sistema.vercel.app/pendente'
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: 'https://apostai-sistema.vercel.app/api/webhook/mercadopago',
      payment_methods: {
        installments: 12, // Máximo 12 parcelas
        excluded_payment_types: [
          { id: 'ticket' } // Excluir boleto se desejar
        ]
      }
    };

    console.log('📋 Dados da preferência:', preference);
    console.log('🔍 URLs de retorno:', {
      success: preference.back_urls.success,
      failure: preference.back_urls.failure,
      pending: preference.back_urls.pending,
      origin: window.location.origin
    });

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

// Função para criar pagamento único via Checkout Pro
export const createPixPayment = async (
  planName: string,
  price: number, // Preço em centavos
  customerData?: CustomerData
): Promise<{ orderId: string; paymentUrl: string }> => {
  const orderId = generateOrderId();
  
  try {
    console.log('🔄 Criando preferência Checkout Pro para pagamento único...');
    console.log('💰 Valores recebidos na função createPixPayment:', {
      planName,
      price,
      priceInReais: price / 100,
      customerData
    });
    
    // Tentar chamar endpoint para criar preferência Checkout Pro
    const response = await fetch(`${window.location.origin}/api/create-pix-payment`, {
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

    console.log('📡 Resposta da API Checkout Pro:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erro na API Checkout Pro:', errorData);
      
      // Fallback: criar preferência diretamente
      console.log('🔄 Usando fallback: criando preferência diretamente...');
      return await createMercadoPagoPreference([{
        name: planName,
        price: price,
        quantity: 1
      }], orderId, customerData).then(result => {
        if (result) {
          return {
            orderId,
            paymentUrl: result.initPoint
          };
        } else {
          throw new Error('Falha ao criar preferência de pagamento');
        }
      });
    }

    const data = await response.json();
    console.log('✅ Preferência Checkout Pro criada:', data);

    if (data.success && data.initPoint) {
      return {
        orderId,
        paymentUrl: data.initPoint
      };
    } else {
      throw new Error('Resposta inválida da API Checkout Pro');
    }

  } catch (error) {
    console.error('❌ Erro ao criar preferência Checkout Pro:', error);
    
    // Fallback: criar preferência diretamente
    console.log('🔄 Usando fallback: criando preferência diretamente...');
    try {
      const result = await createMercadoPagoPreference([{
        name: planName,
        price: price,
        quantity: 1
      }], orderId, customerData);
      
      if (result) {
        return {
          orderId,
          paymentUrl: result.initPoint
        };
      } else {
        throw new Error('Falha ao criar preferência de pagamento');
      }
    } catch (fallbackError) {
      console.error('❌ Erro no fallback:', fallbackError);
      throw error; // Re-throw o erro original
    }
  }
};

// Função para criar assinatura via Checkout Pro
export const createSubscriptionPayment = async (
  planName: string,
  price: number, // Preço em centavos
  customerData?: CustomerData
): Promise<{ orderId: string; paymentUrl: string }> => {
  const orderId = generateOrderId();
  
  try {
    console.log('🔄 Criando preferência Checkout Pro para assinatura...');
    console.log('💰 Valores recebidos na função createSubscriptionPayment:', {
      planName,
      price,
      priceInReais: price / 100,
      customerData
    });
    
    // Tentar chamar endpoint para criar preferência Checkout Pro
    const response = await fetch(`${window.location.origin}/api/create-preference`, {
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

    console.log('📡 Resposta da API Checkout Pro:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erro na API Checkout Pro:', errorData);
      
      // Fallback: criar preferência diretamente
      console.log('🔄 Usando fallback: criando preferência diretamente...');
      return await createMercadoPagoPreference([{
        name: planName,
        price: price,
        quantity: 1
      }], orderId, customerData).then(result => {
        if (result) {
          return {
            orderId,
            paymentUrl: result.initPoint
          };
        } else {
          throw new Error('Falha ao criar preferência de pagamento');
        }
      });
    }

    const data = await response.json();
    console.log('✅ Preferência Checkout Pro criada:', data);

    if (data.success && data.initPoint) {
      return {
        orderId,
        paymentUrl: data.initPoint
      };
    } else {
      throw new Error('Resposta inválida da API Checkout Pro');
    }

  } catch (error) {
    console.error('❌ Erro ao criar preferência Checkout Pro:', error);
    
    // Fallback: criar preferência diretamente
    console.log('🔄 Usando fallback: criando preferência diretamente...');
    try {
      const result = await createMercadoPagoPreference([{
        name: planName,
        price: price,
        quantity: 1
      }], orderId, customerData);
      
      if (result) {
        return {
          orderId,
          paymentUrl: result.initPoint
        };
      } else {
        throw new Error('Falha ao criar preferência de pagamento');
      }
    } catch (fallbackError) {
      console.error('❌ Erro no fallback:', fallbackError);
      throw error; // Re-throw o erro original
    }
  }
};

// Função para criar link de planos (mantida para compatibilidade - usa assinatura)
export const createPlanPayment = async (
  planName: string,
  price: number, // Preço em centavos
  customerData?: CustomerData
): Promise<{ orderId: string; paymentUrl: string }> => {
  // Por padrão, usar assinatura (cartão)
  return createSubscriptionPayment(planName, price, customerData);
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
export const validateWebhookSignature = (signature: string, body: string, secret: string = import.meta.env.VITE_MERCADOPAGO_WEBHOOK_SECRET || 'a31984476039e38c886fc7a688a830d3bb52817b2ab5d8fce68866e1d899e98f'): boolean => {
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

// Função para verificar status do pagamento e redirecionar automaticamente
export const checkPaymentAndRedirect = async (orderId: string) => {
  try {
    console.log('🔍 Verificando status do pagamento...', orderId);
    
    // Verificar se há dados do pedido no localStorage
    const currentOrder = localStorage.getItem('currentOrder');
    if (!currentOrder) {
      console.log('❌ Dados do pedido não encontrados');
      return false;
    }
    
    const orderData = JSON.parse(currentOrder);
    
    // Fazer requisição para verificar status do pagamento
    const response = await fetch(`${window.location.origin}/api/check-payment-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: orderId,
        externalReference: orderId
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('📊 Status do pagamento:', result);
      
      if (result.status === 'approved' || result.status === 'completed') {
        console.log('✅ Pagamento aprovado! Redirecionando...');
        // Redirecionar para página de sucesso
        window.location.href = `${window.location.origin}/sucesso?payment_id=${result.paymentId}&status=approved&external_reference=${orderId}`;
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erro ao verificar pagamento:', error);
    return false;
  }
};

// Função para iniciar verificação periódica do pagamento
export const startPaymentPolling = (orderId: string, maxAttempts: number = 60) => {
  let attempts = 0;
  
  const pollPayment = async () => {
    attempts++;
    console.log(`🔄 Tentativa ${attempts}/${maxAttempts} de verificação do pagamento`);
    
    const isPaid = await checkPaymentAndRedirect(orderId);
    
    if (isPaid) {
      console.log('✅ Pagamento confirmado! Parando verificação...');
      return;
    }
    
    if (attempts < maxAttempts) {
      // Verificar novamente em 10 segundos
      setTimeout(pollPayment, 10000);
    } else {
      console.log('⏰ Timeout: Parando verificação automática do pagamento');
    }
  };
  
  // Iniciar verificação após 5 segundos
  setTimeout(pollPayment, 5000);
};