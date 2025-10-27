import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  X, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  User,
  Calendar,
  CreditCard,
  BarChart3,
  Target,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import logo from './assets/logo.png';
import { supabase, DatabaseUser, AdminUser, PaidUser } from './lib/supabase';

interface User {
  id: string;
  name: string;
  code: string;
  plan: 'Básico' | 'Pro' | 'Premium';
  credits: number;
  analyses: number;
  status: 'active' | 'expired';
  createdAt: string;
  expiresAt: string;
  couponCode?: string;
}

interface Coupon {
  id: string;
  name: string;
  code: string;
  discountPercentage: number;
  profitPercentage: number;
  createdAt: string;
  isActive: boolean;
}

interface CouponUser {
  id: string;
  name: string;
  code: string;
  plan: 'Básico' | 'Pro' | 'Premium';
  couponCode: string;
  planPrice: number;
  profitAmount: number;
  createdAt: string;
  status: 'active' | 'expired';
}

interface DashboardStats {
  activeUsers: number;
  totalUsers: number;
  monthlyRevenue: number;
  totalAnalyses: number;
}

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      if (Date.now() - authData.timestamp < 24 * 60 * 60 * 1000) {
        return true;
      } else {
        localStorage.removeItem('adminAuth');
      }
    }
    return false;
  });

  const [username, setUsername] = useState(() => {
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      if (Date.now() - authData.timestamp < 24 * 60 * 60 * 1000) {
        return authData.username;
      }
    }
    return '';
  });

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<'Básico' | 'Pro' | 'Premium'>('Básico');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  
  // Estados para gerenciamento de créditos
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditsAction, setCreditsAction] = useState<'add' | 'remove'>('add');
  const [creditsAmount, setCreditsAmount] = useState(1);

  // Estados para dados do Supabase
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    activeUsers: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    totalAnalyses: 0
  });
  const [loading, setLoading] = useState(true);

  // Estados para sistema de cupons
  const [activeTab, setActiveTab] = useState<'users' | 'coupons'>('users');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showNewCouponModal, setShowNewCouponModal] = useState(false);
  const [showEditCouponModal, setShowEditCouponModal] = useState(false);
  const [showCouponUsersModal, setShowCouponUsersModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [newCouponName, setNewCouponName] = useState('');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [newCouponProfit, setNewCouponProfit] = useState(5);

  // Estados para notificações e confirmações personalizadas
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
      loadDashboardStats();
      loadCoupons();
    }
  }, [isAuthenticated]);

  // Funções para notificações e confirmações personalizadas
  const showNotificationMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const showConfirmation = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        return;
      }

      const convertedUsers: User[] = data.map((dbUser: PaidUser) => ({
        id: dbUser.id,
        name: dbUser.name,
        code: dbUser.code,
        plan: dbUser.plan,
        credits: dbUser.credits,
        analyses: dbUser.analyses,
        status: dbUser.status,
        createdAt: dbUser.created_at,
        expiresAt: dbUser.expires_at,
        couponCode: dbUser.coupon_code
      }));

      setUsers(convertedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) {
        console.error('Erro ao carregar estatísticas:', usersError);
        return;
      }

      const activeUsers = usersData.filter((user: PaidUser) => user.status === 'active').length;
      const totalUsers = usersData.length;
      const totalAnalyses = usersData.reduce((sum: number, user: PaidUser) => sum + user.analyses, 0);

      const monthlyRevenue = usersData
        .filter((user: PaidUser) => user.status === 'active')
        .reduce((sum: number, user: PaidUser) => {
          const planPrices = { 'Básico': 35, 'Pro': 45, 'Premium': 99 };
          return sum + (planPrices[user.plan] || 0);
        }, 0);

      setDashboardStats({
        activeUsers,
        totalUsers,
        monthlyRevenue,
        totalAnalyses
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar cupons:', error);
        setCoupons([]);
      } else {
        const convertedCoupons: Coupon[] = (data || []).map((dbCoupon: any) => ({
          id: dbCoupon.id,
          name: dbCoupon.name,
          code: dbCoupon.code,
          discountPercentage: dbCoupon.discount_percentage,
          profitPercentage: dbCoupon.profit_percentage,
          createdAt: dbCoupon.created_at,
          isActive: dbCoupon.is_active
        }));
        setCoupons(convertedCoupons);
      }
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      setCoupons([]);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'ecasanovs' && password === 'aeiou123') {
      setIsAuthenticated(true);
      setLoginError('');
      
      const authData = {
        username: username,
        timestamp: Date.now()
      };
      localStorage.setItem('adminAuth', JSON.stringify(authData));
    } else {
      setLoginError('Usuário ou senha incorretos');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    localStorage.removeItem('adminAuth');
  };

  const generateNewCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${newUserName.substring(0, 2).toUpperCase()}${timestamp}${random}`;
  };

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return;

    try {
      const newUserData = {
        name: newUserName,
        code: generateNewCode(),
        plan: newUserPlan,
        credits: newUserPlan === 'Básico' ? 7 : newUserPlan === 'Pro' ? 15 : 999,
        analyses: 0,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        coupon_code: null
      };

      const { data, error } = await supabase
        .from('users')
        .insert([newUserData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar usuário:', error);
        return;
      }

      await loadUsers();
      await loadDashboardStats();
      
      setShowNewUserModal(false);
      setNewUserName('');
      setNewUserPlan('Básico');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCouponName.trim() || !newCouponCode.trim()) {
      showNotificationMessage('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('coupons')
        .insert({
          name: newCouponName.trim(),
          code: newCouponCode.trim().toUpperCase(),
          discount_percentage: newCouponDiscount,
          profit_percentage: newCouponProfit,
          is_active: true
        });

      if (error) {
        console.error('Erro ao criar cupom:', error);
        showNotificationMessage('Erro ao criar cupom: ' + error.message, 'error');
      } else {
        console.log('✅ Cupom criado com sucesso');
        showNotificationMessage('✅ Cupom criado com sucesso!', 'success');
        
        setNewCouponName('');
        setNewCouponCode('');
        setNewCouponDiscount(10);
        setNewCouponProfit(5);
        setShowNewCouponModal(false);
        
        loadCoupons();
      }
    } catch (error) {
      console.error('Erro ao criar cupom:', error);
      showNotificationMessage('Erro ao criar cupom', 'error');
    }
  };

  const handleEditCoupon = async () => {
    if (!selectedCoupon || !newCouponName.trim() || !newCouponCode.trim()) {
      showNotificationMessage('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('coupons')
        .update({
          name: newCouponName.trim(),
          code: newCouponCode.trim().toUpperCase(),
          discount_percentage: newCouponDiscount,
          profit_percentage: newCouponProfit
        })
        .eq('id', selectedCoupon.id);

      if (error) {
        console.error('Erro ao atualizar cupom:', error);
        showNotificationMessage('Erro ao atualizar cupom: ' + error.message, 'error');
      } else {
        setShowEditCouponModal(false);
        setSelectedCoupon(null);
        setNewCouponName('');
        setNewCouponCode('');
        setNewCouponDiscount(10);
        setNewCouponProfit(5);
        showNotificationMessage('Cupom atualizado com sucesso!', 'success');
        loadCoupons();
      }
    } catch (error) {
      console.error('Erro ao atualizar cupom:', error);
      showNotificationMessage('Erro ao atualizar cupom', 'error');
    }
  };

    const handleDeleteCoupon = (coupon: Coupon) => {
    const deleteAction = async () => {
      try {
        const { error } = await supabase
          .from('coupons')
          .delete()
          .eq('id', coupon.id);

        if (error) {
          console.error('Erro ao deletar cupom:', error);
          showNotificationMessage('Erro ao deletar cupom: ' + error.message, 'error');
        } else {
          showNotificationMessage('Cupom deletado com sucesso!', 'success');
          loadCoupons();
        }
    } catch (error) {
        console.error('Erro ao deletar cupom:', error);
        showNotificationMessage('Erro ao deletar cupom', 'error');
      }
    };

    showConfirmation(`Tem certeza que deseja deletar o cupom "${coupon.name}"?`, deleteAction);
  };

  const handleToggleCouponStatus = async (coupon: Coupon) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.isActive })
        .eq('id', coupon.id);

      if (error) {
        console.error('Erro ao alterar status do cupom:', error);
        showNotificationMessage('Erro ao alterar status do cupom: ' + error.message, 'error');
      } else {
        showNotificationMessage(`Cupom ${!coupon.isActive ? 'ativado' : 'desativado'} com sucesso!`, 'success');
        loadCoupons();
      }
    } catch (error) {
      console.error('Erro ao alterar status do cupom:', error);
      showNotificationMessage('Erro ao alterar status do cupom', 'error');
    }
  };

  const openEditCouponModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setNewCouponName(coupon.name);
    setNewCouponCode(coupon.code);
    setNewCouponDiscount(coupon.discountPercentage);
    setNewCouponProfit(coupon.profitPercentage);
    setShowEditCouponModal(true);
  };

  const openCouponUsersModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowCouponUsersModal(true);
  };

    const handleCancelPlan = (user: User) => {
    const cancelAction = async () => {
      try {
        const { error } = await supabase
          .from('users')
          .update({ 
            status: 'expired',
            expires_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) {
          console.error('Erro ao cancelar plano:', error);
          showNotificationMessage('Erro ao cancelar plano: ' + error.message, 'error');
        } else {
          showNotificationMessage('Plano cancelado com sucesso!', 'success');
          loadUsers();
        }
      } catch (error) {
        console.error('Erro ao cancelar plano:', error);
        showNotificationMessage('Erro ao cancelar plano', 'error');
      }
    };

    showConfirmation(`Tem certeza que deseja cancelar o plano de "${user.name}"?`, cancelAction);
  };

  const handleReactivatePlan = (user: User) => {
    const reactivateAction = async () => {
      try {
        // Nova data de ativação é hoje
        const activationDate = new Date();
        // Data de expiração é 1 mês após a ativação
        const expirationDate = new Date(activationDate);
        expirationDate.setMonth(expirationDate.getMonth() + 1);

        // Resetar créditos baseado no plano
        let credits = 5; // Básico
        if (user.plan === 'Pro') credits = 10;
        if (user.plan === 'Premium') credits = 999; // Ilimitado
      
      const { error } = await supabase
        .from('users')
        .update({ 
          status: 'active',
            expires_at: expirationDate.toISOString(),
            created_at: activationDate.toISOString(),
            credits: credits
        })
          .eq('id', user.id);

      if (error) {
          console.error('Erro ao reativar plano:', error);
          showNotificationMessage('Erro ao reativar plano: ' + error.message, 'error');
        } else {
          showNotificationMessage('Plano reativado com sucesso! Nova data de expiração: ' + expirationDate.toLocaleDateString('pt-BR'), 'success');
          loadUsers();
        }
      } catch (error) {
        console.error('Erro ao reativar plano:', error);
        showNotificationMessage('Erro ao reativar plano', 'error');
      }
    };

    showConfirmation(`Tem certeza que deseja reativar o plano de "${user.name}"? O plano será reativado por mais 1 mês a partir de hoje.`, reactivateAction);
  };

  const openCreditsModal = (user: User, action: 'add' | 'remove') => {
    setSelectedUser(user);
    setCreditsAction(action);
    setCreditsAmount(1);
    setShowCreditsModal(true);
  };

  const manageUserCredits = async () => {
    if (!selectedUser) return;

    try {
      let newCredits = selectedUser.credits;
      
      if (creditsAction === 'add') {
        newCredits += creditsAmount;
      } else if (creditsAction === 'remove') {
        newCredits = Math.max(0, newCredits - creditsAmount);
      }
      
      const { error } = await supabase
        .from('users')
        .update({ 
          credits: newCredits,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) {
        console.error('Erro ao atualizar créditos:', error);
        alert('Erro ao atualizar créditos');
      } else {
        console.log(`✅ Créditos ${creditsAction === 'add' ? 'adicionados' : 'removidos'} com sucesso`);
        alert(`✅ Créditos ${creditsAction === 'add' ? 'adicionados' : 'removidos'} com sucesso!`);
        
        setShowCreditsModal(false);
        setSelectedUser(null);
        loadUsers();
      }
    } catch (error) {
      console.error('Erro ao gerenciar créditos:', error);
      alert('Erro ao gerenciar créditos');
    }
  };

  const getCouponUsers = (couponCode: string): CouponUser[] => {
    const couponUsers = users.filter(user => user.couponCode === couponCode);
    
    return couponUsers.map(user => {
      const planPrice = user.plan === 'Básico' ? 5 : user.plan === 'Pro' ? 7 : 12;
      const profitAmount = (planPrice * (coupons.find(c => c.code === couponCode)?.profitPercentage || 0)) / 100;
      
      return {
        id: user.id,
        name: user.name,
        code: user.code,
        plan: user.plan,
        couponCode: user.couponCode || '',
        planPrice,
        profitAmount,
        createdAt: user.createdAt,
        status: user.status
      };
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src={logo} 
              alt="ApostAI Logo" 
              className="h-16 mx-auto mb-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="text-2xl font-bold text-white mb-2">Painel Administrativo</h1>
            <p className="text-gray-400">Faça login para acessar o sistema</p>
          </div>

          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Usuário</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors"
                  placeholder="Digite seu usuário"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors"
                    placeholder="Digite sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF3002] to-[#FF6B47] hover:from-[#E02702] hover:to-[#FF3002] text-white py-3 rounded-xl font-bold transition-all duration-300 hover:shadow-xl hover:shadow-[#FF3002]/30 transform hover:scale-105"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <img 
                src={logo} 
                alt="ApostAI Logo" 
                className="h-10 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-gray-400 text-sm">Painel Administrativo</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-white text-sm">Bem-vindo, {username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

       <nav className="bg-black/60 backdrop-blur-xl border-b border-white/10">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between py-4">
             <h2 className="text-xl font-bold text-white">Painel de Controle</h2>
             <button
               onClick={() => setShowNewUserModal(true)}
               className="bg-gradient-to-r from-[#FF3002] to-[#FF6B47] hover:from-[#E02702] hover:to-[#FF3002] text-white px-4 py-2 rounded-xl font-bold transition-all duration-300 hover:shadow-xl hover:shadow-[#FF3002]/30 transform hover:scale-105 flex items-center space-x-2"
             >
               <Plus className="w-4 h-4" />
               <span>Novo Usuário</span>
             </button>
           </div>
         </div>
       </nav>

       <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
           {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-[#FF3002]/30 transition-all duration-300">
               <div className="flex items-center justify-between">
                 <div>
                  <p className="text-gray-400 text-sm mb-2">Usuários Ativos</p>
                   <p className="text-3xl font-bold text-white">{dashboardStats.activeUsers}</p>
                 </div>
                <div className="bg-green-500/20 p-4 rounded-xl">
                  <Users className="w-7 h-7 text-green-400" />
                 </div>
               </div>
             </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-[#FF3002]/30 transition-all duration-300">
               <div className="flex items-center justify-between">
                 <div>
                  <p className="text-gray-400 text-sm mb-2">Total de Usuários</p>
                   <p className="text-3xl font-bold text-white">{dashboardStats.totalUsers}</p>
                 </div>
                <div className="bg-blue-500/20 p-4 rounded-xl">
                  <User className="w-7 h-7 text-blue-400" />
                 </div>
               </div>
             </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-[#FF3002]/30 transition-all duration-300">
               <div className="flex items-center justify-between">
                 <div>
                  <p className="text-gray-400 text-sm mb-2">Faturamento Mensal</p>
                   <p className="text-3xl font-bold text-white">R$ {dashboardStats.monthlyRevenue.toLocaleString()}</p>
                 </div>
                <div className="bg-yellow-500/20 p-4 rounded-xl">
                  <DollarSign className="w-7 h-7 text-yellow-400" />
                 </div>
               </div>
             </div>

            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-[#FF3002]/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Análises Realizadas</p>
                  <p className="text-3xl font-bold text-white">{dashboardStats.totalAnalyses}</p>
                </div>
                <div className="bg-purple-500/20 p-4 rounded-xl">
                  <BarChart3 className="w-7 h-7 text-purple-400" />
                </div>
              </div>
            </div>
           </div>

          {/* Abas */}
          <div className="flex space-x-2 mb-8 bg-white/5 rounded-xl p-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-4 px-8 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'users'
                  ? 'bg-[#FF3002] text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              👥 Usuários
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex-1 py-4 px-8 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'coupons'
                  ? 'bg-[#FF3002] text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              🎫 Cupons
            </button>
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                   <div className="flex items-center space-x-4">
                     <h2 className="text-2xl font-bold text-white">Gestão de Usuários</h2>
                    <span className="bg-[#FF3002]/20 text-[#FF3002] px-4 py-2 rounded-full text-sm font-medium">
                       {filteredUsers.length} usuários
                     </span>
                     <button
                       onClick={loadUsers}
                       className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 px-4 py-2 rounded-xl font-medium transition-all duration-300 border border-blue-500/30 hover:border-blue-500/50"
                       title="Atualizar dados dos usuários"
                     >
                       🔄 Atualizar
                     </button>
                   </div>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6">
                     <div className="relative">
                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                       <input
                         type="text"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         placeholder="Buscar por nome ou código..."
                        className="bg-black/60 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors w-full sm:w-64"
                       />
                     </div>

                     <select
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'expired')}
                      className="bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF3002] transition-colors"
                     >
                       <option value="all">Todos os status</option>
                       <option value="active">Ativos</option>
                       <option value="expired">Expirados</option>
                     </select>
                   </div>
                 </div>
               </div>

               <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                 {loading ? (
                   <div className="flex items-center justify-center py-12">
                     <div className="text-center">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF3002] mx-auto mb-4"></div>
                       <p className="text-gray-400">Carregando usuários...</p>
                     </div>
                   </div>
                 ) : (
                   <div>
                     <table className="w-full table-fixed">
                       <colgroup>
                         <col className="w-[15%]" />
                         <col className="w-[12%]" />
                         <col className="w-[10%]" />
                         <col className="w-[8%]" />
                         <col className="w-[8%]" />
                         <col className="w-[12%]" />
                         <col className="w-[10%]" />
                         <col className="w-[25%]" />
                       </colgroup>
                       <thead className="bg-black/60">
                         <tr>
                          <th className="px-3 py-4 text-left text-white font-semibold text-sm">Nome</th>
                          <th className="px-3 py-4 text-left text-white font-semibold text-sm">Código</th>
                          <th className="px-3 py-4 text-left text-white font-semibold text-sm">Plano</th>
                          <th className="px-3 py-4 text-left text-white font-semibold text-sm">Créditos</th>
                          <th className="px-3 py-4 text-left text-white font-semibold text-sm">Análises</th>
                          <th className="px-3 py-4 text-left text-white font-semibold text-sm">Expira em</th>
                          <th className="px-3 py-4 text-left text-white font-semibold text-sm">Status</th>
                          <th className="px-3 py-4 text-left text-white font-semibold text-sm">Ações</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/10">
                         {filteredUsers.map((user) => (
                           <tr key={user.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-3 py-4 text-white font-medium text-sm truncate" title={user.name}>{user.name}</td>
                            <td className="px-3 py-4 text-gray-300 font-mono text-xs">{user.code}</td>
                            <td className="px-3 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                 user.plan === 'Premium' 
                                   ? 'bg-purple-500/20 text-purple-400'
                                   : user.plan === 'Pro'
                                   ? 'bg-[#FF3002]/20 text-[#FF3002]'
                                   : 'bg-blue-500/20 text-blue-400'
                               }`}>
                                 {user.plan}
                               </span>
                             </td>
                            <td className="px-3 py-4 text-white font-semibold text-sm">{user.credits}</td>
                            <td className="px-3 py-4 text-blue-400 font-semibold text-sm">{user.analyses || 0}</td>
                            <td className="px-3 py-4 text-gray-300 text-sm">
                              {user.expiresAt ? new Date(user.expiresAt).toLocaleDateString('pt-BR') : 'N/A'}
                            </td>
                            <td className="px-3 py-4">
                               <span className={`flex items-center space-x-1 ${
                                 user.status === 'active' 
                                   ? 'text-green-400' 
                                   : 'text-red-400'
                               }`}>
                                 {user.status === 'active' ? (
                                   <CheckCircle className="w-3 h-3" />
                                 ) : (
                                   <AlertCircle className="w-3 h-3" />
                                 )}
                                 <span className="text-xs font-medium">
                                   {user.status === 'active' ? 'Ativo' : 'Expirado'}
                                 </span>
                               </span>
                             </td>
                            <td className="px-3 py-4">
                              <div className="flex items-center space-x-1 flex-wrap gap-1">
                                <button
                                  onClick={() => openCreditsModal(user, 'add')}
                                  className="bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 p-2 rounded-lg text-sm transition-all duration-300"
                                  title="Adicionar créditos"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                
                                <button
                                  onClick={() => openCreditsModal(user, 'remove')}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 p-2 rounded-lg text-sm transition-all duration-300"
                                  title="Remover créditos"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                
                                 {user.status === 'active' ? (
                                   <button
                                    onClick={() => handleCancelPlan(user)}
                                    className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 p-2 rounded-lg text-sm transition-all duration-300"
                                    title="Cancelar plano"
                                   >
                                    <AlertCircle className="w-3 h-3" />
                                   </button>
                                 ) : (
                                   <button
                                    onClick={() => handleReactivatePlan(user)}
                                    className="bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 p-2 rounded-lg text-sm transition-all duration-300"
                                    title="Reativar plano"
                                   >
                                    <RefreshCw className="w-3 h-3" />
                                   </button>
                                 )}
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </div>
             </div>
          )}

          {/* Coupons Tab */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold text-white">Cupons de Influenciadores</h2>
                    <span className="bg-[#FF3002]/20 text-[#FF3002] px-3 py-1 rounded-full text-sm font-medium">
                      {coupons.length} cupons
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNewCouponModal(true)}
                    className="bg-gradient-to-r from-[#FF3002] to-[#FF6B47] hover:from-[#E02702] hover:to-[#FF3002] text-white px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Cupom</span>
                  </button>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF3002] mx-auto mb-4"></div>
                      <p className="text-gray-400">Carregando cupons...</p>
                    </div>
                  </div>
                ) : coupons.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-gray-400 text-lg mb-4">Nenhum cupom criado ainda</p>
                      <button
                        onClick={() => setShowNewCouponModal(true)}
                        className="bg-gradient-to-r from-[#FF3002] to-[#FF6B47] hover:from-[#E02702] hover:to-[#FF3002] text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Criar Primeiro Cupom</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-black/60">
                        <tr>
                          <th className="px-6 py-4 text-left text-white font-semibold">Nome</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Código</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Desconto</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Lucro</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                          <th className="px-6 py-4 text-left text-white font-semibold">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {coupons.map((coupon) => (
                          <tr key={coupon.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-white font-medium">{coupon.name}</td>
                            <td className="px-6 py-4 text-gray-300 font-mono">{coupon.code}</td>
                            <td className="px-6 py-4 text-white">{coupon.discountPercentage}%</td>
                            <td className="px-6 py-4 text-white">{coupon.profitPercentage}%</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                coupon.isActive 
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {coupon.isActive ? 'Ativo' : 'Inativo'}
                              </span>
                             </td>
                             <td className="px-6 py-4">
                               <div className="flex items-center space-x-2">
                                   <button
                                  onClick={() => openCouponUsersModal(coupon)}
                                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 px-3 py-2 rounded-lg text-sm transition-all duration-300"
                                  title="Ver usuários e lucros"
                                   >
                                  <Eye className="w-4 h-4" />
                                   </button>
                                
                                   <button
                                  onClick={() => openEditCouponModal(coupon)}
                                  className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300 px-3 py-2 rounded-lg text-sm transition-all duration-300"
                                  title="Editar cupom"
                                   >
                                  <Edit className="w-4 h-4" />
                                   </button>
                                
                                <button
                                  onClick={() => handleToggleCouponStatus(coupon)}
                                  className={`px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                                    coupon.isActive 
                                      ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                                      : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300'
                                  }`}
                                  title={coupon.isActive ? 'Desativar cupom' : 'Ativar cupom'}
                                >
                                  {coupon.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteCoupon(coupon)}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg text-sm transition-all duration-300"
                                  title="Deletar cupom"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </div>
             </div>
          )}
           </div>
         </main>

      {/* Modais */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black/95 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Gerar Novo Código</h3>
              <button
                onClick={() => setShowNewUserModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Nome do Usuário</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors"
                  placeholder="Digite o nome do usuário"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Plano</label>
                <select
                  value={newUserPlan}
                  onChange={(e) => setNewUserPlan(e.target.value as 'Básico' | 'Pro' | 'Premium')}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF3002] transition-colors"
                >
                  <option value="Básico">Básico - € 5/mês</option>
                  <option value="Pro">Pro - € 7/mês</option>
                  <option value="Premium">Premium - € 12/mês</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowNewUserModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={!newUserName.trim()}
                  className="flex-1 bg-gradient-to-r from-[#FF3002] to-[#FF6B47] hover:from-[#E02702] hover:to-[#FF3002] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all duration-300"
                >
                  Gerar Código
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreditsModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black/95 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {creditsAction === 'add' ? 'Adicionar' : 'Remover'} Créditos
              </h3>
              <button
                onClick={() => setShowCreditsModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Usuário:</span>
                  <span className="text-white font-medium">{selectedUser.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Créditos atuais:</span>
                  <span className="text-white font-bold">{selectedUser.credits}</span>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  {creditsAction === 'add' ? 'Quantidade a adicionar' : 'Quantidade a remover'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={creditsAction === 'remove' ? selectedUser.credits : 999}
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors"
                  placeholder="Digite a quantidade"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowCreditsModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={manageUserCredits}
                  disabled={creditsAmount < 1 || (creditsAction === 'remove' && creditsAmount > selectedUser.credits)}
                  className="flex-1 bg-gradient-to-r from-[#FF3002] to-[#FF6B47] hover:from-[#E02702] hover:to-[#FF3002] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all duration-300"
                >
                  {creditsAction === 'add' ? 'Adicionar' : 'Remover'} Créditos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black/95 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Criar Novo Cupom</h3>
              <button
                onClick={() => setShowNewCouponModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Nome do Influenciador</label>
                <input
                  type="text"
                  value={newCouponName}
                  onChange={(e) => setNewCouponName(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors"
                  placeholder="Digite o nome do influenciador"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Código do Cupom</label>
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors"
                  placeholder="Ex: INFLUENCER10"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Desconto para Cliente (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(parseInt(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors"
                  placeholder="Ex: 10"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Lucro para Influenciador (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newCouponProfit}
                  onChange={(e) => setNewCouponProfit(parseInt(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors"
                  placeholder="Ex: 5"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowNewCouponModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCoupon}
                  disabled={!newCouponName.trim() || !newCouponCode.trim()}
                  className="flex-1 bg-gradient-to-r from-[#FF3002] to-[#FF6B47] hover:from-[#E02702] hover:to-[#FF3002] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all duration-300"
                >
                  Criar Cupom
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black/95 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Editar Cupom</h3>
              <button
                onClick={() => setShowEditCouponModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Nome do Influenciador</label>
                <input
                  type="text"
                  value={newCouponName}
                  onChange={(e) => setNewCouponName(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors"
                  placeholder="Digite o nome do influenciador"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Código do Cupom</label>
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors"
                  placeholder="Ex: INFLUENCER10"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Desconto para Cliente (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(parseInt(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors"
                  placeholder="Ex: 10"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Lucro para Influenciador (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newCouponProfit}
                  onChange={(e) => setNewCouponProfit(parseInt(e.target.value) || 0)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors"
                  placeholder="Ex: 5"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowEditCouponModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditCoupon}
                  disabled={!newCouponName.trim() || !newCouponCode.trim()}
                  className="flex-1 bg-gradient-to-r from-[#FF3002] to-[#FF6B47] hover:from-[#E02702] hover:to-[#FF3002] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all duration-300"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCouponUsersModal && selectedCoupon && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black/95 border border-white/10 rounded-2xl p-8 w-full max-w-4xl shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                Usuários do Cupom: {selectedCoupon.name} ({selectedCoupon.code})
              </h3>
              <button
                onClick={() => setShowCouponUsersModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {(() => {
                const couponUsers = getCouponUsers(selectedCoupon.code);
                const totalProfit = couponUsers.reduce((sum, user) => sum + user.profitAmount, 0);
                
                return (
                  <>
                    <div className="bg-white/5 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Total de Usuários</p>
                        <p className="text-2xl font-bold text-white">{couponUsers.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Lucro Total</p>
                        <p className="text-2xl font-bold text-green-400">R$ {totalProfit.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Desconto</p>
                        <p className="text-2xl font-bold text-blue-400">{selectedCoupon.discountPercentage}%</p>
                      </div>
                    </div>

                    {couponUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">Nenhum usuário usou este cupom ainda.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-black/60">
                            <tr>
                              <th className="px-6 py-4 text-left text-white font-semibold">Nome</th>
                              <th className="px-6 py-4 text-left text-white font-semibold">Código</th>
                              <th className="px-6 py-4 text-left text-white font-semibold">Plano</th>
                              <th className="px-6 py-4 text-left text-white font-semibold">Valor Pago</th>
                              <th className="px-6 py-4 text-left text-white font-semibold">Lucro</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {couponUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">{user.name}</td>
                                <td className="px-6 py-4 text-gray-300 font-mono">{user.code}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    user.plan === 'Premium' 
                                      ? 'bg-purple-500/20 text-purple-400'
                                      : user.plan === 'Pro'
                                      ? 'bg-[#FF3002]/20 text-[#FF3002]'
                                      : 'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {user.plan}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-white font-semibold">R$ {user.planPrice}</td>
                                <td className="px-6 py-4 text-green-400 font-bold">R$ {user.profitAmount.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black/95 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Confirmar Ação</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-gray-300 text-center">{confirmMessage}</p>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-gradient-to-r from-[#FF3002] to-[#FF6B47] hover:from-[#E02702] hover:to-[#FF3002] text-white py-3 rounded-xl font-bold transition-all duration-300"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificação */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className={`rounded-xl p-4 shadow-2xl border backdrop-blur-xl max-w-sm ${
            notificationType === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-100'
              : notificationType === 'error'
              ? 'bg-red-500/20 border-red-500/30 text-red-100'
              : 'bg-blue-500/20 border-blue-500/30 text-blue-100'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                notificationType === 'success' 
                  ? 'bg-green-400'
                  : notificationType === 'error'
                  ? 'bg-red-400'
                  : 'bg-blue-400'
              }`}></div>
              <p className="font-medium">{notificationMessage}</p>
              <button
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-white transition-colors ml-auto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;