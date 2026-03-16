"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Plus, Target, ShieldAlert,
  CircleDollarSign, BellRing, X, ListOrdered
} from 'lucide-react';
import { api } from '~/trpc/react';

export type Tab = 'home' | 'list' | 'goals' | 'limits';

// Paleta oficial de cores do projeto
const PALETTE = ["#172c3c", "#274862", "#995052", "#d96831", "#e6b33d"];

const FloatingNav = ({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<'TRANSAÇÃO' | 'META' | 'LIMITE' | null>(null);
  
  const utils = api.useUtils();

  // --- QUERIES ---
  // Carrega as tags para o modal de transação
  const { data: tags = [] } = api.transactionTag.getAll.useQuery();

  // --- ESTADO DO FORMULÁRIO ÚNICO ---
  const [formData, setFormData] = useState({
    title: '',
    value: 0, // Transação
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE', // Transação
    description: '', // Transação
    tagId: '', // Transação (A Tag que faltava!)
    targetAmount: 0, // Meta
    limitAmount: 0, // Limite
    color: '#172c3c', // Meta/Limite
    deadline: '', // Meta
  });

  // --- MUTATIONS ---
  const createOp = api.operacoes.create.useMutation({ 
    onSuccess: () => { void utils.operacoes.invalidate(); closeModal(); } 
  });
  const createGoal = api.metas.create.useMutation({ 
    onSuccess: () => { void utils.metas.invalidate(); closeModal(); } 
  });
  const createLimit = api.limites.create.useMutation({ 
    onSuccess: () => { void utils.limites.invalidate(); closeModal(); } 
  });

  const closeModal = () => {
    setModalType(null);
    setIsOpen(false);
    setFormData({
      title: '', value: 0, type: 'EXPENSE', description: '', tagId: '',
      targetAmount: 0, limitAmount: 0, color: '#172c3c', deadline: ''
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === 'TRANSAÇÃO') {
      createOp.mutate({
        title: formData.title,
        value: formData.value,
        type: formData.type,
        description: formData.description,
        tagId: formData.tagId || undefined,
      });
    } else if (modalType === 'META') {
      createGoal.mutate({
        title: formData.title,
        targetAmount: formData.targetAmount,
        currentAmount: 0,
        color: formData.color,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      });
    } else if (modalType === 'LIMITE') {
      createLimit.mutate({
        title: formData.title,
        limitAmount: formData.limitAmount,
        currentSpent: 0,
        color: formData.color,
      });
    }
  };

  const getIconClass = (tab: Tab) =>
    `w-6 h-6 transition-all duration-300 ${
      activeTab === tab ? 'text-[#e6b33d] scale-110' : 'text-white/40 group-hover:text-white'
    }`;

  return (
    <>
      {/* --- MODAL DE CRIAÇÃO COMPLETO --- */}
      {modalType && (
        <div className="modal modal-open backdrop-blur-md z-[100] p-4">
          <div className="modal-box bg-white border-4 border-[#172c3c] rounded-[3rem] p-8 max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-3xl italic uppercase text-[#172c3c] tracking-tighter">
                Novo {modalType.toLowerCase()}
              </h3>
              <button onClick={closeModal} className="btn btn-ghost btn-circle btn-sm opacity-20"><X /></button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-6 gap-x-4 gap-y-3">
              
              {/* TÍTULO (Universal) */}
              <div className="form-control col-span-6">
                <label className="label uppercase font-black text-[10px] opacity-40 italic">O que é?</label>
                <input
                  type="text" required placeholder="Ex: Mercado, Viagem, Reserva..."
                  className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-bold bg-white text-black italic w-full focus:outline-none"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* CAMPOS: TRANSAÇÃO */}
              {modalType === 'TRANSAÇÃO' && (
                <>
                  <div className="form-control col-span-3">
                    <label className="label uppercase font-black text-[10px] opacity-40 italic">Valor (R$)</label>
                    <input
                      type="number" step="0.01" required placeholder="0.00"
                      className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-white text-black italic w-full focus:outline-none"
                      value={formData.value || ''}
                      onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-control col-span-3">
                    <label className="label uppercase font-black text-[10px] opacity-40 italic">Tipo</label>
                    <select
                      className={`select select-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-white italic w-full focus:outline-none ${formData.type === 'INCOME' ? 'text-emerald-600' : 'text-[#995052]'}`}
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="EXPENSE">SAÍDA (-)</option>
                      <option value="INCOME">ENTRADA (+)</option>
                    </select>
                  </div>
                  <div className="form-control col-span-6">
                    <label className="label uppercase font-black text-[10px] opacity-40 italic">Etiqueta (Tag)</label>
                    <select
                      className="select select-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-white italic w-full focus:outline-none"
                      value={formData.tagId}
                      onChange={e => setFormData({ ...formData, tagId: e.target.value })}
                    >
                      <option value="">Sem Categoria</option>
                      {tags.map(tag => (
                        <option key={tag.id} value={tag.id}>{tag.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* CAMPOS: META */}
              {modalType === 'META' && (
                <>
                  <div className="form-control col-span-6">
                    <label className="label uppercase font-black text-[10px] opacity-40 italic">Alvo da Meta (R$)</label>
                    <input
                      type="number" step="0.01" required placeholder="Ex: 5000"
                      className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-white text-[#d96831] italic w-full focus:outline-none"
                      value={formData.targetAmount || ''}
                      onChange={e => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-control col-span-6">
                    <label className="label uppercase font-black text-[10px] opacity-40 italic">Data Limite (Opcional)</label>
                    <input
                      type="date"
                      className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-bold bg-white text-black w-full focus:outline-none"
                      value={formData.deadline}
                      onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* CAMPOS: LIMITE */}
              {modalType === 'LIMITE' && (
                <div className="form-control col-span-6">
                  <label className="label uppercase font-black text-[10px] opacity-40 italic">Teto Mensal (R$)</label>
                  <input
                    type="number" step="0.01" required placeholder="Ex: 1500"
                    className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-white text-[#995052] italic w-full focus:outline-none"
                    value={formData.limitAmount || ''}
                    onChange={e => setFormData({ ...formData, limitAmount: Number(e.target.value) })}
                  />
                </div>
              )}

              {/* SELETOR DE COR (Meta / Limite) */}
              {(modalType === 'META' || modalType === 'LIMITE') && (
                <div className="form-control col-span-6">
                  <label className="label uppercase font-black text-[10px] opacity-40 italic">Identidade Visual</label>
                  <div className="flex justify-between gap-2 bg-[#f0f2f5] p-3 rounded-2xl border-2 border-[#172c3c]/10 overflow-x-auto custom-scrollbar">
                    {PALETTE.map(color => (
                      <button key={color} type="button" onClick={() => setFormData({ ...formData, color })} 
                        className={`w-8 h-8 rounded-full border-2 transition-all shrink-0 ${formData.color === color ? 'border-[#172c3c] scale-110 shadow-md' : 'border-transparent'}`} 
                        style={{ backgroundColor: color }} 
                      />
                    ))}
                    <input type="color" className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none p-0 shrink-0" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                  </div>
                </div>
              )}

              <div className="col-span-6 mt-6 flex flex-col gap-2">
                <button
                  disabled={createOp.isPending || createGoal.isPending || createLimit.isPending}
                  type="submit"
                  className="btn bg-[#172c3c] text-white border-none rounded-2xl h-14 font-black w-full hover:bg-[#d96831] uppercase tracking-tighter shadow-xl transition-all active:scale-95"
                >
                  {(createOp.isPending || createGoal.isPending || createLimit.isPending) ? 'SALVANDO...' : `CONFIRMAR ${modalType}`}
                </button>
                <button type="button" onClick={closeModal} className="btn btn-ghost font-black opacity-30 w-full">CANCELAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FLOATING NAV BAR --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 w-full max-w-fit px-4">
        
        {/* MENU SUSPENSO */}
        <div className={`flex items-center gap-3 px-5 py-3 rounded-[2.5rem] bg-[#172c3c]/95 backdrop-blur-2xl border border-white/10 transition-all duration-500 shadow-2xl ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'
        }`}>
          <button className="flex flex-col items-center gap-1 group" onClick={() => setModalType('TRANSAÇÃO')}>
            <div className="w-12 h-12 bg-[#172c3c] rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 border border-white/10">
              <CircleDollarSign size={22} />
            </div>
            <span className="text-[7px] font-black uppercase text-white/50 tracking-widest">Lançar</span>
          </button>

          <button className="flex flex-col items-center gap-1 group" onClick={() => setModalType('META')}>
            <div className="w-12 h-12 bg-[#e6b33d] rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 border border-white/10">
              <Target size={22} />
            </div>
            <span className="text-[7px] font-black uppercase text-white/50 tracking-widest">Meta</span>
          </button>

          <button className="flex flex-col items-center gap-1 group" onClick={() => setModalType('LIMITE')}>
            <div className="w-12 h-12 bg-[#995052] rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 border border-white/10">
              <ShieldAlert size={22} />
            </div>
            <span className="text-[7px] font-black uppercase text-white/50 tracking-widest">Limite</span>
          </button>

          <button className="flex flex-col items-center gap-1 group" onClick={() => { setIsOpen(false); router.push("/avisos"); }}>
            <div className="w-12 h-12 bg-[#274862] rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 border border-white/10">
              <BellRing size={20} />
            </div>
            <span className="text-[7px] font-black uppercase text-white/50 tracking-widest">Avisos</span>
          </button>
        </div>

        {/* NAVEGAÇÃO PRINCIPAL */}
        <nav className="bg-[#172c3c] px-6 py-3 md:px-8 md:py-4 rounded-full shadow-2xl flex items-center gap-4 md:gap-7 border border-white/10 backdrop-blur-md">
          <button onClick={() => { setActiveTab('home'); router.push('/dashboard'); setIsOpen(false); }}>
            <LayoutDashboard className={getIconClass('home')} />
          </button>

          <button onClick={() => { setActiveTab('list'); router.push('/operacoes'); setIsOpen(false); }}>
            <ListOrdered className={getIconClass('list')} />
          </button>

          {/* PLUS BUTTON CENTRAL */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500 border-[6px] border-[#172c3c] ${
                isOpen ? 'bg-[#995052] rotate-[135deg]' : 'bg-[#d96831]'
              }`}
            >
              <Plus className="w-8 h-8 stroke-[3.5px]" />
            </button>
          </div>

          <button onClick={() => { setActiveTab('goals'); router.push('/metas'); setIsOpen(false); }}>
            <Target className={getIconClass('goals')} />
          </button>

          <button onClick={() => { setActiveTab('limits'); router.push('/limites'); setIsOpen(false); }}>
            <ShieldAlert className={getIconClass('limits')} />
          </button>
        </nav>
      </div>
    </>
  );
};

export default FloatingNav;