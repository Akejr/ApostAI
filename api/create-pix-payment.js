// Endpoint para criar pagamento único via PIX no Mercado Pago
// Baseado na documentação: https://www.mercadopago.com.br/developers/pt/docs/checkout-api-v2/payment-integration/pix

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

    console.log('🔄 Criando pagamento PIX no Mercado Pago:', { planName, price, orderId });

    // Criar preferência para pagamento único com PIX
    const preferenceData = {
      items: [
        {
          title: `${planName} - ApostAI`,
          description: 'Apostas de futebol inteligentes - Pagamento mensal',
          quantity: 1,
          unit_price: price / 100, // Converter centavos para reais
          currency_id: 'BRL'
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
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' }
        ],
        excluded_payment_methods: [],
        installments: 1
      },
      back_urls: {
        success: `${req.headers.origin || 'http://localhost:5173'}/sucesso`,
        failure: `${req.headers.origin || 'http://localhost:5173'}/falha`,
        pending: `${req.headers.origin || 'http://localhost:5173'}/pendente`
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: `${req.headers.origin || 'https://apostai-sistema.vercel.app'}/api/webhook/mercadopago`,
      statement_descriptor: 'APOSTAI'
    };

    console.log('📋 Dados da preferência PIX:', preferenceData);

    // Fazer requisição para API de Preferências do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData)
    });

    console.log('📡 Status da resposta PIX:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erro na API do MP (PIX):', errorData);
      return res.status(response.status).json({
        success: false,
        error: 'Erro na API do Mercado Pago',
        message: errorData
      });
    }

    const data = await response.json();
    console.log('✅ Preferência PIX criada:', data);

    return res.status(200).json({
      success: true,
      preferenceId: data.id,
      initPoint: data.init_point,
      qrCode: data.qr_code,
      qrCodeBase64: data.qr_code_base64,
      status: 'pending'
    });

  } catch (error) {
    console.error('❌ Erro ao criar pagamento PIX:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}
