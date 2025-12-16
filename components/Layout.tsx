import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, ClipboardList, Shield, LogOut, UserCog, UserCircle, Gavel, Menu, X, ChevronRight } from 'lucide-react';
import { usePoliceData } from '../context';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout, currentUser } = usePoliceData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define all navigation items with allowed roles
  const allNavItems = [
    { 
      to: '/', 
      icon: LayoutDashboard, 
      label: 'Painel Geral', 
      roles: ['admin', 'user'] 
    },
    { 
      to: '/peculio', 
      icon: Users, 
      label: 'Pecúlio (Efetivo)', 
      roles: ['admin'] // Restricted to Admin
    },
    { 
      to: '/tipos', 
      icon: FileText, 
      label: 'Tipos de Ocorrência', 
      roles: ['admin'] // Restricted to Admin
    },
    { 
      to: '/registro', 
      icon: ClipboardList, 
      label: 'Registro de Ocorrências', 
      roles: ['admin'] // Restricted to Admin
    },
    { 
      to: '/contestacoes', 
      icon: Gavel, 
      label: 'Contestações', 
      roles: ['admin', 'user'] 
    },
    { 
      to: '/usuarios', 
      icon: UserCog, 
      label: 'Usuários', 
      roles: ['admin'] // Restricted to Admin
    },
  ];

  // Filter items based on current user role
  const visibleNavItems = allNavItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-40 flex items-center justify-between px-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-1.5 rounded-lg">
             <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <span className="font-bold text-lg tracking-wider">9ª CIPM</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-white hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay for Mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col shadow-2xl
          transition-transform duration-300 ease-out lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50 bg-slate-900/50">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 rounded-full"></div>
                <Shield className="w-9 h-9 text-blue-400 relative z-10 drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider leading-none">9ª CIPM</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">Polícia Militar</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* User Card */}
        <div className="px-4 py-6">
           <NavLink 
               to="/minha-conta" 
               onClick={() => setIsMobileOpen(false)}
               className="block group"
           >
             <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 group-hover:border-blue-700/50 group-hover:bg-slate-800 transition-all duration-300 card-hover">
               <div className="flex items-center gap-3 mb-2">
                 <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {currentUser?.name.charAt(0)}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
                   <p className="text-[10px] text-blue-300 uppercase font-bold tracking-wide">{currentUser?.role === 'admin' ? 'Administrador' : 'Operador'}</p>
                 </div>
               </div>
               <div className="flex items-center justify-between text-xs text-slate-400 group-hover:text-white transition-colors mt-2 pt-2 border-t border-slate-700/50">
                  <span>Minha Conta</span>
                  <UserCircle className="w-4 h-4" />
               </div>
             </div>
           </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {visibleNavItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 relative z-10">
                    <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 animate-slide-in-right opacity-50" />}
                  
                  {/* Hover effect background */}
                  {!isActive && (
                      <div className="absolute inset-0 bg-slate-800 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 z-0 opacity-50 rounded-xl" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
           <button 
             onClick={handleLogout}
             className="group flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-300 font-bold text-sm"
           >
             <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
             <span>Sair do Sistema</span>
           </button>
           <div className="mt-4 text-[10px] text-slate-600 text-center font-medium tracking-wide">
             SISTEMA DE GESTÃO &copy; {new Date().getFullYear()}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#f0f2f5] p-4 md:p-8 pt-20 lg:pt-8 w-full relative">
        <div className="max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};