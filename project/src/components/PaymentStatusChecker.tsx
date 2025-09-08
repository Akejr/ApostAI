import React, { useState } from 'react';
import { CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface PaymentStatusCheckerProps {
  orderId: string;
  onPaymentConfirmed: () => void;
}

const PaymentStatusChecker: React.FC<PaymentStatusCheckerProps> = ({ orderId, onPaymentConfirmed }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkPaymentStatus = async () => {
    setIsChecking(true);
    
    try {
      console.log('🔍 Verificando status do pagamento...', orderId);
      
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
          onPaymentConfirmed();
          return;
        }
      }
      
      setLastCheck(new Date());
    } catch (error) {
      console.error('❌ Erro ao verificar pagamento:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {isChecking ? (
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              Já pagou o PIX?
            </p>
            <p className="text-xs text-gray-500">
              Clique para verificar o status
            </p>
            {lastCheck && (
              <p className="text-xs text-gray-400">
                Última verificação: {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={checkPaymentStatus}
            disabled={isChecking}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            {isChecking ? 'Verificando...' : 'Verificar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusChecker;
