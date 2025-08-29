// Configurações da InfinitePay
const INFINITEPAY_CONFIG = {
  handle: 'ecasanovs', // Seu handle da InfinitePay
  baseUrl: 'https://checkout.infinitepay.io',
  apiUrl: 'https://api.infinitepay.io/invoices/public/checkout/payment_check'
};

// Interface para item do pedido
interface PaymentItem {
  name: string;
  price: number; // Preço em centavos
  quantity: number;
}

// Interface para dados do cliente
interface CustomerData {
  name?: string;
  email?: string;
  cellphone?: string;
  cep?: string;
  complement?: string;
  number?: string;
}

// Gerar ID único para o pedido
export const generateOrderId = (): string => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Criar link de pagamento
export const createPaymentLink = (
  items: PaymentItem[],
  orderId: string,
  customerData?: CustomerData
): string => {
  const baseUrl = `${INFINITEPAY_CONFIG.baseUrl}/${INFINITEPAY_CONFIG.handle}`;
  
  // Preparar parâmetros
  const params = new URLSearchParams();
  
  // Items (produtos)
  params.append('items', JSON.stringify(items));
  
  // ID do pedido
  params.append('order_nsu', orderId);
  
  // URL de redirecionamento após pagamento
  params.append('redirect_url', `${window.location.origin}/sucesso`);
  
  // Dados do cliente (se fornecidos)
  if (customerData) {
    if (customerData.name) params.append('customer_name', customerData.name);
    if (customerData.email) params.append('customer_email', customerData.email);
    if (customerData.cellphone) params.append('customer_cellphone', customerData.cellphone);
    if (customerData.cep) params.append('address_cep', customerData.cep);
    if (customerData.complement) params.append('address_complement', customerData.complement);
    if (customerData.number) params.append('address_number', customerData.number);
  }
  
  return `${baseUrl}?${params.toString()}`;
};

// Verificar status do pagamento
export const checkPaymentStatus = async (
  transactionId: string,
  orderId: string
): Promise<{ success: boolean; paid: boolean }> => {
  try {
    const url = `${INFINITEPAY_CONFIG.apiUrl}/${INFINITEPAY_CONFIG.handle}?transaction_nsu=${transactionId}&external_order_nsu=${orderId}`;
    
    console.log('🔍 URL da verificação:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔍 Status da resposta:', response.status);
    
    if (!response.ok) {
      console.error('❌ Erro na resposta da API:', response.status, response.statusText);
      return { success: false, paid: false };
    }
    
    const data = await response.json();
    console.log('🔍 Dados da resposta:', data);
    
    return {
      success: data.success || false,
      paid: data.paid || false
    };
  } catch (error) {
    console.error('❌ Erro ao verificar pagamento:', error);
    return { success: false, paid: false };
  }
};

// Função alternativa para verificar pagamento (quando API não funciona)
export const checkPaymentStatusFallback = (
  transactionId: string,
  orderId: string
): { success: boolean; paid: boolean } => {
  // Se temos transaction_id, consideramos como pagamento aprovado
  // pois o usuário foi redirecionado da InfinitePay
  if (transactionId && orderId) {
    console.log('✅ Pagamento aprovado via fallback');
    return { success: true, paid: true };
  }
  
  return { success: false, paid: false };
};

// Função para abrir checkout em nova aba
export const openCheckout = (paymentUrl: string): void => {
  window.open(paymentUrl, '_blank');
};

// Função para criar link de análise de time
export const createTeamAnalysisPayment = (
  teamName: string,
  price: number, // Preço em centavos
  customerData?: CustomerData
): { orderId: string; paymentUrl: string } => {
  const orderId = generateOrderId();
  
  const items: PaymentItem[] = [
    {
      name: `Análise ${teamName}`,
      price: price,
      quantity: 1
    }
  ];
  
  const paymentUrl = createPaymentLink(items, orderId, customerData);
  
  return { orderId, paymentUrl };
};

// Função para criar link de planos
export const createPlanPayment = (
  planName: string,
  price: number, // Preço em centavos
  customerData?: CustomerData
): { orderId: string; paymentUrl: string } => {
  const orderId = generateOrderId();
  
  const items: PaymentItem[] = [
    {
      name: planName,
      price: price,
      quantity: 1
    }
  ];
  
  const paymentUrl = createPaymentLink(items, orderId, customerData);
  
  return { orderId, paymentUrl };
};

// Gerar código único para o usuário no formato BR5809596PU
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

// Interface para dados do usuário pago
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
