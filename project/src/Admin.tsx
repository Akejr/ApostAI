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
  EyeOff
} from 'lucide-react';
import logo from './assets/logo.png';
import { supabase, DatabaseUser, AdminUser } from './lib/supabase';

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
}

interface DashboardStats {
  activeUsers: number;
  totalUsers: number;
  monthlyRevenue: number;
  totalAnalyses: number;
}

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Verificar se já está logado no localStorage
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      // Verificar se não expirou (24 horas)
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

  // Estados para dados do Supabase
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    activeUsers: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    totalAnalyses: 0
  });
  const [loading, setLoading] = useState(true);

  // Carregar dados do Supabase
  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
      loadDashboardStats();
    }
  }, [isAuthenticated]);

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

      // Converter dados do Supabase para o formato local
      const convertedUsers: User[] = data.map((dbUser: DatabaseUser) => ({
        id: dbUser.id,
        name: dbUser.name,
        code: dbUser.code,
        plan: dbUser.plan,
        credits: dbUser.credits,
        analyses: dbUser.analyses,
        status: dbUser.status,
        createdAt: dbUser.created_at,
        expiresAt: dbUser.expires_at
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
      // Carregar estatísticas do dashboard
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) {
        console.error('Erro ao carregar estatísticas:', usersError);
        return;
      }

      const activeUsers = usersData.filter((user: DatabaseUser) => user.status === 'active').length;
      const totalUsers = usersData.length;
      const totalAnalyses = usersData.reduce((sum: number, user: DatabaseUser) => sum + user.analyses, 0);

      // Calcular faturamento mensal baseado nos planos ativos
      const monthlyRevenue = usersData
        .filter((user: DatabaseUser) => user.status === 'active')
        .reduce((sum: number, user: DatabaseUser) => {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'ecasanovs' && password === 'aeiou123') {
      setIsAuthenticated(true);
      setLoginError('');
      
      // Salvar autenticação no localStorage
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
    
    // Remover autenticação do localStorage
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
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
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

      // Recarregar dados
      await loadUsers();
      await loadDashboardStats();
      
      setShowNewUserModal(false);
      setNewUserName('');
      setNewUserPlan('Básico');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newStatus = user.status === 'active' ? 'expired' : 'active';
      
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao alterar status:', error);
        return;
      }

      // Recarregar dados
      await loadUsers();
      await loadDashboardStats();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const renewUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const newCredits = user.plan === 'Básico' ? 7 : user.plan === 'Pro' ? 15 : 999;
      
      const { error } = await supabase
        .from('users')
        .update({ 
          status: 'active',
          credits: newCredits,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao renovar usuário:', error);
        return;
      }

      // Recarregar dados
      await loadUsers();
      await loadDashboardStats();
    } catch (error) {
      console.error('Erro ao renovar usuário:', error);
    }
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
          {/* Logo */}
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

          {/* Formulário de Login */}
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
      {/* Header */}
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

             {/* Navigation */}
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

             {/* Main Content */}
       <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="space-y-8">
           {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-[#FF3002]/30 transition-all duration-300">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-sm">Usuários Ativos</p>
                   <p className="text-3xl font-bold text-white">{dashboardStats.activeUsers}</p>
                 </div>
                 <div className="bg-green-500/20 p-3 rounded-xl">
                   <Users className="w-6 h-6 text-green-400" />
                 </div>
               </div>
             </div>

             <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-[#FF3002]/30 transition-all duration-300">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-sm">Total de Usuários</p>
                   <p className="text-3xl font-bold text-white">{dashboardStats.totalUsers}</p>
                 </div>
                 <div className="bg-blue-500/20 p-3 rounded-xl">
                   <User className="w-6 h-6 text-blue-400" />
                 </div>
               </div>
             </div>

             <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-[#FF3002]/30 transition-all duration-300">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-sm">Faturamento Mensal</p>
                   <p className="text-3xl font-bold text-white">R$ {dashboardStats.monthlyRevenue.toLocaleString()}</p>
                 </div>
                 <div className="bg-yellow-500/20 p-3 rounded-xl">
                   <DollarSign className="w-6 h-6 text-yellow-400" />
                 </div>
               </div>
             </div>

             <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-[#FF3002]/30 transition-all duration-300">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-400 text-sm">Análises Realizadas</p>
                   <p className="text-3xl font-bold text-white">{dashboardStats.totalAnalyses}</p>
                 </div>
                 <div className="bg-purple-500/20 p-3 rounded-xl">
                   <BarChart3 className="w-6 h-6 text-purple-400" />
                 </div>
               </div>
             </div>
           </div>

                        {/* Users Management Section */}
             <div className="space-y-6">
               {/* Header com Filtros */}
               <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                   <div className="flex items-center space-x-4">
                     <h2 className="text-2xl font-bold text-white">Gestão de Usuários</h2>
                     <span className="bg-[#FF3002]/20 text-[#FF3002] px-3 py-1 rounded-full text-sm font-medium">
                       {filteredUsers.length} usuários
                     </span>
                   </div>

                   <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                     {/* Search */}
                     <div className="relative">
                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                       <input
                         type="text"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         placeholder="Buscar por nome ou código..."
                         className="bg-black/60 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors w-full sm:w-64"
                       />
                     </div>

                     {/* Status Filter */}
                     <select
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'expired')}
                       className="bg-black/60 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF3002] transition-colors"
                     >
                       <option value="all">Todos os status</option>
                       <option value="active">Ativos</option>
                       <option value="expired">Expirados</option>
                     </select>
                   </div>
                 </div>
               </div>

               {/* Users Table */}
               <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                 {loading ? (
                   <div className="flex items-center justify-center py-12">
                     <div className="text-center">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF3002] mx-auto mb-4"></div>
                       <p className="text-gray-400">Carregando usuários...</p>
                     </div>
                   </div>
                 ) : (
                   <div className="overflow-x-auto">
                     <table className="w-full">
                       <thead className="bg-black/60">
                         <tr>
                           <th className="px-6 py-4 text-left text-white font-semibold">Nome</th>
                           <th className="px-6 py-4 text-left text-white font-semibold">Código</th>
                           <th className="px-6 py-4 text-left text-white font-semibold">Plano</th>
                           <th className="px-6 py-4 text-left text-white font-semibold">Créditos</th>
                           <th className="px-6 py-4 text-left text-white font-semibold">Análises</th>
                           <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                           <th className="px-6 py-4 text-left text-white font-semibold">Expira em</th>
                           <th className="px-6 py-4 text-left text-white font-semibold">Ações</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/10">
                         {filteredUsers.map((user) => (
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
                             <td className="px-6 py-4 text-white">{user.credits}</td>
                             <td className="px-6 py-4 text-white">{user.analyses}</td>
                             <td className="px-6 py-4">
                               <span className={`flex items-center space-x-2 ${
                                 user.status === 'active' 
                                   ? 'text-green-400' 
                                   : 'text-red-400'
                               }`}>
                                 {user.status === 'active' ? (
                                   <CheckCircle className="w-4 h-4" />
                                 ) : (
                                   <AlertCircle className="w-4 h-4" />
                                 )}
                                 <span className="text-sm font-medium">
                                   {user.status === 'active' ? 'Ativo' : 'Expirado'}
                                 </span>
                               </span>
                             </td>
                             <td className="px-6 py-4 text-gray-300 text-sm">
                               {new Date(user.expiresAt).toLocaleDateString('pt-BR')}
                             </td>
                             <td className="px-6 py-4">
                               <div className="flex items-center space-x-2">
                                 {user.status === 'active' ? (
                                   <button
                                     onClick={() => toggleUserStatus(user.id)}
                                     className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1 rounded-lg text-sm transition-all duration-300"
                                   >
                                     Cancelar
                                   </button>
                                 ) : (
                                   <button
                                     onClick={() => renewUser(user.id)}
                                     className="bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 px-3 py-1 rounded-lg text-sm transition-all duration-300"
                                   >
                                     Renovar
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
           </div>
         </main>

      {/* Modal Novo Usuário */}
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
                  <option value="Básico">Básico - R$ 35/mês</option>
                  <option value="Pro">Pro - R$ 45/mês</option>
                  <option value="Premium">Premium - R$ 99/mês</option>
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
    </div>
  );
};

export default Admin;
