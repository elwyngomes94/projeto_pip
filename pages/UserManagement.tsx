import React, { useState } from 'react';
import { usePoliceData } from '../context';
import { UserPlus, Trash2, Shield, User, Lock, Save, X } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { users, addUser, deleteUser, currentUser } = usePoliceData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(formData);
    setFormData({ name: '', username: '', password: '', role: 'user' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-black">Gerenciar Usuários</h2>
          <p className="text-gray-900 font-medium">Controle de acesso ao sistema (Apenas Administradores).</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-800 hover:bg-blue-900 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-bold shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-black font-black uppercase text-xs border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Nível de Acesso</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-black flex items-center gap-2">
                  <div className={`p-1.5 rounded-full ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'}`}>
                    {user.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  {user.name}
                </td>
                <td className="px-6 py-4 font-mono text-gray-700 font-medium">{user.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                    user.role === 'admin' 
                      ? 'bg-blue-100 text-blue-900 border-blue-200' 
                      : 'bg-green-100 text-green-900 border-green-200'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Operador'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.id !== currentUser?.id && user.username !== 'elwyn.gomes' && (
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1"
                      title="Remover Usuário"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-black">Cadastrar Usuário</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Nome Completo</label>
                <input
                  required
                  type="text"
                  className="w-full p-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-black"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Usuário de Acesso</label>
                    <input
                      required
                      type="text"
                      className="w-full p-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-black"
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">Senha</label>
                    <input
                      required
                      type="text"
                      className="w-full p-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-black"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">Nível de Permissão</label>
                <select
                  required
                  className="w-full p-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-black bg-white"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as 'admin' | 'user'})}
                >
                  <option value="user">Operador (Acesso Comum)</option>
                  <option value="admin">Administrador (Acesso Total)</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-black font-bold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-900 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};