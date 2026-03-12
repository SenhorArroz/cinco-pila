"use client";
import React, { useState } from 'react';
import FloatingNav from '../_components/FloatingNav';
import { api } from '~/trpc/react';

// --- TYPES (Sincronizados com seu Router) ---
interface GoalFormData {
  id?: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  deadline?: string; // Formato YYYY-MM-DD para o input
}

export default function MetasCincoPila() {
  const [activeTab, setActiveTab] = useState<'home' | 'list' | 'goals' | 'limits'>('goals');
  const utils = api.useUtils();

  // --- QUERIES & MUTATIONS ---
  const { data: goals = [], isLoading } = api.metas.getAll.useQuery();

  const createGoal = api.metas.create.useMutation({
    onSuccess: () => {
      void utils.metas.getAll.invalidate();
      setIsModalOpen(false);
    },
  });

  const updateGoal = api.metas.update.useMutation({
    onSuccess: () => {
      void utils.metas.getAll.invalidate();
      setIsModalOpen(false);
    },
  });

  const deleteGoal = api.metas.delete.useMutation({
    onSuccess: () => void utils.metas.getAll.invalidate(),
  });

  // --- ESTADOS DO MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GoalFormData>({
    title: '', currentAmount: 0, targetAmount: 0, deadline: ''
  });

  // --- HANDLERS ---
  const handleOpenModal = (goal?: (typeof goals)[0]) => {
    if (goal) {
      setEditingId(goal.id);
      setFormData({
        title: goal.title,
        currentAmount: goal.currentAmount,
        targetAmount: goal.targetAmount,
        deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', currentAmount: 0, targetAmount: 0, deadline: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      currentAmount: formData.currentAmount,
      targetAmount: formData.targetAmount,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
    };

    if (editingId) {
      updateGoal.mutate({ id: editingId, ...payload });
    } else {
      createGoal.mutate(payload);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#172c3c] font-sans p-4 md:p-10 pb-32">
      <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b-8 border-[#172c3c] pb-4">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
              Metas<span className="text-[#d96831]">@</span>
            </h1>
            <p className="mt-2 font-bold opacity-40 tracking-[0.3em] text-xs uppercase">Conectado ao Banco de Dados</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="btn bg-[#172c3c] text-white border-none rounded-full px-10 font-black hover:scale-105 transition-all shadow-lg"
          >
            + CRIAR NOVO OBJETIVO
          </button>
        </header>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-[3rem]" />
            ))}
          </div>
        )}

        {/* GRID DE METAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {!isLoading && goals.map((goal, index) => {
            const percent = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
            const isNearTarget = percent >= 90 && percent < 100;

            return (
              <div 
                key={goal.id} 
                style={{ animationDelay: `${index * 100}ms` }}
                className={`
                  group relative bg-[#172c3c] rounded-[3rem] p-8 text-white overflow-hidden shadow-2xl transition-all duration-500 animate-in zoom-in-95
                  ${isNearTarget ? 'ring-4 ring-[#e6b33d] ring-offset-4 ring-offset-[#f0f2f5] animate-pulse-slow' : ''}
                `}
              >
                {/* Alerta Pulsante */}
                {isNearTarget && (
                  <div className="absolute top-6 left-8 flex items-center gap-2 z-20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e6b33d] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e6b33d]"></span>
                    </span>
                    <span className="text-[8px] font-black uppercase text-[#e6b33d]">Tá batendo!</span>
                  </div>
                )}

                <div className="absolute top-8 right-8 w-20 h-20 rounded-full border-2 border-white/10 flex items-center justify-center">
                  <span className="text-2xl font-black italic">{percent}%</span>
                </div>

                <div className="relative z-10">
                  <p className="text-[10px] font-black opacity-40 mb-1 mt-4 italic">
                    {goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                  </p>
                  <h3 className="text-3xl font-black leading-tight mb-8 group-hover:text-[#e6b33d] transition-colors truncate">
                    {goal.title}
                  </h3>

                  <div className="space-y-6">
                    <div className="relative h-28 w-full bg-white/5 rounded-3xl p-5 flex flex-col justify-end overflow-hidden border border-white/5">
                      <div 
                        className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-out bg-[#e6b33d]" 
                        style={{ height: `${percent}%`, opacity: 0.2 }}
                      />
                      <p className="text-[10px] font-black opacity-40 mb-1 uppercase">Progresso</p>
                      <p className="text-2xl font-black italic">
                        R$ {goal.currentAmount.toLocaleString()} <span className="text-[10px] opacity-30 font-normal">/ {goal.targetAmount.toLocaleString()}</span>
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <button 
                        onClick={() => handleOpenModal(goal)}
                        className="btn btn-sm flex-1 bg-white/10 border-none text-white rounded-xl hover:bg-white hover:text-[#172c3c] font-black text-[10px]"
                      >
                        AJUSTAR
                      </button>
                      <button 
                        onClick={() => {
                            if(confirm("Apagar?")) deleteGoal.mutate({ id: goal.id });
                        }}
                        className="btn btn-sm bg-[#995052]/20 border-none text-[#995052] rounded-xl hover:bg-[#995052] hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL CRUD */}
        {isModalOpen && (
          <div className="modal modal-open backdrop-blur-sm transition-all duration-300">
            <div className="modal-box bg-white border-4 border-[#172c3c] rounded-[2.5rem] p-8 max-w-md animate-in zoom-in-95">
              <h3 className="font-black text-3xl uppercase italic mb-6 tracking-tighter">
                {editingId ? 'Ajustar Meta' : 'Novo Sonho'}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="form-control">
                  <label className="label uppercase font-black text-[10px] opacity-40">O que vamos conquistar?</label>
                  <input 
                    type="text" required className="input input-bordered text-white border-2 border-[#172c3c] rounded-2xl font-bold" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label uppercase font-black text-[10px] opacity-40">Guardado (R$)</label>
                    <input 
                      type="number" step="0.01" className="input input-bordered text-white border-2 border-[#172c3c] rounded-2xl font-bold" 
                      value={formData.currentAmount}
                      onChange={e => setFormData({...formData, currentAmount: Number(e.target.value)})}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label uppercase font-black text-[10px] opacity-40">Alvo (R$)</label>
                    <input 
                      type="number" step="0.01" required className="input input-bordered text-white border-2 border-[#172c3c] rounded-2xl font-black text-[#d96831]" 
                      value={formData.targetAmount}
                      onChange={e => setFormData({...formData, targetAmount: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label uppercase font-black text-[10px] opacity-40">Data Limite (Opcional)</label>
                  <input 
                    type="date" className="input input-bordered text-white border-2 border-[#172c3c] rounded-2xl font-bold" 
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                  />
                </div>

                <div className="modal-action flex flex-col gap-2">
                  <button 
                    disabled={createGoal.isPending || updateGoal.isPending}
                    type="submit" 
                    className="btn btn-block bg-[#172c3c] text-white rounded-2xl border-none font-black h-14 hover:bg-[#d96831]"
                  >
                    {(createGoal.isPending || updateGoal.isPending) ? 'SALVANDO...' : 'CONFIRMAR'}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost font-bold opacity-30">CANCELAR</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <FloatingNav activeTab={activeTab} setActiveTab={setActiveTab} onAddClick={() => handleOpenModal()} />
      
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}