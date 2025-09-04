// Webhook do Mercado Pago para Vercel Functions
// Este arquivo deve estar em /api/webhook/mercadopago.js

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Configurações do Supabase (use as mesmas do seu projeto)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configurações do Mercado Pago
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const MERCADOPAGO_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET;

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

export default async function handler(req, res) {
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

    // Verificar se é notificação de pagamento
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
          // Aqui você pode processar o pagamento aprovado
          // Por exemplo, ativar o usuário no banco de dados
          console.log(`✅ Pagamento aprovado! Order ID: ${externalReference}`);
          
          // Buscar dados do pedido (se você armazenar em algum lugar)
          // e ativar o usuário correspondente
          
          // Exemplo de como você poderia ativar um usuário:
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
        // Aqui você pode processar pagamento rejeitado
      } else {
        console.log(`⏳ Pagamento pendente! Status: ${payment.status}`);
        // Aqui você pode processar pagamento pendente
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
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
