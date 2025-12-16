import React, { useState, useMemo } from 'react';
import { usePoliceData } from '../context';
import { CheckCircle, ClipboardList, Trash2, Clock, Search, X, Download, Save, Edit2, Filter, FileText, MessageCircle, Share2, Calculator } from 'lucide-react';
import { OccurrenceLog } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const OccurrenceRegister: React.FC = () => {
  const { officers, occurrenceTypes, logs, addLog, deleteLog, updateLog, occurrenceTypes: typesList, officers: officersList } = usePoliceData();
  
  // --- Form State (Create) ---
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [boeNumber, setBoeNumber] = useState('');
  const [factor, setFactor] = useState('1'); // Default factor is 1
  
  // Selection State (Create)
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>([]);
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  
  // Search State (Create)
  const [officerSearch, setOfficerSearch] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');

  // --- Filtering State ---
  const [filterText, setFilterText] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // --- Editing State ---
  const [editingLog, setEditingLog] = useState<OccurrenceLog | null>(null);

  // Computed Lists for Form
  const availableOfficers = officers.filter(
    o => !selectedOfficerIds.includes(o.id) && 
    (o.warName.toLowerCase().includes(officerSearch.toLowerCase()) || 
     o.fullName.toLowerCase().includes(officerSearch.toLowerCase()) || 
     o.matricula.includes(officerSearch))
  ).slice(0, 5); // Limit suggestions

  // Sort and Filter logs
  const filteredAndSortedLogs = useMemo(() => {
    let result = [...logs];

    // Filter by Date
    if (filterDate) {
      result = result.filter(log => log.date === filterDate);
    }

    // Filter by Text (Officer Name, BOE, Type)
    if (filterText) {
      const lowerText = filterText.toLowerCase();
      result = result.filter(log => {
        const officer = officers.find(o => o.id === log.officerId);
        const type = occurrenceTypes.find(t => t.id === log.typeId);
        const boe = log.boeNumber || '';
        
        return (
          boe.toLowerCase().includes(lowerText) ||
          (officer && officer.warName.toLowerCase().includes(lowerText)) ||
          (officer && officer.fullName.toLowerCase().includes(lowerText)) ||
          (type && type.name.toLowerCase().includes(lowerText))
        );
      });
    }

    // Sort: Date Descending, then Timestamp Descending
    return result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return b.timestamp - a.timestamp;
    });
  }, [logs, filterDate, filterText, officers, occurrenceTypes]);

  // Handlers for Create Form
  const addOfficer = (id: string) => {
    setSelectedOfficerIds(prev => [...prev, id]);
    setOfficerSearch('');
  };

  const removeOfficer = (id: string) => {
    setSelectedOfficerIds(prev => prev.filter(oid => oid !== id));
  };

  const toggleType = (id: string) => {
    setSelectedTypeIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOfficerIds.length === 0 || selectedTypeIds.length === 0 || !boeNumber || !date) return;

    const multiplier = parseFloat(factor) || 1;

    selectedOfficerIds.forEach(officerId => {
      selectedTypeIds.forEach(typeId => {
        addLog(officerId, typeId, date, boeNumber, multiplier);
      });
    });

    setSuccessMsg('Ocorrência registrada e salva com sucesso!');
    setTimeout(() => setSuccessMsg(''), 3000);
    
    setSelectedOfficerIds([]);
    setSelectedTypeIds([]);
    setBoeNumber('');
    setFactor('1');
  };

  // Handlers for Edit Modal
  const handleEditClick = (log: OccurrenceLog) => {
    setEditingLog(log);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;
    updateLog(editingLog.id, {
      date: editingLog.date,
      boeNumber: editingLog.boeNumber,
      officerId: editingLog.officerId,
      typeId: editingLog.typeId,
      multiplicationFactor: editingLog.multiplicationFactor || 1
    });
    setEditingLog(null);
  };

  const handleExportBackup = () => {
    const data = {
      officers: officersList,
      types: typesList,
      logs: logs,
      backupDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_cipm_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Export Reports Logic ---

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Black
    doc.text('9ª CIPM - Relatório de Produtividade Operacional', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28);
    if (filterDate) {
      doc.text(`Filtro de Data: ${new Date(filterDate).toLocaleDateString('pt-BR')}`, 14, 34);
    }
    
    // Table Data
    const tableData = filteredAndSortedLogs.map(log => {
      const officer = officers.find(o => o.id === log.officerId);
      const type = occurrenceTypes.find(t => t.id === log.typeId);
      const factor = log.multiplicationFactor ?? 1;
      const points = type ? (type.points * factor) : 0;
      
      return [
        new Date(log.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
        log.boeNumber || '-',
        officer ? `${officer.rank} ${officer.warName}` : 'N/A',
        type ? type.name : 'N/A',
        factor !== 1 ? `${points} (x${factor})` : `${points}`
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [['Data', 'B.O.E', 'Policial', 'Natureza', 'Pts']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }, // Black Header
      styles: { fontSize: 9, textColor: [0, 0, 0] }, // Black Text
      columnStyles: {
        0: { cellWidth: 25 }, // Data
        1: { cellWidth: 30 }, // BOE
        2: { cellWidth: 50 }, // Policial
        3: { cellWidth: 'auto' }, // Natureza
        4: { cellWidth: 25, halign: 'center' }, // Pts
      }
    });

    doc.save(`relatorio_cipm_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportWhatsApp = () => {
    let message = `*🚨 9ª CIPM - RELATÓRIO DE OCORRÊNCIAS 🚨*\n`;
    message += `📅 Gerado em: ${new Date().toLocaleDateString('pt-BR')}\n`;
    if (filterDate) message += `📅 Ref. Data: ${new Date(filterDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}\n`;
    message += `------------------------------------\n\n`;

    filteredAndSortedLogs.forEach(log => {
      const officer = officers.find(o => o.id === log.officerId);
      const type = occurrenceTypes.find(t => t.id === log.typeId);
      const dateStr = new Date(log.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
      const factor = log.multiplicationFactor ?? 1;
      const points = type ? type.points * factor : 0;

      message += `📌 *B.O.E:* ${log.boeNumber || 'S/N'}\n`;
      message += `🗓 *Data:* ${dateStr}\n`;
      message += `👮 *Policial:* ${officer?.rank} ${officer?.warName}\n`;
      message += `📝 *Fato:* ${type?.name} (+${points})${factor !== 1 ? ` [x${factor}]` : ''}\n`;
      message += `....................................\n`;
    });

    // Count summary
    message += `\n📊 *Total de Registros:* ${filteredAndSortedLogs.length}`;

    navigator.clipboard.writeText(message)
      .then(() => {
        setSuccessMsg('Relatório copiado para o WhatsApp!');
        setTimeout(() => setSuccessMsg(''), 3000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setSuccessMsg('Erro ao copiar relatório.');
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-black">Registro de Ocorrências</h2>
          <p className="text-gray-900 font-medium">Lance as ocorrências para pontuar os policiais. Os dados são salvos automaticamente.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           {/* Report Buttons */}
           <div className="bg-white p-1 rounded-lg border border-gray-300 flex items-center shadow-sm">
              <span className="text-xs font-bold text-gray-500 px-2 uppercase hidden sm:inline">Relatórios:</span>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-900 hover:bg-red-200 rounded text-sm font-bold transition-colors"
                title="Baixar PDF"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button
                onClick={handleExportWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-900 hover:bg-green-200 rounded text-sm font-bold transition-colors"
                title="Copiar para WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
           </div>

           <div className="w-px h-8 bg-gray-300 mx-2 hidden xl:block"></div>

           <button
            onClick={handleExportBackup}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-colors"
            title="Baixar cópia de segurança dos dados"
          >
            <Download className="w-4 h-4" />
            Backup Geral
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200 relative">
            <h3 className="text-lg font-black text-black mb-6 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-800" />
              Nova Ocorrência
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Data e BOE */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Data da Ocorrência</label>
                  <input 
                    type="date"
                    required
                    className="w-full p-2 bg-gray-50 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-sm text-black font-medium"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Nº B.O.E</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: 2024.123"
                    className="w-full p-2 bg-gray-50 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-sm text-black placeholder-gray-500"
                    value={boeNumber}
                    onChange={e => setBoeNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* Policiais */}
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Policiais Envolvidos</label>
                
                {/* Search Input */}
                <div className="relative mb-2">
                   <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                   <input 
                     type="text"
                     placeholder="Buscar policial..."
                     className="w-full pl-9 p-2 bg-gray-50 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-sm text-black placeholder-gray-500"
                     value={officerSearch}
                     onChange={e => setOfficerSearch(e.target.value)}
                   />
                   {officerSearch && availableOfficers.length > 0 && (
                     <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 shadow-lg rounded-b-lg mt-1 z-20 max-h-40 overflow-auto">
                       {availableOfficers.map(officer => (
                         <button
                           key={officer.id}
                           type="button"
                           onClick={() => addOfficer(officer.id)}
                           className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm flex justify-between items-center group text-black"
                         >
                           <span className="font-bold text-black">{officer.warName}</span>
                           <span className="text-xs text-gray-600 font-bold group-hover:text-blue-800">{officer.rank}</span>
                         </button>
                       ))}
                     </div>
                   )}
                </div>

                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  {selectedOfficerIds.length === 0 && (
                    <span className="text-xs text-gray-500 font-medium w-full text-center py-2">Nenhum policial selecionado</span>
                  )}
                  {selectedOfficerIds.map(id => {
                    const off = officers.find(o => o.id === id);
                    if (!off) return null;
                    return (
                      <span key={id} className="bg-white border border-blue-300 text-blue-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        {off.warName}
                        <button type="button" onClick={() => removeOfficer(id)} className="text-blue-400 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>

              {/* Fator Multiplicador */}
              <div>
                 <label className="block text-xs font-bold text-black uppercase mb-1 flex items-center gap-1">
                   <Calculator className="w-3 h-3" />
                   Fator Multiplicador
                 </label>
                 <div className="relative">
                   <input 
                     type="number"
                     step="0.01"
                     min="0.1"
                     required
                     className="w-full p-2 bg-gray-50 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none text-sm text-black font-medium"
                     value={factor}
                     onChange={e => setFactor(e.target.value)}
                   />
                   <span className="absolute right-3 top-2 text-xs text-gray-500 font-bold pointer-events-none">
                     (Padrão: 1)
                   </span>
                 </div>
              </div>

              {/* Tipos de Ocorrência */}
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-2">Naturezas / Tipos</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {occurrenceTypes.map(type => {
                    const isSelected = selectedTypeIds.includes(type.id);
                    const currentFactor = parseFloat(factor) || 1;
                    const calculatedPoints = type.points * currentFactor;
                    return (
                      <div 
                        key={type.id}
                        onClick={() => toggleType(type.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${
                          isSelected 
                            ? 'bg-blue-800 border-blue-800 text-white shadow-md' 
                            : 'bg-white border-gray-300 text-gray-800 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <span className="text-sm font-bold">{type.name}</span>
                        <div className="flex flex-col items-end">
                           <span className={`text-xs font-black px-2 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                             {currentFactor !== 1 ? `${calculatedPoints.toFixed(0)}` : `+${type.points}`}
                           </span>
                           {currentFactor !== 1 && (
                             <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                               ({type.points} x {currentFactor})
                             </span>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={selectedOfficerIds.length === 0 || selectedTypeIds.length === 0 || !boeNumber}
                className="w-full bg-slate-900 hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all shadow-md active:scale-95 flex justify-center items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Registrar Ocorrência
              </button>

              {successMsg && (
                <div className="p-3 bg-green-100 text-green-900 border border-green-300 rounded-lg flex items-center gap-2 animate-fade-in text-sm font-bold">
                  <CheckCircle className="w-4 h-4" />
                  {successMsg}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* History Log */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 flex flex-col h-full">
             <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col">
                  <h3 className="font-black text-black flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    Histórico de Registros
                  </h3>
                  <span className="text-xs text-gray-700 font-bold">
                    {filteredAndSortedLogs.length} registro(s) encontrado(s)
                  </span>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                   <div className="relative">
                     <Search className="absolute left-2.5 top-2.5 text-gray-500 w-3.5 h-3.5" />
                     <input
                       type="text"
                       placeholder="Filtrar por nome, BOE..."
                       className="pl-8 p-2 border border-gray-300 rounded-lg text-xs w-full sm:w-48 focus:ring-1 focus:ring-blue-800 outline-none text-black font-medium placeholder-gray-500"
                       value={filterText}
                       onChange={e => setFilterText(e.target.value)}
                     />
                   </div>
                   <div className="relative">
                     <Filter className="absolute left-2.5 top-2.5 text-gray-500 w-3.5 h-3.5" />
                     <input
                       type="date"
                       className="pl-8 p-2 border border-gray-300 rounded-lg text-xs w-full sm:w-auto focus:ring-1 focus:ring-blue-800 outline-none text-black font-medium"
                       value={filterDate}
                       onChange={e => setFilterDate(e.target.value)}
                     />
                   </div>
                   {(filterText || filterDate) && (
                     <button 
                       onClick={() => { setFilterText(''); setFilterDate(''); }}
                       className="text-red-600 text-xs hover:bg-red-50 px-2 py-1 rounded transition-colors font-bold"
                     >
                       Limpar
                     </button>
                   )}
                </div>
             </div>
             
             <div className="flex-1 overflow-auto max-h-[600px]">
               {filteredAndSortedLogs.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8">
                   <ClipboardList className="w-12 h-12 mb-2 opacity-20" />
                   <p className="font-medium">Nenhum registro encontrado.</p>
                 </div>
               ) : (
                 <table className="w-full text-left text-sm">
                   <thead className="bg-gray-100 sticky top-0 text-black font-black uppercase text-xs z-10 border-b border-gray-200">
                     <tr>
                       <th className="px-6 py-3">Data</th>
                       <th className="px-6 py-3">B.O.E</th>
                       <th className="px-6 py-3">Policial</th>
                       <th className="px-6 py-3">Ocorrência</th>
                       <th className="px-6 py-3 text-right">Ação</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200">
                     {filteredAndSortedLogs.map(log => {
                       const officer = officers.find(o => o.id === log.officerId);
                       const type = occurrenceTypes.find(t => t.id === log.typeId);
                       if (!officer || !type) return null;

                       const factor = log.multiplicationFactor ?? 1;
                       const totalPoints = type.points * factor;

                       return (
                         <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-3 text-black whitespace-nowrap font-mono text-xs font-bold">
                             {new Date(log.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                           </td>
                           <td className="px-6 py-3 text-black font-bold font-mono text-xs">
                             {log.boeNumber || '-'}
                           </td>
                           <td className="px-6 py-3 font-bold text-black">
                             {officer.warName} <span className="text-gray-600 text-xs font-bold">({officer.rank})</span>
                           </td>
                           <td className="px-6 py-3">
                             <div className="flex flex-col">
                               <span className="font-bold text-xs text-black">{type.name}</span>
                               <span className="text-xs text-blue-800 font-bold mt-0.5">
                                 {totalPoints} pts
                                 {factor !== 1 && <span className="text-gray-500 font-normal ml-1">(Base: {type.points} x {factor})</span>}
                               </span>
                             </div>
                           </td>
                           <td className="px-6 py-3 text-right">
                             <div className="flex justify-end gap-1">
                               <button
                                 onClick={() => handleEditClick(log)}
                                 className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                                 title="Editar"
                               >
                                 <Edit2 className="w-4 h-4" />
                               </button>
                               <button
                                 onClick={() => deleteLog(log.id)}
                                 className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                 title="Excluir"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-black">Editar Ocorrência</h3>
              <button onClick={() => setEditingLog(null)} className="text-gray-500 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Data</label>
                <input
                  type="date"
                  required
                  className="w-full p-2 border border-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-800 text-black font-medium"
                  value={editingLog.date}
                  onChange={e => setEditingLog({...editingLog, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Nº B.O.E</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-800 text-black font-medium"
                  value={editingLog.boeNumber}
                  onChange={e => setEditingLog({...editingLog, boeNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Fator Multiplicador</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  className="w-full p-2 border border-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-800 text-black font-medium"
                  value={editingLog.multiplicationFactor ?? 1}
                  onChange={e => setEditingLog({...editingLog, multiplicationFactor: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Policial</label>
                <select
                  className="w-full p-2 border border-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-800 text-sm text-black font-medium"
                  value={editingLog.officerId}
                  onChange={e => setEditingLog({...editingLog, officerId: e.target.value})}
                >
                   {officers.map(o => (
                     <option key={o.id} value={o.id}>{o.warName} ({o.rank})</option>
                   ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Tipo de Ocorrência</label>
                <select
                  className="w-full p-2 border border-gray-400 rounded-lg outline-none focus:ring-2 focus:ring-blue-800 text-sm text-black font-medium"
                  value={editingLog.typeId}
                  onChange={e => setEditingLog({...editingLog, typeId: e.target.value})}
                >
                   {occurrenceTypes.map(t => (
                     <option key={t.id} value={t.id}>{t.name} (+{t.points})</option>
                   ))}
                </select>
              </div>

              <div className="flex gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-black font-bold rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-900 transition-colors shadow-sm"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};