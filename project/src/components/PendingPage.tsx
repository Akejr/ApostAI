import React, { useEffect, useState } from 'react';
import { Clock, Home, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const PendingPage: React.FC = () => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRefreshStatus = () => {
    window.location.reload();
  };

  const handleGoToAnalysis = () => {
    window.location.href = '/analisar';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/10 text-center">
          <div className="mb-8">
            <div className="relative">
              <Clock className="w-20 h-20 text-yellow-400 mx-auto mb-6 animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Pagamento em Processamento
            </h1>
            <p className="text-lg text-gray-300 mb-4">
              Seu pagamento está sendo processado. Isso pode levar alguns minutos.
            </p>
            <div className="bg-yellow-500/20 rounded-xl p-3 inline-block">
              <p className="text-yellow-300 font-mono text-lg">
                Aguardando há: {formatTime(timeElapsed)}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-2xl mb-8 border border-yellow-500/30">
            <h3 className="text-xl font-semibold text-white mb-4">Status do Pagamento:</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Pedido Criado</span>
                </div>
                <span className="text-green-400 font-semibold">✓ Concluído</span>
              </div>
              
              <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-300">Processando Pagamento</span>
                </div>
                <span className="text-yellow-400 font-semibold">⏳ Em andamento</span>
              </div>
              
              <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl opacity-50">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-500">Ativação do Plano</span>
                </div>
                <span className="text-gray-500 font-semibold">⏸ Aguardando</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-2xl mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Métodos de pagamento que podem demorar:</h3>
            <ul className="text-left space-y-3 text-gray-300">
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                <span><strong>PIX:</strong> Até 2 minutos após confirmação</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                <span><strong>Boleto:</strong> 1-2 dias úteis após pagamento</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                <span><strong>Cartão:</strong> Verificação de segurança (até 5 min)</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-6 rounded-2xl mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">O que acontece quando for aprovado:</h3>
            <ul className="text-left space-y-3 text-gray-300">
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>Você será redirecionado automaticamente</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>Receberá seu código de acesso único</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>Poderá usar o sistema imediatamente</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span>Receberá email de confirmação</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRefreshStatus}
              className="flex items-center justify-center space-x-2 bg-[#FF3002] hover:bg-[#E02702] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF3002]/30 transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Atualizar Status</span>
            </button>
            
            <button
              onClick={handleGoToAnalysis}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105"
            >
              <span>Já tenho uma conta</span>
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
              <strong>Dica:</strong> Mantenha esta página aberta. Você será redirecionado automaticamente quando o pagamento for confirmado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingPage;
