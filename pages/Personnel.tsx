import React, { useState } from 'react';
import { usePoliceData } from '../context';
import { Plus, Trash2, Search, UserPlus } from 'lucide-react';

export const Personnel: React.FC = () => {
  const { officers, addOfficer, deleteOfficer } = usePoliceData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    warName: '',
    rank: '',
    matricula: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOfficer(formData);
    setFormData({ fullName: '', warName: '', rank: '', matricula: '' });
    setIsModalOpen(false);
  };

  const filteredOfficers = officers.filter(o => 
    o.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.warName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.matricula.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-black">Pecúlio (Efetivo)</h2>
          <p className="text-gray-900 font-medium">Gerenciamento do efetivo da 9ª Companhia.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-800 hover:bg-blue-900 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-bold shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          Novo Policial
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-300">
        <div className="p-4 border-b border-gray-300">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, guerra ou matrícula..."
              className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none transition-all text-black font-medium placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-black font-black uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Nome de Guerra</th>
                <th className="px-6 py-4">Posto/Graduação</th>
                <th className="px-6 py-4">Nome Completo</th>
                <th className="px-6 py-4">Matrícula</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOfficers.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-gray-600 font-medium">
                     Nenhum policial encontrado.
                   </td>
                 </tr>
              ) : (
                filteredOfficers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-black">{officer.warName}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-200 text-black px-2 py-1 rounded text-xs font-bold border border-gray-300">
                        {officer.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-black font-medium">{officer.fullName}</td>
                    <td className="px-6 py-4 font-mono text-black font-medium">{officer.matricula}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteOfficer(officer.id)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                        title="Remover"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-black text-black">Cadastrar Policial</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Posto / Graduação</label>
                <select
                  required
                  className="w-full p-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-black bg-white"
                  value={formData.rank}
                  onChange={e => setFormData({...formData, rank: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  <option value="CEL">Coronel (CEL)</option>
                  <option value="TEN.CEL">Tenente Coronel (TEN.CEL)</option>
                  <option value="MAJ">Major (MAJ)</option>
                  <option value="CAP">Capitão (CAP)</option>
                  <option value="1º TEN">1º Tenente (1º TEN)</option>
                  <option value="2º TEN">2º Tenente (2º TEN)</option>
                  <option value="ASP">Aspirante (ASP)</option>
                  <option value="ST">Subtenente (ST)</option>
                  <option value="1º SGT">1º Sargento (1º SGT)</option>
                  <option value="2º SGT">2º Sargento (2º SGT)</option>
                  <option value="3º SGT">3º Sargento (3º SGT)</option>
                  <option value="CB">Cabo (CB)</option>
                  <option value="SD">Soldado (SD)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Nome de Guerra</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Cb Oliveira"
                  className="w-full p-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-black placeholder-gray-500"
                  value={formData.warName}
                  onChange={e => setFormData({...formData, warName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Nome Completo</label>
                <input
                  required
                  type="text"
                  className="w-full p-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-black"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1">Matrícula</label>
                <input
                  required
                  type="text"
                  className="w-full p-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-black"
                  value={formData.matricula}
                  onChange={e => setFormData({...formData, matricula: e.target.value})}
                />
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
                  className="flex-1 px-4 py-2 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-900 transition-colors shadow-sm"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};