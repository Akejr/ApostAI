// Webhook do Mercado Pago para Vercel Functions
// Este arquivo deve estar em /api/webhook/mercadopago.js

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configurações do Supabase (use as mesmas do seu projeto)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configurações do Mercado Pago
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-4948508052320612-090417-52cf3c977b061c03b25a0bbd84920dd3-1423321368';
const MERCADOPAGO_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || 'a31984476039e38c886fc7a688a830d3bb52817b2ab5d8fce68866e1d899e98f';

// Função para validar assinatura do webhook
function validateWebhookSignature(body, signature, secret) {
  try {
    const bodyString = JSON.stringify(body);
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(bodyString)
      .digest('hex');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('❌ Erro ao validar assinatura:', error);
    return false;
  }
}

module.exports = async function handler(req, res) {
  // Permitir apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔔 Webhook recebido do Mercado Pago');
    console.log('📋 Headers:', req.headers);
    console.log('📋 Body:', req.body);

    // Validar assinatura do webhook para segurança
    const signature = req.headers['x-signature'];
    if (signature && MERCADOPAGO_WEBHOOK_SECRET) {
      const isValidSignature = validateWebhookSignature(req.body, signature, MERCADOPAGO_WEBHOOK_SECRET);
      
      if (!isValidSignature) {
        console.log('❌ Assinatura inválida - webhook rejeitado');
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      console.log('✅ Assinatura validada com sucesso');
    } else {
      console.log('⚠️ Webhook sem assinatura - aceitando para desenvolvimento');
    }

    const { type, data } = req.body;

    // Verificar se é notificação de pagamento ou assinatura
    if (type === 'payment') {
      const paymentId = data?.id;
      
      if (!paymentId) {
        console.log('❌ Payment ID não encontrado');
        return res.status(400).json({ error: 'Payment ID not found' });
      }

      // Buscar detalhes do pagamento na API do Mercado Pago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!paymentResponse.ok) {
        console.log('❌ Erro ao buscar pagamento:', paymentResponse.status);
        return res.status(400).json({ error: 'Failed to fetch payment details' });
      }

      const payment = await paymentResponse.json();
      console.log('💰 Detalhes do pagamento:', payment);

      // Verificar se o pagamento foi aprovado
      if (payment.status === 'approved') {
        const externalReference = payment.external_reference;
        
        if (externalReference) {
          console.log(`✅ Pagamento aprovado! Order ID: ${externalReference}`);
          
          // Ativar usuário no banco de dados
          /*
          const { data: userData, error } = await supabase
            .from('users')
            .update({ status: 'active' })
            .eq('order_id', externalReference);
          
          if (error) {
            console.error('❌ Erro ao ativar usuário:', error);
          } else {
            console.log('✅ Usuário ativado com sucesso');
          }
          */
        }
      } else if (payment.status === 'rejected') {
        console.log(`❌ Pagamento rejeitado! Order ID: ${payment.external_reference}`);
      } else {
        console.log(`⏳ Pagamento pendente! Status: ${payment.status}`);
      }
    }
    
    // Verificar se é notificação de assinatura
    if (type === 'subscription_preapproval') {
      const subscriptionId = data?.id;
      
      if (!subscriptionId) {
        console.log('❌ Subscription ID não encontrado');
        return res.status(400).json({ error: 'Subscription ID not found' });
      }

      // Buscar detalhes da assinatura na API do Mercado Pago
      const subscriptionResponse = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!subscriptionResponse.ok) {
        console.log('❌ Erro ao buscar assinatura:', subscriptionResponse.status);
        return res.status(400).json({ error: 'Failed to fetch subscription details' });
      }

      const subscription = await subscriptionResponse.json();
      console.log('📋 Detalhes da assinatura:', subscription);

      // Verificar se a assinatura foi aprovada
      if (subscription.status === 'authorized') {
        const externalReference = subscription.external_reference;
        
        if (externalReference) {
          console.log(`✅ Assinatura aprovada! Order ID: ${externalReference}`);
          
          // Ativar usuário no banco de dados
          /*
          const { data: userData, error } = await supabase
            .from('users')
            .update({ status: 'active' })
            .eq('order_id', externalReference);
          
          if (error) {
            console.error('❌ Erro ao ativar usuário:', error);
          } else {
            console.log('✅ Usuário ativado com sucesso');
          }
          */
        }
      } else if (subscription.status === 'cancelled') {
        console.log(`❌ Assinatura cancelada! Order ID: ${subscription.external_reference}`);
      } else {
        console.log(`⏳ Assinatura pendente! Status: ${subscription.status}`);
      }
    }

    // Responder OK para o Mercado Pago
    return res.status(200).json({ 
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Configuração para Vercel
module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
