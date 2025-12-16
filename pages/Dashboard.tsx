import React, { useState, useMemo } from 'react';
import { usePoliceData } from '../context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, TrendingUp, AlertTriangle, Filter, X, FileText, MessageCircle, CheckCircle, Calendar, User, Shield, AlertCircle, Send } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OccurrenceLog } from '../types';

export const Dashboard: React.FC = () => {
  const { getRanking, logs, occurrenceTypes, officers, currentUser } = usePoliceData();
  
  // Filter State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeFilter, setActiveFilter] = useState('geral'); // geral, hoje, mes, ano, custom
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [selectedOfficerId, setSelectedOfficerId] = useState<string | null>(null);

  // Quick Filter Helpers
  const setFilterToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setActiveFilter('hoje');
  };

  const setFilterMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
    setActiveFilter('mes');
  };

  const setFilterYear = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
    setActiveFilter('ano');
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setActiveFilter('geral');
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setActiveFilter('custom');
  };

  // Get filtered ranking
  const ranking = getRanking(startDate, endDate);

  // Prepare Data for Charts
  const topOfficers = ranking.slice(0, 5).filter(o => o.totalPoints > 0);
  
  // Calculate distribution
  const filteredLogs = logs.filter(log => {
    if (startDate && log.date < startDate) return false;
    if (endDate && log.date > endDate) return false;
    return true;
  });

  const typeDistribution = occurrenceTypes.map(type => {
    const count = filteredLogs.filter(log => log.typeId === type.id).length;
    return { name: type.name, count };
  }).filter(item => item.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-900 shadow-lg rounded-lg">
          <p className="font-bold text-black">{label}</p>
          <p className="text-blue-800 font-bold">{`${payload[0].value} pontos`}</p>
        </div>
      );
    }
    return null;
  };

  // --- Logic for Selected Officer Modal ---
  const selectedOfficerDetails = useMemo(() => {
    if (!selectedOfficerId) return null;
    
    const officer = officers.find(o => o.id === selectedOfficerId);
    if (!officer) return null;

    // Filter logs specific to this officer and the current date range
    const officerLogs = logs.filter(log => {
      if (log.officerId !== selectedOfficerId) return false;
      if (startDate && log.date < startDate) return false;
      if (endDate && log.date > endDate) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalPoints = officerLogs.reduce((acc, log) => {
      const type = occurrenceTypes.find(t => t.id === log.typeId);
      const factor = log.multiplicationFactor ?? 1;
      return acc + (type ? (type.points * factor) : 0);
    }, 0);

    return {
      officer,
      logs: officerLogs,
      totalPoints,
      totalOccurrences: officerLogs.length
    };
  }, [selectedOfficerId, logs, officers, occurrenceTypes, startDate, endDate]);


  // --- Export Logic ---

  const handleExportRankingPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Black
    doc.text('9ª CIPM - Ranking de Produtividade', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28);
    
    let filterText = 'Período: Geral (Todo o histórico)';
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'Início';
      const end = endDate ? new Date(endDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'Hoje';
      filterText = `Período: ${start} até ${end}`;
    }
    doc.text(filterText, 14, 34);
    
    // Table Data
    const tableData = ranking.map((officer, index) => [
      index + 1,
      `${officer.rank} ${officer.warName}`,
      officer.occurrencesCount,
      officer.totalPoints
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Pos', 'Policial', 'Ocorrências', 'Pontos']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }, // Black Header
      styles: { fontSize: 10, textColor: [0, 0, 0] }, // Black Text
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' }, 
        1: { cellWidth: 'auto' }, 
        2: { cellWidth: 30, halign: 'center' }, 
        3: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }, 
      }
    });

    doc.save(`ranking_cipm_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportRankingWhatsApp = () => {
    let message = `*🏆 9ª CIPM - RANKING OPERACIONAL 🏆*\n`;
    
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'Início';
      const end = endDate ? new Date(endDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'Hoje';
      message += `📅 Período: ${start} a ${end}\n`;
    } else {
      message += `📅 Período: Geral\n`;
    }
    message += `--------------------------------\n\n`;

    const list = ranking.slice(0, 20); 

    list.forEach((officer, index) => {
      let medal = '';
      if (index === 0) medal = '🥇 ';
      else if (index === 1) medal = '🥈 ';
      else if (index === 2) medal = '🥉 ';
      else medal = `${index + 1}º `;

      message += `${medal}*${officer.warName}* (${officer.rank})\n`;
      message += `   📊 Ocorrências: ${officer.occurrencesCount} | ⭐ Pontos: ${officer.totalPoints}\n`;
      message += `\n`;
    });

    if (ranking.length > 20) {
      message += `... e mais ${ranking.length - 20} policiais listados.\n`;
    }

    navigator.clipboard.writeText(message)
      .then(() => {
        setSuccessMsg('Ranking copiado para o WhatsApp!');
        setTimeout(() => setSuccessMsg(''), 3000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-black">Painel Geral</h2>
          <p className="text-gray-900 font-medium mt-1">Visão geral, filtros e Ranking Operacional.</p>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white p-2 rounded-xl border border-gray-300 shadow-sm flex flex-col md:flex-row gap-2 items-center w-full xl:w-auto">
           <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
             <button 
               onClick={setFilterToday}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeFilter === 'hoje' ? 'bg-black text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
             >
               Hoje
             </button>
             <button 
               onClick={setFilterMonth}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeFilter === 'mes' ? 'bg-black text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
             >
               Mês
             </button>
             <button 
               onClick={setFilterYear}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeFilter === 'ano' ? 'bg-black text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
             >
               Ano
             </button>
             <button 
               onClick={clearFilters}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeFilter === 'geral' ? 'bg-black text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
             >
               Geral
             </button>
           </div>

           <div className="h-6 w-px bg-gray-300 hidden md:block"></div>

           <div className="flex gap-2 items-center">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-black uppercase leading-none mb-0.5">De</span>
               <input 
                 type="date" 
                 value={startDate} 
                 onChange={e => handleCustomDateChange(e.target.value, endDate)}
                 className="text-xs border border-gray-300 rounded px-1 py-0.5 text-black font-bold bg-gray-50 focus:ring-1 focus:ring-black outline-none" 
               />
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-black uppercase leading-none mb-0.5">Até</span>
               <input 
                 type="date" 
                 value={endDate} 
                 onChange={e => handleCustomDateChange(startDate, e.target.value)}
                 className="text-xs border border-gray-300 rounded px-1 py-0.5 text-black font-bold bg-gray-50 focus:ring-1 focus:ring-black outline-none" 
               />
             </div>
           </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300 flex items-center gap-4">
          <div className="p-3 bg-blue-900 text-white rounded-full">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-800 font-bold uppercase">Líder (No Período)</p>
            <p className="text-lg font-black text-black">{ranking[0]?.warName || 'N/A'}</p>
            <p className="text-sm text-blue-800 font-bold">{ranking[0]?.totalPoints || 0} pontos</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300 flex items-center gap-4">
          <div className="p-3 bg-green-800 text-white rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-800 font-bold uppercase">Ocorrências</p>
            <p className="text-2xl font-black text-black">{filteredLogs.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300 flex items-center gap-4">
          <div className="p-3 bg-orange-700 text-white rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-800 font-bold uppercase">Tipos Distintos</p>
            <p className="text-2xl font-black text-black">{typeDistribution.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Officers Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300 h-96">
          <h3 className="text-lg font-black text-black mb-4">Top 5 - Pontuação Operacional</h3>
          {topOfficers.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topOfficers} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis dataKey="warName" type="category" width={100} tick={{ fontSize: 12, fill: '#000', fontWeight: 'bold' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalPoints" radius={[0, 4, 4, 0]} barSize={30}>
                  {topOfficers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#1e3a8a' : '#4b5563'} /> // Darker blue/gray
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-600 font-bold">
               Sem dados para o período selecionado.
            </div>
          )}
        </div>

        {/* Ranking Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300 overflow-hidden flex flex-col relative">
          
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-black text-black">Classificação Geral</h3>
             <div className="flex gap-2">
                <button
                  onClick={handleExportRankingPDF}
                  className="p-1.5 text-red-700 hover:bg-red-50 rounded transition-colors border border-red-200"
                  title="Exportar Ranking em PDF"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={handleExportRankingWhatsApp}
                  className="p-1.5 text-green-700 hover:bg-green-50 rounded transition-colors border border-green-200"
                  title="Copiar Ranking para WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
             </div>
          </div>

          {successMsg && (
            <div className="absolute top-16 right-6 z-10 bg-green-100 text-green-900 border border-green-300 px-3 py-1 rounded text-xs font-bold flex items-center gap-1 animate-fade-in shadow-md">
              <CheckCircle className="w-3 h-3" /> {successMsg}
            </div>
          )}

          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 text-xs font-black text-black uppercase tracking-wider">Pos</th>
                  <th className="py-3 px-4 text-xs font-black text-black uppercase tracking-wider">Policial</th>
                  <th className="py-3 px-4 text-xs font-black text-black uppercase tracking-wider text-center">Ocorrências</th>
                  <th className="py-3 px-4 text-xs font-black text-black uppercase tracking-wider text-right">Pontos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ranking.map((officer, index) => (
                  <tr key={officer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black border ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                        index === 1 ? 'bg-gray-200 text-gray-800 border-gray-400' :
                        index === 2 ? 'bg-orange-100 text-orange-800 border-orange-300' :
                        'text-black border-gray-200'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => setSelectedOfficerId(officer.id)}
                        className="text-left group"
                      >
                        <div className="font-bold text-black group-hover:text-blue-700 group-hover:underline transition-all">
                          {officer.warName}
                        </div>
                        <div className="text-xs text-gray-700 font-medium">{officer.rank}</div>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center text-black font-medium">{officer.occurrencesCount}</td>
                    <td className="py-3 px-4 text-right font-black text-blue-800">{officer.totalPoints}</td>
                  </tr>
                ))}
                {ranking.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-black font-medium text-sm">
                      Nenhum registro encontrado para este período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Officer Details Modal */}
      {selectedOfficerDetails && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 rounded-t-xl flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="bg-blue-600 p-3 rounded-full">
                   <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedOfficerDetails.officer.rank} {selectedOfficerDetails.officer.warName}</h3>
                  <p className="text-sm text-slate-300">{selectedOfficerDetails.officer.fullName}</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Matrícula: {selectedOfficerDetails.officer.matricula}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOfficerId(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Summary */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 border-b border-gray-200">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                 <span className="block text-xs font-bold text-gray-500 uppercase">Total de Pontos</span>
                 <span className="block text-2xl font-black text-blue-800">{selectedOfficerDetails.totalPoints}</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                 <span className="block text-xs font-bold text-gray-500 uppercase">Ocorrências</span>
                 <span className="block text-2xl font-black text-black">{selectedOfficerDetails.totalOccurrences}</span>
              </div>
            </div>

            {/* Logs Table */}
            <div className="p-6 overflow-auto flex-1 custom-scrollbar">
              <h4 className="text-sm font-black text-black uppercase mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Detalhamento dos B.O.s (Filtro Atual)
              </h4>
              
              {selectedOfficerDetails.logs.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-700 font-bold uppercase">
                      <tr>
                        <th className="px-4 py-2 border-b">Data</th>
                        <th className="px-4 py-2 border-b">B.O.E</th>
                        <th className="px-4 py-2 border-b">Ocorrência</th>
                        <th className="px-4 py-2 border-b text-right">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOfficerDetails.logs.map(log => {
                        const type = occurrenceTypes.find(t => t.id === log.typeId);
                        const factor = log.multiplicationFactor ?? 1;
                        const points = type ? (type.points * factor) : 0;
                        
                        return (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-gray-600 font-medium">
                              {new Date(log.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                            </td>
                            <td className="px-4 py-2 font-mono font-bold text-black">
                              {log.boeNumber || '-'}
                            </td>
                            <td className="px-4 py-2">
                              <span className="block font-bold text-gray-800">{type?.name}</span>
                              {factor !== 1 && (
                                <span className="text-[10px] text-gray-500 block">Fator: x{factor}</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-right font-black text-blue-800">
                              {points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 font-medium">
                  Nenhum registro encontrado para este período.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
               <button 
                 onClick={() => setSelectedOfficerId(null)}
                 className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-black transition-colors text-sm"
               >
                 Fechar Detalhes
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};