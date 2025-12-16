import React, { useState } from 'react';
import { usePoliceData } from '../context';
import { Shield, Lock, User, ChevronRight, Star } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = usePoliceData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Fake loading for effect
    setTimeout(() => {
        const success = login(username, password);
        if (!success) {
          setError('Usuário ou senha inválidos.');
          setIsLoading(false);
        }
        // If success, the app router will handle the redirect automatically via context change
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            
            <div className="inline-flex p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-4 shadow-lg ring-1 ring-white/30 animate-fade-in delay-100">
              <Shield className="w-14 h-14 text-white drop-shadow-md" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-wider mb-1 animate-slide-up delay-200">9ª CIPM</h1>
            <div className="flex items-center justify-center gap-2 text-blue-200 text-sm font-semibold tracking-wide uppercase animate-slide-up delay-300">
               <Star className="w-3 h-3 fill-blue-200" />
               Sistema de Gestão
               <Star className="w-3 h-3 fill-blue-200" />
            </div>
          </div>
          
          {/* Form */}
          <div className="p-8 pt-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group animate-slide-in-right delay-100">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider group-focus-within:text-blue-700 transition-colors">Usuário</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-300 sm:text-sm font-semibold text-gray-900 input-animated"
                    placeholder="Identificação"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="group animate-slide-in-right delay-200">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider group-focus-within:text-blue-700 transition-colors">Senha</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all duration-300 sm:text-sm font-semibold text-gray-900 input-animated"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center border border-red-100 animate-fade-in flex items-center justify-center gap-2">
                   <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                   {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed btn-interactive animate-slide-up delay-300"
              >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        ACESSAR SISTEMA
                        <ChevronRight className="w-4 h-4" />
                    </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center animate-fade-in delay-500">
               <p className="text-xs text-gray-400 font-medium">
                 &copy; {new Date().getFullYear()} Polícia Militar de Pernambuco
               </p>
               <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest">Servir e Proteger</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};