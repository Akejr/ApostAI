import React from 'react';
import { XCircle, Home, RefreshCw, ArrowLeft } from 'lucide-react';

const FailurePage: React.FC = () => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleTryAgain = () => {
    // Voltar para a página anterior (checkout)
    window.history.back();
  };

  const handleGoToPlans = () => {
    window.location.href = '/#planos';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/10 text-center">
          <div className="mb-8">
            <XCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Pagamento Não Realizado
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Houve um problema com seu pagamento. Não se preocupe, nenhum valor foi cobrado.
            </p>
          </div>

          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 p-6 rounded-2xl mb-8 border border-red-500/30">
            <h3 className="text-xl font-semibold text-white mb-4">Possíveis causas:</h3>
            <ul className="text-left space-y-3 text-gray-300">
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></span>
                <span>Cartão sem limite disponível</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></span>
                <span>Dados do cartão incorretos</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></span>
                <span>Problema temporário com o banco</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></span>
                <span>Cancelamento durante o processo</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-2xl mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">O que fazer agora:</h3>
            <ul className="text-left space-y-3 text-gray-300">
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                <span>Verifique os dados do seu cartão</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                <span>Confirme se há limite disponível</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                <span>Tente novamente em alguns minutos</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                <span>Use outro método de pagamento</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleTryAgain}
              className="flex items-center justify-center space-x-2 bg-[#FF3002] hover:bg-[#E02702] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF3002]/30 transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Tentar Novamente</span>
            </button>
            
            <button
              onClick={handleGoToPlans}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Ver Planos</span>
            </button>
            
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              <span>Início</span>
            </button>
          </div>

          <div className="mt-8 p-4 bg-gray-800/50 rounded-xl">
            <p className="text-gray-400 text-sm">
              <strong>Precisa de ajuda?</strong><br />
              Entre em contato conosco e resolveremos rapidamente!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailurePage;
