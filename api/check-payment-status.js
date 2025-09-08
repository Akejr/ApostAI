import mercadopago from 'mercadopago';

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { orderId, externalReference } = req.body;
    
    console.log('🔍 Verificando status do pagamento:', { orderId, externalReference });
    
    if (!externalReference) {
      return res.status(400).json({ error: 'external_reference é obrigatório' });
    }

    // Buscar pagamentos por external_reference
    const searchResponse = await mercadopago.payment.search({
      qs: {
        'external_reference': externalReference
      }
    });

    console.log('📊 Resultado da busca:', searchResponse);

    if (searchResponse.body.results && searchResponse.body.results.length > 0) {
      const payment = searchResponse.body.results[0];
      
      console.log('💳 Pagamento encontrado:', {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        external_reference: payment.external_reference
      });

      return res.status(200).json({
        success: true,
        paymentId: payment.id,
        status: payment.status,
        statusDetail: payment.status_detail,
        externalReference: payment.external_reference,
        amount: payment.transaction_amount,
        currency: payment.currency_id,
        dateCreated: payment.date_created,
        dateApproved: payment.date_approved
      });
    } else {
      console.log('❌ Nenhum pagamento encontrado para external_reference:', externalReference);
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar status do pagamento:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}
