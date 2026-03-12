"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  Target,
  ShieldAlert,
  CircleDollarSign
} from 'lucide-react';

export type Tab = 'home' | 'list' | 'goals' | 'limits';

interface FloatingNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onAddClick: () => void;
}

const FloatingNav = ({ activeTab, setActiveTab }: FloatingNavProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const getIconClass = (tab: Tab) =>
    `w-6 h-6 transition-all duration-300 ${activeTab === tab ? 'text-[#e6b33d] scale-110' : 'text-white/40 group-hover:text-white'
    }`;

  const actions = [
    { icon: <CircleDollarSign className="w-5 h-5" />, label: 'Operação', color: 'bg-[#274862]' },
    { icon: <Target className="w-5 h-5" />, label: 'Meta', color: 'bg-[#e6b33d]' },
    { icon: <ShieldAlert className="w-5 h-5" />, label: 'Limite', color: 'bg-[#995052]' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
      
      {/* BARRA DE AÇÕES HORIZONTAL (FUNDO LARANJA TRANSPARENTE) */}
      <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl bg-[#d96831]/20 backdrop-blur-xl border border-[#d96831]/30 transition-all duration-500 ease-out shadow-2xl ${
        isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'
      }`}>
        {actions.map((action, index) => (
          <button
            key={index}
            className="flex flex-col items-center gap-1 group transition-transform hover:scale-110 active:scale-95"
            onClick={() => setIsOpen(false)}
          >
            <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
              {action.icon}
            </div>
            <span className="text-[8px] font-black uppercase text-[#172c3c] tracking-tighter">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* NAVEGAÇÃO PRINCIPAL */}
      <nav className="bg-[#172c3c] px-6 py-3 md:px-8 md:py-4 rounded-full shadow-[0_20px_50px_rgba(23,44,60,0.4)] flex items-center gap-6 md:gap-8 border border-white/10 backdrop-blur-md relative">
        
        <button
          onClick={() => { setActiveTab('home'); router.push('/dashboard'); setIsOpen(false); }}
          className="group relative p-2"
        >
          <LayoutDashboard className={getIconClass('home')} />
          {activeTab === 'home' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#e6b33d] rounded-full shadow-[0_0_10px_#e6b33d]" />}
        </button>

        <button
          onClick={() => { setActiveTab('list'); router.push('/operacoes'); setIsOpen(false); }}
          className="group relative p-2"
        >
          <ArrowLeftRight className={getIconClass('list')} />
          {activeTab === 'list' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#e6b33d] rounded-full shadow-[0_0_10px_#e6b33d]" />}
        </button>

        {/* BOTÃO CENTRAL (CONTROLA O MENU) */}
        <div 
          className="tooltip tooltip-top before:font-black before:text-[10px] before:bg-[#d96831]" 
          data-tip={isOpen ? "FECHAR" : "NOVO REGISTRO"}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-500 border-4 border-[#172c3c] ${
              isOpen ? 'bg-[#995052] rotate-[135deg]' : 'bg-[#d96831] hover:scale-105'
            }`}
          >
            <Plus className="w-8 h-8 stroke-[3px]" />
          </button>
        </div>

        <button
          onClick={() => { setActiveTab('goals'); router.push('/metas'); setIsOpen(false); }}
          className="group relative p-2"
        >
          <Target className={getIconClass('goals')} />
          {activeTab === 'goals' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#e6b33d] rounded-full shadow-[0_0_10px_#e6b33d]" />}
        </button>

        <button
          onClick={() => { setActiveTab('limits'); router.push('/limites'); setIsOpen(false); }}
          className="group relative p-2"
        >
          <ShieldAlert className={getIconClass('limits')} />
          {activeTab === 'limits' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#e6b33d] rounded-full shadow-[0_0_10px_#e6b33d]" />}
        </button>
      </nav>
    </div>
  );
};

export default FloatingNav;