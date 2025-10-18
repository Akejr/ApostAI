import React, { useEffect, useState } from 'react';
import { CheckCircle, Home, BarChart3, Copy, User, Calendar } from 'lucide-react';
import { checkPaymentStatus, generateUserCode } from '../lib/payment';
import { savePaidUser, PaidUser } from '../lib/supabase';

const SuccessPage: React.FC = () => {
  const [paymentStatus, setPaymentStatus] = useState<{
    success: boolean;
    paid: boolean;
    loading: boolean;
  }>({ success: false, paid: false, loading: true });

  const [userData, setUserData] = useState<{
    name: string;
    code: string;
    plan: string;
    loading: boolean;
  }>({ name: '', code: '', plan: '', loading: false });

  const [userName, setUserName] = useState<string>('');
  const [showNameInput, setShowNameInput] = useState<boolean>(false);

  useEffect(() => {
    const verifyPayment = async () => {
      // Pegar parâmetros da URL do Mercado Pago
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get('payment_id');
      const status = urlParams.get('status');
      const externalReference = urlParams.get('external_reference');
      
      console.log('🔍 Parâmetros da URL (Mercado Pago):', { paymentId, status, externalReference });
      console.log('🔍 URL completa:', window.location.href);
      
      // Verificar se temos parâmetros do Mercado Pago
      if (paymentId && externalReference) {
        console.log('✅ Pagamento detectado via Mercado Pago!');
        
        // Verificar status do pagamento
        const paymentStatus = await checkPaymentStatus(paymentId, externalReference);
        
        if (paymentStatus.success) {
          console.log('✅ Pagamento aprovado! Solicitando nome...');
          setPaymentStatus({ success: true, paid: paymentStatus.paid, loading: false });
          setShowNameInput(true);
        } else {
          console.log('❌ Pagamento não aprovado');
          setPaymentStatus({ success: false, paid: false, loading: false });
        }
      } else {
        console.log('❌ Parâmetros do Mercado Pago não encontrados na URL');
        setPaymentStatus({ success: false, paid: false, loading: false });
      }
    };

    verifyPayment();
  }, []);

  const generateUserCodeAndSave = async (paymentId: string, orderId: string, fullName: string) => {
    setUserData(prev => ({ ...prev, loading: true }));
    
    try {
      // Pegar dados do pedido do localStorage
      const currentOrder = localStorage.getItem('currentOrder');
      if (!currentOrder) {
        throw new Error('Dados do pedido não encontrados');
      }
      
      const orderData = JSON.parse(currentOrder);
      
      // Gerar código único usando o nome fornecido
      const userCode = generateUserCode(fullName);
      
      // Salvar no Supabase
      const savedUser = await savePaidUser({
        name: fullName,
        code: userCode,
        plan: orderData.planName,
        planPrice: orderData.planPrice,
        orderId: orderId,
        transactionId: paymentId // Usar paymentId como transactionId para compatibilidade
      });
      
      if (savedUser) {
        setUserData({
          name: savedUser.name,
          code: savedUser.code,
          plan: savedUser.plan,
          loading: false
        });
        
        // Fazer login automático
        await performAutoLogin(savedUser);
      }
    } catch (error) {
      console.error('Erro ao gerar código do usuário:', error);
      setUserData(prev => ({ ...prev, loading: false }));
    }
  };

  const performAutoLogin = async (user: PaidUser) => {
    try {
      // Salvar dados de autenticação no localStorage
      const authData = {
        user: {
          id: user.id,
          name: user.name,
          code: user.code,
          plan: user.plan,
          credits: user.credits,
          analyses: user.analyses
        },
        timestamp: Date.now()
      };
      
      localStorage.setItem('userAuth', JSON.stringify(authData));
      
      // Aguardar um pouco para mostrar a tela de sucesso
      setTimeout(() => {
        console.log('🔄 Redirecionando para /analisar...');
        window.location.href = '/analisar';
      }, 3000);
    } catch (error) {
      console.error('Erro no login automático:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aqui você pode adicionar uma notificação de "copiado"
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoToAnalysis = () => {
    window.location.href = '/analisar';
  };

  if (paymentStatus.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF3002] mx-auto mb-4"></div>
          <p className="text-white text-lg">Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
                 {paymentStatus.paid ? (
           // Pagamento aprovado
           <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/10 text-center">
             <div className="mb-8">
               <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
               <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                 Pagamento Aprovado!
               </h1>
               <p className="text-lg text-gray-300 mb-8">
                 Seu plano foi ativado com sucesso. Você será redirecionado automaticamente em alguns segundos.
               </p>
             </div>

                           {showNameInput ? (
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-2xl mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Digite seu nome completo:</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Ex: João Silva Santos"
                      className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors"
                    />
                    <button
                      onClick={async () => {
                        if (userName.trim()) {
                          const urlParams = new URLSearchParams(window.location.search);
                          const paymentId = urlParams.get('payment_id');
                          const externalReference = urlParams.get('external_reference');
                          if (paymentId && externalReference) {
                            await generateUserCodeAndSave(paymentId, externalReference, userName.trim());
                            setShowNameInput(false);
                          }
                        }
                      }}
                      disabled={!userName.trim()}
                      className="w-full bg-[#FF3002] hover:bg-[#E02702] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-colors"
                    >
                      Gerar Código de Acesso
                    </button>
                  </div>
                </div>
              ) : userData.loading ? (
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-2xl mb-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF3002] mx-auto mb-4"></div>
                  <p className="text-white">Gerando seu código de acesso...</p>
                </div>
              ) : userData.code ? (
               <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-6 rounded-2xl mb-8">
                 <h3 className="text-xl font-semibold text-white mb-6">Seus dados de acesso:</h3>
                 
                 <div className="space-y-4 text-left">
                   <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl">
                     <div className="flex items-center space-x-3">
                       <User className="w-5 h-5 text-[#FF3002]" />
                       <span className="text-gray-300">Nome:</span>
                     </div>
                     <span className="text-white font-semibold">{userData.name}</span>
                   </div>
                   
                   <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl">
                     <div className="flex items-center space-x-3">
                       <span className="text-[#FF3002] font-bold">🔑</span>
                       <span className="text-gray-300">Código de Acesso:</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <span className="text-white font-mono font-bold text-lg">{userData.code}</span>
                       <button
                         onClick={() => copyToClipboard(userData.code)}
                         className="bg-[#FF3002] hover:bg-[#E02702] p-2 rounded-lg transition-colors"
                       >
                         <Copy className="w-4 h-4 text-white" />
                       </button>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl">
                     <div className="flex items-center space-x-3">
                       <span className="text-[#FF3002] font-bold">📋</span>
                       <span className="text-gray-300">Plano:</span>
                     </div>
                     <span className="text-white font-semibold">{userData.plan}</span>
                   </div>
                   
                   <div className="flex items-center justify-between bg-black/30 p-4 rounded-xl">
                     <div className="flex items-center space-x-3">
                       <Calendar className="w-5 h-5 text-[#FF3002]" />
                       <span className="text-gray-300">Validade:</span>
                     </div>
                     <span className="text-white font-semibold">30 dias</span>
                   </div>
                 </div>
                 
                 <div className="mt-6 p-4 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
                   <p className="text-yellow-300 text-sm">
                     <strong>Importante:</strong> Guarde seu código de acesso! Você precisará dele para acessar o sistema.
                   </p>
                 </div>
               </div>
             ) : (
               <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-6 rounded-2xl mb-8">
                 <h3 className="text-xl font-semibold text-white mb-4">O que você pode fazer agora:</h3>
                 <ul className="text-left space-y-3 text-gray-300">
                   <li className="flex items-center space-x-3">
                     <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                     <span>Acessar análises completas de times</span>
                   </li>
                   <li className="flex items-center space-x-3">
                     <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                     <span>Ver dados estatísticos detalhados</span>
                   </li>
                   <li className="flex items-center space-x-3">
                     <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                     <span>Receber recomendações personalizadas</span>
                   </li>
                 </ul>
               </div>
             )}

             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <button
                 onClick={handleGoToAnalysis}
                 className="flex items-center justify-center space-x-2 bg-[#FF3002] hover:bg-[#E02702] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF3002]/30 transform hover:scale-105"
               >
                 <BarChart3 className="w-5 h-5" />
                 <span>Ir para Análises</span>
               </button>
               
               <button
                 onClick={handleGoHome}
                 className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105"
               >
                 <Home className="w-5 h-5" />
                 <span>Voltar ao Início</span>
               </button>
             </div>
           </div>
        ) : (
          // Pagamento não aprovado
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-white/10 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-red-400 text-3xl font-bold">!</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Pagamento Pendente
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                Seu pagamento ainda está sendo processado. Você receberá uma confirmação em breve.
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-2xl mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">O que fazer agora:</h3>
              <ul className="text-left space-y-3 text-gray-300">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></span>
                  <span>Aguarde a confirmação do pagamento</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></span>
                  <span>Verifique seu email para mais informações</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></span>
                  <span>Entre em contato se tiver dúvidas</span>
                </li>
              </ul>
            </div>

                         <div className="space-y-4">
               <button
                 onClick={handleGoHome}
                 className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105 mx-auto"
               >
                 <Home className="w-5 h-5" />
                 <span>Voltar ao Início</span>
               </button>
               
                               {/* Botão de teste para desenvolvimento */}
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={async () => {
                      console.log('🧪 Teste: Simulando pagamento aprovado...');
                      setPaymentStatus({ success: true, paid: true, loading: false });
                      setShowNameInput(true);
                    }}
                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:shadow-lg transform hover:scale-105 mx-auto"
                  >
                    <span>🧪 Teste: Simular Pagamento</span>
                  </button>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
