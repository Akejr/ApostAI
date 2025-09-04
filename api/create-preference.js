// Endpoint para criar assinatura no Mercado Pago
// Baseado na documentação oficial: https://www.mercadopago.com.br/developers/pt/docs/subscriptions/overview

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
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-4948508052320612-090417-52cf3c977b061c03b25a0bbd84920dd3-1423321368';

    console.log('🔄 Criando assinatura no Mercado Pago:', { planName, price, orderId });

    // Mapear planos para frequência de cobrança
    const planFrequency = {
      'Plano Básico': { frequency: 1, frequency_type: 'months' },
      'Plano Pro': { frequency: 1, frequency_type: 'months' },
      'Plano Premium': { frequency: 1, frequency_type: 'months' }
    };

    const frequency = planFrequency[planName] || { frequency: 1, frequency_type: 'months' };

    // Criar assinatura sem plano associado (mais flexível)
    const subscriptionData = {
      reason: `${planName} - ApostAI - Apostas de futebol inteligentes`,
      auto_recurring: {
        frequency: frequency.frequency,
        frequency_type: frequency.frequency_type,
        transaction_amount: price / 100, // Converter centavos para reais
        currency_id: 'BRL'
      },
      back_url: `${req.headers.origin || 'http://localhost:5173'}/sucesso`,
      payer_email: customerData?.email || 'cliente@apostai.com',
      external_reference: orderId,
      status: 'pending'
    };

    console.log('📋 Dados da assinatura:', subscriptionData);

    // Fazer requisição para API de Assinaturas do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData)
    });

    console.log('📡 Status da resposta:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Erro na API do MP:', errorData);
      return res.status(response.status).json({
        success: false,
        error: 'Erro na API do Mercado Pago',
        message: errorData
      });
    }

    const data = await response.json();
    console.log('✅ Assinatura criada:', data);

    return res.status(200).json({
      success: true,
      subscriptionId: data.id,
      initPoint: data.init_point,
      status: data.status
    });

  } catch (error) {
    console.error('❌ Erro ao criar assinatura:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}
