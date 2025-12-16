import React, { useState } from 'react';
import { usePoliceData } from '../context';
import { Key, Save, CheckCircle, AlertTriangle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser, updateUser } = usePoliceData();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (currentUser) {
      updateUser(currentUser.id, { password: newPassword });
      setSuccess('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-black">Minha Conta</h2>
        <p className="text-gray-900 font-medium">Gerencie suas informações de acesso.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6">
         <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
           <div className="bg-slate-900 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
             {currentUser?.name.charAt(0)}
           </div>
           <div>
             <h3 className="text-xl font-bold text-black">{currentUser?.name}</h3>
             <p className="text-gray-500 font-mono">{currentUser?.username}</p>
             <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">
               {currentUser?.role === 'admin' ? 'Administrador' : 'Operador'}
             </span>
           </div>
         </div>

         <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
           <Key className="w-5 h-5 text-blue-800" />
           Alterar Senha
         </h4>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nova Senha</label>
              <input 
                type="password"
                className="w-full p-2 border border-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-800"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar Nova Senha</label>
              <input 
                type="password"
                className="w-full p-2 border border-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-800"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-900 rounded-lg text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-100 text-green-900 rounded-lg text-sm font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {success}
              </div>
            )}

            <button
              type="submit"
              className="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-black transition-colors shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Atualizar Senha
            </button>
         </form>
      </div>
    </div>
  );
};