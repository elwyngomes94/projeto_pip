import React, { useState } from 'react';
import { usePoliceData } from '../context';
import { Plus, Trash2, FileText, Star } from 'lucide-react';

export const OccurrenceTypes: React.FC = () => {
  const { occurrenceTypes, addOccurrenceType, deleteOccurrenceType } = usePoliceData();
  const [name, setName] = useState('');
  const [points, setPoints] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !points) return;
    
    addOccurrenceType({
      name,
      points: parseInt(points, 10)
    });
    setName('');
    setPoints('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-black">Tipos de Ocorrência</h2>
          <p className="text-gray-900 font-medium">Definição de pontuações para o ranking operacional.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300 h-fit">
          <h3 className="text-lg font-black text-black mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-800" />
            Novo Tipo
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Descrição da Ocorrência</label>
              <input
                required
                type="text"
                placeholder="Ex: Apreensão de arma de fogo"
                className="w-full p-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-black placeholder-gray-500"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Pontuação</label>
              <input
                required
                type="number"
                min="1"
                placeholder="Ex: 10"
                className="w-full p-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-black placeholder-gray-500"
                value={points}
                onChange={e => setPoints(e.target.value)}
              />
              <p className="text-xs text-gray-600 font-medium mt-1">Pontos atribuídos ao policial por este registro.</p>
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Adicionar Regra
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-black font-black uppercase text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4 text-center">Pontos</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {occurrenceTypes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-600 font-medium">
                      Nenhum tipo de ocorrência cadastrado.
                    </td>
                  </tr>
                ) : (
                  occurrenceTypes.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded text-blue-900">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-black">{type.name}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-black bg-amber-100 text-amber-800 border border-amber-200">
                           <Star className="w-3 h-3 fill-amber-600 text-amber-600" />
                           {type.points}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteOccurrenceType(type.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
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
      </div>
    </div>
  );
};