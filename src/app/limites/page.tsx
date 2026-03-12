"use client";
import React, { useState, useMemo } from 'react';
import FloatingNav from '../_components/FloatingNav';
import { api } from '~/trpc/react';

export default function LimitesCincoPila() {
  const [activeTab, setActiveTab] = useState<'home' | 'list' | 'goals' | 'limits'>('limits');
  const utils = api.useUtils();

  // --- QUERIES & MUTATIONS ---
  const { data: limits = [], isLoading } = api.limites.getAll.useQuery();

  const createLimit = api.limites.create.useMutation({
    onSuccess: () => {
      void utils.limites.getAll.invalidate();
      setIsModalOpen(false);
    },
  });

  const updateLimit = api.limites.update.useMutation({
    onSuccess: () => {
      void utils.limites.getAll.invalidate();
      setIsModalOpen(false);
    },
  });

  const deleteLimit = api.limites.delete.useMutation({
    onSuccess: () => void utils.limites.getAll.invalidate(),
  });

  // --- ESTADOS DO MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    currentSpent: 0,
    limitAmount: 0
  });

  // --- CÁLCULOS ---
  const criticalCount = useMemo(() => 
    limits.filter(l => (l.currentSpent / l.limitAmount) >= 0.85).length, 
  [limits]);

  const totalMargin = useMemo(() => 
    limits.reduce((acc, l) => acc + (l.limitAmount - l.currentSpent), 0),
  [limits]);

  // --- HANDLERS ---
  const handleOpenModal = (limit?: (typeof limits)[0]) => {
    if (limit) {
      setEditingId(limit.id);
      setFormData({
        title: limit.title,
        currentSpent: limit.currentSpent,
        limitAmount: limit.limitAmount
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', currentSpent: 0, limitAmount: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateLimit.mutate({ id: editingId, ...formData });
    } else {
      createLimit.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#172c3c] font-sans p-4 md:p-10 pb-32">
      <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
        
        {/* HEADER */}
        <header className="mb-12 relative">
          <div className="flex justify-between items-end border-b-8 border-[#172c3c] pb-4">
            <div className="animate-in slide-in-from-left duration-500">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                Limites<span className="text-[#d96831]">/</span>
              </h1>
              <p className="mt-2 font-bold opacity-40 tracking-[0.3em] text-xs uppercase">Gestão de teto de gastos</p>
            </div>
            {!isLoading && (
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">Status_Geral</p>
                <p className={`font-black flex items-center gap-2 ${criticalCount > 0 ? 'text-[#995052]' : 'text-[#274862]'}`}>
                  {criticalCount > 0 && <span className="h-2 w-2 rounded-full bg-[#995052] animate-ping" />}
                  {criticalCount} ALERTAS ATIVOS
                </p>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* BOTÃO ADICIONAR */}
          <button 
            onClick={() => handleOpenModal()}
            className="h-full min-h-[250px] border-4 border-dashed border-[#172c3c]/20 rounded-[2.5rem] flex flex-col items-center justify-center group hover:border-[#d96831] transition-all hover:bg-white active:scale-95 duration-300"
          >
            <span className="text-4xl font-light text-[#172c3c]/20 group-hover:text-[#d96831] group-hover:rotate-90 transition-transform duration-500">+</span>
            <span className="text-[10px] font-black opacity-20 group-hover:opacity-100 uppercase mt-2">Definir Teto</span>
          </button>

          {/* LISTAGEM DOS CARDS */}
          {!isLoading && limits.map((l, index) => {
            const usage = (l.currentSpent / l.limitAmount) * 100;
            const isCritical = usage >= 85;

            return (
              <div 
                key={l.id} 
                style={{ animationDelay: `${index * 50}ms` }}
                className={`
                  group p-8 rounded-[2.5rem] shadow-xl transition-all duration-500 relative overflow-hidden animate-in zoom-in-95
                  ${isCritical ? 'bg-[#995052] text-white scale-95 z-10' : 'bg-white text-[#172c3c] hover:shadow-2xl hover:-translate-y-1'}
                  ${isCritical && usage < 100 ? 'ring-4 ring-[#995052] ring-offset-4 ring-offset-[#f0f2f5] animate-pulse-slow' : ''}
                `}
              >
                {isCritical && (
                  <div className="absolute top-4 right-6">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                  </div>
                )}

                <div className="mb-10">
                   <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${isCritical ? 'bg-white/20' : 'bg-[#172c3c]/5'}`}>
                      Gasto Ativo
                    </span>
                    <h3 className="text-xl font-black mt-3 leading-tight uppercase tracking-tighter truncate">{l.title}</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black opacity-40 uppercase">Gasto</p>
                      <p className="text-2xl font-black italic">R$ {l.currentSpent.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black opacity-40 uppercase">Teto</p>
                      <p className="text-sm font-bold opacity-60">R$ {l.limitAmount}</p>
                    </div>
                  </div>

                  <div className={`h-4 w-full rounded-full overflow-hidden p-1 border transition-all duration-500 ${isCritical ? 'border-white/20 bg-white/10' : 'border-[#172c3c]/10 bg-black/5'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${isCritical ? 'bg-[#e6b33d]' : 'bg-[#172c3c]'}`} 
                      style={{ width: `${Math.min(usage, 100)}%` }}
                    />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isCritical ? 'text-white' : 'opacity-40'}`}>
                    {usage >= 100 ? '⚠️ LIMITE EXCEDIDO' : `RESTAM R$ ${(l.limitAmount - l.currentSpent).toFixed(2)}`}
                  </p>
                </div>

                <div className="mt-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                   <button 
                    onClick={() => handleOpenModal(l)}
                    className={`btn btn-xs flex-1 rounded-lg border-none font-black ${isCritical ? 'bg-white text-[#995052] hover:bg-[#e6b33d]' : 'bg-[#172c3c] text-white'}`}
                   >
                     AJUSTAR
                   </button>
                   <button 
                    onClick={() => { if(confirm("Remover?")) deleteLimit.mutate({ id: l.id }) }}
                    className={`btn btn-xs rounded-lg border-none ${isCritical ? 'bg-white/20 text-white hover:bg-white/40' : 'bg-[#f0f2f5] text-[#172c3c]'}`}
                   >
                     ✕
                   </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="modal modal-open backdrop-blur-sm">
            <div className="modal-box bg-white border-4 border-[#172c3c] rounded-[2rem] animate-in zoom-in-95">
              <h3 className="font-black text-2xl uppercase italic mb-6">
                {editingId ? 'Editar Limite' : 'Novo Teto'}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="form-control">
                  <label className="label uppercase font-black text-[10px]">O que é esse gasto?</label>
                  <input 
                    type="text" required className="input input-bordered border-2 border-[#172c3c] rounded-xl focus:outline-none font-bold bg-white text-[#172c3c]" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label uppercase font-black text-[10px]">Valor Já Gasto</label>
                    <input 
                      type="number" step="0.01" className="input input-bordered border-2 border-[#172c3c] rounded-xl font-bold bg-white text-[#172c3c]" 
                      value={formData.currentSpent}
                      onChange={e => setFormData({...formData, currentSpent: Number(e.target.value)})}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label uppercase font-black text-[10px]">Limite Máximo</label>
                    <input 
                      type="number" step="0.01" required className="input input-bordered border-2 border-[#172c3c] rounded-xl font-black text-[#d96831] bg-white" 
                      value={formData.limitAmount}
                      onChange={e => setFormData({...formData, limitAmount: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="modal-action">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost font-bold">Cancelar</button>
                  <button 
                    disabled={createLimit.isPending || updateLimit.isPending}
                    type="submit" 
                    className="btn bg-[#172c3c] text-white hover:bg-[#d96831] border-none px-8 font-black"
                  >
                    { (createLimit.isPending || updateLimit.isPending) ? 'SALVANDO...' : 'SALVAR' }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MARGEM DE MANOBRA DINÂMICA */}
        <section className="mt-16 bg-[#274862] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl group animate-in slide-in-from-bottom duration-1000">
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="max-w-md text-center md:text-left">
                <h2 className="text-3xl font-black uppercase italic mb-4">Margem de Manobra</h2>
                <p className="text-sm opacity-60 leading-relaxed font-medium">
                  Seu fôlego financeiro real, calculado a partir de todos os seus tetos ativos.
                </p>
              </div>
              <div className="text-center md:text-right">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Sobrando do Teto</p>
                 <div className="text-6xl md:text-8xl font-black text-[#e6b33d] tracking-tighter group-hover:scale-105 transition-transform duration-500">
                   R$ {totalMargin.toFixed(0)}<span className="text-white">,00</span>
                 </div>
              </div>
           </div>
        </section>
      </div>

      <FloatingNav activeTab={activeTab} setActiveTab={setActiveTab} onAddClick={() => handleOpenModal()} />

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.07); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}