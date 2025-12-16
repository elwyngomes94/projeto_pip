import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, ClipboardList, Shield, LogOut, UserCog, UserCircle, Gavel } from 'lucide-react';
import { usePoliceData } from '../context';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout, currentUser } = usePoliceData();
  const navigate = useNavigate();

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
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-lg z-10">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold tracking-wider">9ª CIPM</h1>
            <p className="text-xs text-slate-400">Polícia Militar</p>
          </div>
        </div>
        
        {/* User Info */}
        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
           <div className="flex justify-between items-center mb-1">
             <p className="text-sm font-bold text-white truncate max-w-[140px]">{currentUser?.name}</p>
             <NavLink to="/minha-conta" title="Minha Conta">
               <UserCircle className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
             </NavLink>
           </div>
           <p className="text-xs text-blue-300 uppercase font-bold">{currentUser?.role === 'admin' ? 'Administrador' : 'Operador (Visualização)'}</p>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
           <button 
             onClick={handleLogout}
             className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors font-bold"
           >
             <LogOut className="w-5 h-5" />
             <span>Sair do Sistema</span>
           </button>
           <div className="mt-4 text-xs text-slate-600 text-center">
             &copy; {new Date().getFullYear()} Sistema 9ª CIPM
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};