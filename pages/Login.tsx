import React, { useState } from 'react';
import { usePoliceData } from '../context';
import { Shield, Lock, User } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = usePoliceData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (!success) {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="bg-blue-900 p-8 text-center">
          <div className="inline-flex p-4 bg-white/10 rounded-full mb-4 ring-4 ring-white/20">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">9ª CIPM</h1>
          <p className="text-blue-200 font-medium">Sistema de Gestão Operacional</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Usuário</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-gray-900 font-medium"
                  placeholder="Seu usuário de acesso"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none transition-all text-gray-900 font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-800 text-sm font-bold rounded-lg text-center border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              ACESSAR SISTEMA
            </button>
          </form>

          <div className="mt-8 text-center">
             <p className="text-xs text-gray-500 font-medium">
               &copy; {new Date().getFullYear()} Polícia Militar de Pernambuco
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};