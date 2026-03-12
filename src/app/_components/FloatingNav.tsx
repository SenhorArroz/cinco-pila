"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  Target,
  ShieldAlert
} from 'lucide-react';

export type Tab = 'home' | 'list' | 'goals' | 'limits';

interface FloatingNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onAddClick: () => void;
}

const FloatingNav = ({ activeTab, setActiveTab, onAddClick }: FloatingNavProps) => {
  const router = useRouter();

  // Função utilitária para as classes de ícones
  const getIconClass = (tab: Tab) =>
    `w-6 h-6 transition-all duration-300 ${activeTab === tab ? 'text-[#e6b33d] scale-110' : 'text-white/40 group-hover:text-white'
    }`;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#172c3c] px-6 py-3 md:px-8 md:py-4 rounded-full shadow-[0_20px_50px_rgba(23,44,60,0.4)] flex items-center gap-6 md:gap-8 z-50 border border-white/10 backdrop-blur-md transition-all duration-300">

      {/* HOME - Dashboard */}
      <button
        onClick={() => { setActiveTab('home'); router.push('/dashboard'); }}
        type="button"
        className="group relative flex items-center justify-center p-2"
      >
        <LayoutDashboard className={getIconClass('home')} />
        {activeTab === 'home' && <span className="absolute -bottom-1 w-1 h-1 bg-[#e6b33d] rounded-full" />}
      </button>

      {/* LANÇAMENTOS - Fluxo de Caixa */}
      <button
        onClick={() => { setActiveTab('list'); router.push('/operacoes'); }}
        type="button"
        className="group relative flex items-center justify-center p-2"
      >
        <ArrowLeftRight className={getIconClass('list')} />
        {activeTab === 'list' && <span className="absolute -bottom-1 w-1 h-1 bg-[#e6b33d] rounded-full" />}
      </button>

      {/* BOTÃO CENTRAL DE AÇÃO - Novo Registro */}
      <div className="tooltip tooltip-top before:font-black before:text-[10px] before:bg-[#d96831]" data-tip="NOVO REGISTRO">
        <button
          onClick={() => { onAddClick(); }}
          type="button"
          className="w-12 h-12 md:w-14 md:h-14 bg-[#d96831] rounded-full flex items-center justify-center text-white shadow-lg hover:rotate-90 hover:bg-[#995052] transition-all duration-500 active:scale-90"
        >
          <Plus className="w-8 h-8 stroke-[3px]" />
        </button>
      </div>

      {/* METAS - Target */}
      <button
        onClick={() => { setActiveTab('goals'); router.push('/metas'); }}
        type="button"
        className="group relative flex items-center justify-center p-2"
      >
        <Target className={getIconClass('goals')} />
        {activeTab === 'goals' && <span className="absolute -bottom-1 w-1 h-1 bg-[#e6b33d] rounded-full" />}
      </button>

      {/* LIMITES - Shield Alert (ou Settings) */}
      <button
        onClick={() => { setActiveTab('limits'); router.push('/limites'); }}
        type="button"
        className="group relative flex items-center justify-center p-2"
      >
        <ShieldAlert className={getIconClass('limits')} />
        {activeTab === 'limits' && <span className="absolute -bottom-1 w-1 h-1 bg-[#e6b33d] rounded-full" />}
      </button>

    </nav>
  );
};

export default FloatingNav;