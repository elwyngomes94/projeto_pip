import React, { useState } from 'react';
import { usePoliceData } from '../context';
import { Gavel, CheckCircle, XCircle, Clock, MessageSquare, AlertCircle, Plus, X, Send, FileText } from 'lucide-react';

export const Contestations: React.FC = () => {
  const { 
    contestations, 
    resolveContestation, 
    currentUser, 
    addContestation 
  } = usePoliceData();

  const [rejectModalOpen, setRejectModalOpen] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // New Contestation Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  // Filter contestations based on role
  const visibleContestations = isAdmin 
    ? contestations 
    : contestations.filter(c => c.userId === currentUser?.id);

  // Sorting: Pending first, then by date
  const sortedContestations = [...visibleContestations].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return b.createdAt - a.createdAt;
  });

  const handleApprove = (id: string) => {
    if (confirm('Deseja marcar esta contestação como RESOLVIDA/ACEITA? (Isso não altera pontos automaticamente, faça a correção manual se necessário).')) {
      resolveContestation(id, 'approved');
    }
  };

  const handleRejectSubmit = () => {
    if (rejectModalOpen && rejectReason) {
      resolveContestation(rejectModalOpen, 'rejected', rejectReason);
      setRejectModalOpen(null);
      setRejectReason('');
    }
  };

  const handleSubmitNewContestation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim() || !currentUser) return;

    addContestation({
      userId: currentUser.id,
      userName: currentUser.name,
      subject: subject,
      content: content
    });

    setSuccessMsg('Contestação enviada com sucesso!');
    setTimeout(() => setSuccessMsg(''), 3000);

    // Reset and Close
    setIsNewModalOpen(false);
    setSubject('');
    setContent('');
  };

  const openNewModal = () => {
    setIsNewModalOpen(true);
    setSubject('');
    setContent('');
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-black">Contestações</h2>
          <p className="text-gray-900 font-medium">
            {isAdmin 
              ? 'Gerencie as solicitações de correção.' 
              : 'Acompanhe o status das suas solicitações.'}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={openNewModal}
            className="bg-red-700 hover:bg-red-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-bold shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Nova Contestação
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-green-100 border border-green-300 text-green-900 px-4 py-3 rounded-lg flex items-center gap-2 font-bold animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
        {sortedContestations.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium flex flex-col items-center">
            <Gavel className="w-12 h-12 mb-3 opacity-20" />
            <p>Nenhuma contestação encontrada.</p>
            {!isAdmin && (
              <button 
                onClick={openNewModal}
                className="mt-4 text-red-700 font-bold hover:underline"
              >
                Clique aqui para abrir uma nova contestação
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedContestations.map(c => (
              <div key={c.id} className="p-6 hover:bg-gray-50 transition-colors">
                 <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                             c.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                             c.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                             'bg-red-100 text-red-800 border-red-200'
                          }`}>
                             {c.status === 'pending' ? 'Pendente' : c.status === 'approved' ? 'Aceito' : 'Recusado'}
                          </span>
                          <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(c.createdAt).toLocaleDateString('pt-BR')} às {new Date(c.createdAt).toLocaleTimeString('pt-BR')}
                          </span>
                       </div>
                       
                       <h3 className="font-bold text-black text-lg flex items-center gap-2">
                          {c.subject || 'Sem Assunto'}
                       </h3>
                       
                       <div className="text-sm text-gray-600 space-y-1">
                          <p><b>Solicitante:</b> {c.userName}</p>
                       </div>

                       <div className="mt-3 bg-gray-100 p-3 rounded-lg text-sm border border-gray-200">
                          <p className="font-bold text-gray-700 text-xs uppercase mb-1 flex items-center gap-1">
                             <MessageSquare className="w-3 h-3" /> Detalhamento:
                          </p>
                          <p className="text-gray-800 whitespace-pre-wrap">{c.content || c.subject}</p>
                       </div>

                       {c.status === 'rejected' && c.adminResponse && (
                          <div className="mt-2 bg-red-50 p-3 rounded-lg text-sm border border-red-100">
                            <p className="font-bold text-red-800 text-xs uppercase mb-1 flex items-center gap-1">
                               <AlertCircle className="w-3 h-3" /> Resposta da Administração:
                            </p>
                            <p className="text-red-900">{c.adminResponse}</p>
                          </div>
                       )}
                       {c.status === 'approved' && (
                          <p className="text-xs font-bold text-green-700 mt-2 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Solicitação marcada como resolvida.
                          </p>
                       )}
                    </div>

                    {isAdmin && c.status === 'pending' && (
                       <div className="flex flex-row md:flex-col gap-2 justify-start md:justify-center min-w-[120px]">
                          <button 
                            onClick={() => handleApprove(c.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 shadow-sm transition-colors"
                          >
                             <CheckCircle className="w-4 h-4" /> Aprovar
                          </button>
                          <button 
                            onClick={() => setRejectModalOpen(c.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 shadow-sm transition-colors"
                          >
                             <XCircle className="w-4 h-4" /> Recusar
                          </button>
                       </div>
                    )}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
              <h3 className="text-lg font-black text-black mb-4">Justificar Recusa</h3>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-700 h-32 resize-none"
                placeholder="Por que esta contestação está sendo recusada?"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              ></textarea>
              <div className="flex gap-3 mt-4">
                 <button 
                   onClick={() => { setRejectModalOpen(null); setRejectReason(''); }}
                   className="flex-1 py-2 bg-gray-200 text-black font-bold rounded-lg hover:bg-gray-300"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={handleRejectSubmit}
                   disabled={!rejectReason}
                   className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                 >
                   Confirmar Recusa
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* New Contestation Modal - Simple Text Form */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-gray-200 flex flex-col max-h-[90vh]">
              
              <div className="bg-red-700 text-white p-4 flex justify-between items-center">
                 <h3 className="font-bold flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nova Contestação
                 </h3>
                 <button onClick={() => setIsNewModalOpen(false)} className="text-white hover:bg-red-800 rounded p-1">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <form onSubmit={handleSubmitNewContestation} className="p-6 flex flex-col h-full overflow-auto">
                 <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-black mb-1">Motivo / Assunto</label>
                      <input
                        type="text"
                        placeholder="Ex: Pontuação de B.O.E. duplicada, Registro incorreto..."
                        className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-700 text-sm text-black"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        autoFocus
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-black mb-1">Detalhamento</label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-700 h-40 resize-none"
                        placeholder="Descreva detalhadamente o problema..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      ></textarea>
                    </div>
                 </div>

                 <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsNewModalOpen(false)}
                      className="flex-1 py-2 bg-gray-200 text-black font-bold rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!subject.trim() || !content.trim()}
                      className="flex-1 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Enviar Contestação
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};