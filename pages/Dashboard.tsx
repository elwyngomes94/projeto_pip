import React, { useState, useMemo } from 'react';
import { usePoliceData } from '../context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, TrendingUp, AlertTriangle, Filter, X, FileText, MessageCircle, CheckCircle, Calendar, User, Shield, AlertCircle, Send, ArrowRight } from 'lucide-react';
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
        <div className="bg-slate-900 p-3 shadow-xl rounded-lg border border-slate-700 animate-fade-in">
          <p className="font-bold text-white text-sm">{label}</p>
          <p className="text-blue-300 font-bold text-xs mt-1">{`${payload[0].value} pontos`}</p>
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
    <div className="space-y-8 pb-10">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8 animate-slide-up">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Painel Geral</h2>
          <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
             Visão estratégica e operacional.
             <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </p>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50 flex flex-col md:flex-row gap-2 items-center w-full xl:w-auto hover:shadow-xl transition-shadow duration-300">
           <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-1.5">
             {['hoje', 'mes', 'ano', 'geral'].map((filter) => (
                <button 
                  key={filter}
                  onClick={() => {
                    if(filter === 'hoje') setFilterToday();
                    if(filter === 'mes') setFilterMonth();
                    if(filter === 'ano') setFilterYear();
                    if(filter === 'geral') clearFilters();
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 capitalize ${activeFilter === filter ? 'bg-white text-slate-900 shadow-md transform scale-105' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`}
                >
                  {filter}
                </button>
             ))}
           </div>

           <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

           <div className="flex gap-2 items-center px-2">
             <div className="flex flex-col group">
               <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1 group-hover:text-blue-600 transition-colors">De</span>
               <input 
                 type="date" 
                 value={startDate} 
                 onChange={e => handleCustomDateChange(e.target.value, endDate)}
                 className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-slate-700 font-bold bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:bg-white" 
               />
             </div>
             <div className="flex flex-col group">
               <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1 group-hover:text-blue-600 transition-colors">Até</span>
               <input 
                 type="date" 
                 value={endDate} 
                 onChange={e => handleCustomDateChange(startDate, e.target.value)}
                 className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-slate-700 font-bold bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:bg-white" 
               />
             </div>
           </div>
        </div>
      </header>

      {/* Stats Cards - Interactive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 p-6 rounded-2xl shadow-xl shadow-blue-900/20 text-white relative overflow-hidden card-hover animate-slide-up delay-100">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="w-24 h-24 rotate-12" />
          </div>
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-sm font-bold text-blue-100 uppercase tracking-wide">Líder do Ranking</p>
             </div>
             <p className="text-2xl font-black truncate">{ranking[0]?.warName || '---'}</p>
             <div className="flex items-end gap-2 mt-1">
               <p className="text-4xl font-black text-yellow-400">{ranking[0]?.totalPoints || 0}</p>
               <span className="text-sm font-bold mb-1.5 text-blue-200">pontos</span>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 card-hover animate-slide-up delay-200">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-green-100 text-green-700 rounded-xl">
               <TrendingUp className="w-6 h-6" />
             </div>
             <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+ Atividade</span>
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Total de Ocorrências</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{filteredLogs.length}</p>
          <p className="text-xs text-gray-400 mt-2">No período selecionado</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 card-hover animate-slide-up delay-300">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-orange-100 text-orange-700 rounded-xl">
               <AlertTriangle className="w-6 h-6" />
             </div>
             <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Diversidade</span>
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Tipos de Crimes</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{typeDistribution.length}</p>
          <p className="text-xs text-gray-400 mt-2">Naturezas distintas registradas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Officers Chart */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 min-h-[420px] animate-slide-up delay-200 flex flex-col">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
             <span className="bg-blue-600 w-1.5 h-6 rounded-full"></span>
             Top 5 - Pontuação Operacional
          </h3>
          <div className="flex-1">
            {topOfficers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topOfficers} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="warName" 
                    type="category" 
                    width={100} 
                    tick={{ fontSize: 13, fill: '#334155', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                  <Bar dataKey="totalPoints" radius={[0, 12, 12, 0]} animationDuration={1500}>
                    {topOfficers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#1e3a8a' : index === 1 ? '#3b82f6' : '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                 <Filter className="w-12 h-12 mb-3 opacity-20" />
                 <p className="font-semibold">Sem dados para exibir.</p>
              </div>
            )}
          </div>
        </div>

        {/* Ranking Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative animate-slide-up delay-300">
          
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
               <span className="bg-slate-900 w-1.5 h-6 rounded-full"></span>
               Classificação Geral
             </h3>
             <div className="flex gap-2">
                <button
                  onClick={handleExportRankingPDF}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100 hover:scale-105 active:scale-95 transform duration-200"
                  title="Exportar Ranking em PDF"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={handleExportRankingWhatsApp}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100 hover:scale-105 active:scale-95 transform duration-200"
                  title="Copiar Ranking para WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
             </div>
          </div>

          {successMsg && (
            <div className="absolute top-20 right-6 z-20 bg-green-100 text-green-800 border border-green-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 animate-fade-in shadow-lg">
              <CheckCircle className="w-4 h-4" /> {successMsg}
            </div>
          )}

          <div className="overflow-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 backdrop-blur-sm bg-gray-50/90">
                <tr>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Pos</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Policial</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider text-center">B.O.s</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ranking.map((officer, index) => (
                  <tr key={officer.id} className="group hover:bg-blue-50/50 transition-colors duration-200 cursor-default">
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black shadow-sm transition-transform group-hover:scale-110 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' :
                        index === 1 ? 'bg-gray-200 text-gray-700 ring-2 ring-gray-300' :
                        index === 2 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' :
                        'bg-white text-slate-500 border border-gray-200'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => setSelectedOfficerId(officer.id)}
                        className="text-left w-full"
                      >
                        <div className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                          {officer.warName}
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-500" />
                        </div>
                        <div className="text-xs text-slate-500 font-medium bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1 group-hover:bg-white transition-colors">{officer.rank}</div>
                      </button>
                    </td>
                    <td className="py-4 px-6 text-center">
                        <span className="font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-xs">{officer.occurrencesCount}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                        <span className="font-black text-blue-700 text-lg">{officer.totalPoints}</span>
                    </td>
                  </tr>
                ))}
                {ranking.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Officer Details Modal - Animated */}
      {selectedOfficerDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up overflow-hidden ring-1 ring-white/20">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                 <Shield className="w-32 h-32 rotate-12" />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <div className="flex gap-5 items-center">
                  <div className="bg-white/10 p-4 backdrop-blur-md rounded-2xl shadow-inner border border-white/10">
                     <User className="w-8 h-8 text-blue-200" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-wide">{selectedOfficerDetails.officer.rank} {selectedOfficerDetails.officer.warName}</h3>
                    <p className="text-sm text-blue-200 font-medium">{selectedOfficerDetails.officer.fullName}</p>
                    <div className="inline-block mt-2 px-2 py-0.5 bg-black/30 rounded text-xs font-mono text-gray-300">
                        Mat: {selectedOfficerDetails.officer.matricula}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOfficerId(null)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Summary */}
            <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 border-b border-gray-200">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center transform hover:scale-[1.02] transition-transform duration-300">
                 <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total de Pontos</span>
                 <span className="block text-3xl font-black text-blue-600">{selectedOfficerDetails.totalPoints}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center transform hover:scale-[1.02] transition-transform duration-300">
                 <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ocorrências</span>
                 <span className="block text-3xl font-black text-slate-800">{selectedOfficerDetails.totalOccurrences}</span>
              </div>
            </div>

            {/* Logs Table */}
            <div className="p-6 overflow-auto flex-1 custom-scrollbar bg-white">
              <h4 className="text-sm font-black text-slate-800 uppercase mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Detalhamento dos B.O.s
              </h4>
              
              {selectedOfficerDetails.logs.length > 0 ? (
                <div className="space-y-3">
                    {selectedOfficerDetails.logs.map((log, idx) => {
                        const type = occurrenceTypes.find(t => t.id === log.typeId);
                        const factor = log.multiplicationFactor ?? 1;
                        const points = type ? (type.points * factor) : 0;
                        
                        return (
                          <div 
                            key={log.id} 
                            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group animate-fade-in"
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                   <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                                     {new Date(log.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                   </span>
                                   <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
                                     BOE: {log.boeNumber || '-'}
                                   </span>
                                </div>
                                <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                                    {type?.name}
                                </p>
                             </div>
                             <div className="text-right">
                                <span className="block text-lg font-black text-blue-600">+{points}</span>
                                {factor !== 1 && (
                                    <span className="text-[10px] text-gray-400 font-bold block bg-gray-50 px-1 rounded border border-gray-100">x{factor}</span>
                                )}
                             </div>
                          </div>
                        )
                    })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                  Nenhum registro encontrado para este período.
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
               <button 
                 onClick={() => setSelectedOfficerId(null)}
                 className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all hover:shadow-lg active:scale-95 text-sm"
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