"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Plus, Target, ShieldAlert,
  CircleDollarSign, BellRing, X, ListOrdered
} from 'lucide-react';
import { api } from '~/trpc/react';

export type Tab = 'home' | 'list' | 'goals' | 'limits';

const FloatingNav = ({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<'TRANSAÇÃO' | 'META' | 'LIMITE' | null>(null);
  
  const utils = api.useUtils();

  const [formData, setFormData] = useState({
    title: '',
    value: 0,
    description: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE'
  });

  const createOp = api.operacoes.create.useMutation({
    onSuccess: async () => {
      await utils.operacoes.invalidate();
      closeModal();
    }
  });

  const closeModal = () => {
    setModalType(null);
    setIsOpen(false);
    setFormData({ title: '', value: 0, description: '', type: 'EXPENSE' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === 'TRANSAÇÃO') {
      createOp.mutate({
        title: formData.title,
        description: formData.description,
        value: formData.value,
        type: formData.type,
      });
    }
  };

  const getIconClass = (tab: Tab) =>
    `w-6 h-6 transition-all duration-300 ${
      activeTab === tab ? 'text-[#e6b33d] scale-110' : 'text-white/40 group-hover:text-white'
    }`;

  return (
    <>
      {/* --- MODAL DE TRANSAÇÕES --- */}
      {modalType && (
        <div className="modal modal-open backdrop-blur-md z-[100]">
          <div className="modal-box bg-white border-4 border-[#172c3c] rounded-[3rem] p-10 max-w-md">
            <h3 className="font-black text-3xl italic uppercase mb-8 text-[#172c3c] flex justify-between items-center">
              {modalType}
              <button onClick={closeModal} className="btn btn-ghost btn-circle btn-sm opacity-20"><X /></button>
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="form-control">
                <label className="label uppercase font-black text-[10px] opacity-40">Título</label>
                <input
                  type="text" required className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-bold bg-[#f0f2f5] italic focus:outline-none"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Aluguel, Job..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label uppercase font-black text-[10px] opacity-40">Valor (R$)</label>
                  <input
                    type="number" step="0.01" required className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-[#f0f2f5] text-xl italic focus:outline-none"
                    value={formData.value || ''}
                    onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-control">
                  <label className="label uppercase font-black text-[10px] opacity-40">Tipo</label>
                  <select
                    className={`select select-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-[#f0f2f5] italic focus:outline-none ${formData.type === 'INCOME' ? 'text-emerald-600' : 'text-[#995052]'}`}
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="EXPENSE">SAÍDA (-)</option>
                    <option value="INCOME">ENTRADA (+)</option>
                  </select>
                </div>
              </div>

              <div className="modal-action gap-2">
                <button type="button" onClick={closeModal} className="btn btn-ghost font-black opacity-30">FECHAR</button>
                <button
                  disabled={createOp.isPending}
                  type="submit"
                  className="btn bg-[#172c3c] text-white border-none rounded-2xl px-10 font-black flex-1 hover:bg-[#d96831]"
                >
                  {createOp.isPending ? 'SALVANDO...' : 'CONFIRMAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FLOATING NAV BAR --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 w-full max-w-fit px-4">
        
        {/* MENU SUSPENSO (MODAIS + LINK AVISO) */}
        <div className={`flex items-center gap-3 px-5 py-3 rounded-[2rem] bg-[#172c3c]/95 backdrop-blur-2xl border border-white/10 transition-all duration-500 shadow-2xl ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'
        }`}>
          <button className="flex flex-col items-center gap-1.5 group" onClick={() => setModalType('TRANSAÇÃO')}>
            <div className="w-11 h-11 bg-[#172c3c] rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 border border-white/10">
              <CircleDollarSign />
            </div>
            <span className="text-[7px] font-black uppercase text-white/50 tracking-widest text-center">Lançar</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 group" onClick={() => { setIsOpen(false); router.push("/avisos"); }}>
            <div className="w-11 h-11 bg-[#274862] rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 border border-white/10">
              <BellRing />
            </div>
            <span className="text-[7px] font-black uppercase text-white/50 tracking-widest text-center">Avisos</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 group" onClick={() => setModalType('META')}>
            <div className="w-11 h-11 bg-[#e6b33d] rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 border border-white/10">
              <Target />
            </div>
            <span className="text-[7px] font-black uppercase text-white/50 tracking-widest text-center">Meta</span>
          </button>

          <button className="flex flex-col items-center gap-1.5 group" onClick={() => setModalType('LIMITE')}>
            <div className="w-11 h-11 bg-[#995052] rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 border border-white/10">
              <ShieldAlert />
            </div>
            <span className="text-[7px] font-black uppercase text-white/50 tracking-widest text-center">Limite</span>
          </button>
        </div>

        {/* NAVEGAÇÃO PRINCIPAL (DASH, LISTA, PLUS, METAS, LIMITES) */}
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