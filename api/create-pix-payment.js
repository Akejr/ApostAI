// Endpoint para criar preferência de pagamento único via Checkout Pro
// Baseado na documentação: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/overview

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder OPTIONS para CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Permitir apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { planName, price, orderId, customerData } = req.body;
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-4948508052320612-090417-52cf3c977b061c03b25a0bbd84920dd3-1423321368';

    console.log('🔄 Criando preferência Checkout Pro para pagamento único:', { planName, price, orderId });
    console.log('💰 Valores recebidos na API create-pix-payment:', {
      planName,
      price,
      priceInReais: price / 100,
      orderId,
      customerData
    });

    // Criar preferência para Checkout Pro (pagamento único)
    const unitPrice = price / 100; // Converter centavos para euros
    console.log('💰 Conversão de preço na API create-pix-payment:', {
      planName,
      priceInCents: price,
      priceInReais: unitPrice
    });
    
    const preferenceData = {
      items: [
        {
          title: `${planName} - ApostAI`,
          description: 'Apostas de futebol inteligentes - Pagamento mensal único',
          quantity: 1,
          unit_price: unitPrice,
          currency_id: 'EUR'
        }
      ],
      payer: {
        name: customerData?.name || 'Cliente',
        email: customerData?.email || 'cliente@apostai.com',
        phone: customerData?.phone ? {
          area_code: customerData.phone.substring(0, 2),
          number: customerData.phone.substring(2)
        } : undefined
      },
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12 // Permitir até 12 parcelas
      },
      back_urls: {
        success: 'https://apostai-sistema.vercel.app/sucesso',
        failure: 'https://apostai-sistema.vercel.app/falha',
        pending: 'https://apostai-sistema.vercel.app/pendente'
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: 'https://apostai-sistema.vercel.app/api/webhook/mercadopago',
      statement_descriptor: 'APOSTAI',
      metadata: {
        payment_type: 'single_payment',
        plan_name: planName
      }
    };

    console.log('📋 Dados da preferência Checkout Pro:', preferenceData);

    // Fazer requisição para API de Preferências do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData)
    });

    console.log('📡 Status da resposta Checkout Pro:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erro na API do MP (Checkout Pro):', errorData);
      return res.status(response.status).json({
        success: false,
        error: 'Erro na API do Mercado Pago',
        message: errorData
      });
    }

    const data = await response.json();
    console.log('✅ Preferência Checkout Pro criada:', data);

    return res.status(200).json({
      success: true,
      preferenceId: data.id,
      initPoint: data.init_point,
      status: 'pending',
      paymentType: 'single_payment'
    });

  } catch (error) {
    console.error('❌ Erro ao criar preferência Checkout Pro:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}
