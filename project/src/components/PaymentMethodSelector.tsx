import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle } from 'lucide-react';

interface PaymentMethodSelectorProps {
  onMethodSelect: (method: 'pix' | 'subscription') => void;
  selectedMethod: 'pix' | 'subscription' | null;
  planName: string;
  price: number;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onMethodSelect,
  selectedMethod,
  planName,
  price
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Escolha a forma de pagamento
      </h3>
      
      <div className="space-y-4">
        {/* Opção PIX */}
        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
            selectedMethod === 'pix' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-green-300'
          }`}
          onClick={() => {
            onMethodSelect('pix');
            setIsExpanded(false);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                selectedMethod === 'pix' ? 'bg-green-500' : 'bg-gray-100'
              }`}>
                <Smartphone className={`w-5 h-5 ${
                  selectedMethod === 'pix' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">PIX</h4>
                <p className="text-sm text-gray-600">Pagamento único via Checkout Pro</p>
              </div>
            </div>
            {selectedMethod === 'pix' && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          
          {selectedMethod === 'pix' && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Valor mensal:</span>
                <span className="font-semibold text-green-700">
                  {formatPrice(price)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Pagamento único - você escolhe PIX, cartão ou boleto
              </p>
            </div>
          )}
        </div>

        {/* Opção Assinatura */}
        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
            selectedMethod === 'subscription' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => {
            onMethodSelect('subscription');
            setIsExpanded(false);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                selectedMethod === 'subscription' ? 'bg-blue-500' : 'bg-gray-100'
              }`}>
                <CreditCard className={`w-5 h-5 ${
                  selectedMethod === 'subscription' ? 'text-white' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Cartão de Crédito</h4>
                <p className="text-sm text-gray-600">Assinatura via Checkout Pro</p>
              </div>
            </div>
            {selectedMethod === 'subscription' && (
              <CheckCircle className="w-5 h-5 text-blue-500" />
            )}
          </div>
          
          {selectedMethod === 'subscription' && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Valor mensal:</span>
                <span className="font-semibold text-blue-700">
                  {formatPrice(price)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ✅ Assinatura automática - você escolhe PIX, cartão ou boleto
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">
          📋 Resumo do {planName}:
        </h5>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Acesso completo à plataforma</li>
          <li>• Análises de jogos em tempo real</li>
          <li>• Suporte prioritário</li>
          <li>• Sem taxas adicionais</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
