// Endpoint para criar preferência de pagamento no Mercado Pago
// Este arquivo funciona como Vercel Function

const mercadopago = require('mercadopago');

// Configurar Mercado Pago com suas credenciais
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-4948508052320612-090417-52cf3c977b061c03b25a0bbd84920dd3-1423321368'
});

export default async function handler(req, res) {
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

    console.log('🔄 Criando preferência:', { planName, price, orderId });

    // Criar preferência de pagamento
    const preference = {
      items: [
        {
          id: `plan_${orderId}`,
          title: planName,
          description: `${planName} - ApostAI - Apostas de futebol inteligentes`,
          quantity: 1,
          unit_price: price / 100, // Converter centavos para reais
          currency_id: 'BRL'
        }
      ],
      payer: customerData ? {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.cellphone ? {
          number: customerData.cellphone
        } : undefined
      } : undefined,
      back_urls: {
        success: `${req.headers.origin || 'http://localhost:5173'}/sucesso`,
        failure: `${req.headers.origin || 'http://localhost:5173'}/falha`,
        pending: `${req.headers.origin || 'http://localhost:5173'}/pendente`
      },
      auto_return: 'approved',
      external_reference: orderId,
      notification_url: `${req.headers.origin || 'http://localhost:5173'}/api/webhook/mercadopago`,
      payment_methods: {
        installments: 12, // Máximo 12 parcelas
        excluded_payment_types: [
          // Descomente se quiser excluir algum método
          // { id: 'ticket' } // Excluir boleto
        ]
      },
      statement_descriptor: 'APOSTAI',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };

    console.log('📋 Dados da preferência:', preference);

    // Criar preferência no Mercado Pago
    const response = await mercadopago.preferences.create(preference);

    console.log('✅ Preferência criada com sucesso:', response.body.id);

    return res.status(200).json({
      success: true,
      preferenceId: response.body.id,
      initPoint: response.body.init_point,
      sandboxInitPoint: response.body.sandbox_init_point
    });

  } catch (error) {
    console.error('❌ Erro ao criar preferência:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message,
      details: error.response?.data || error
    });
  }
}
