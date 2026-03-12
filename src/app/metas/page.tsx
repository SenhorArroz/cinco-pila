"use client";
import React, { useState } from 'react';
import FloatingNav from '../_components/FloatingNav';

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  deadline: string;
  color: string;
}

export default function MetasCincoPila() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', title: 'Viagem Japão', current: 6750, target: 15000, deadline: 'Dez 2026', color: 'bg-[#e6b33d]' },
    { id: '2', title: 'Reserva de Emergência', current: 8000, target: 10000, deadline: 'Ago 2026', color: 'bg-[#d96831]' },
    { id: '3', title: 'MacBook Pro M3', current: 2000, target: 18000, deadline: 'Mar 2027', color: 'bg-[#995052]' },
  ]);
  const [activeTab, setActiveTab] = useState<'home' | 'list' | 'goals' | 'limits'>('goals');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#172c3c] font-sans p-4 md:p-10 pb-32">
      {/* --- FLOATING NAV BAR --- */}
      <FloatingNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onAddClick={() => setIsModalOpen(true)} 
      />
     
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER COM ESTILO EDITORIAL */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b-4 border-[#172c3c] pb-8">
          <div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">
              Metas<span className="text-[#d96831]">.</span>
            </h1>
            <p className="mt-2 font-bold opacity-40 tracking-[0.3em] text-xs">Um real a mais guardado nunca é demais</p>
          </div>
          <button className="btn bg-[#172c3c] text-white border-none rounded-full px-10 font-black hover:scale-105 transition-transform">
            + CRIAR NOVO OBJETIVO
          </button>
        </header>

        {/* GRID DE METAS - CARDS DIFERENTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {goals.map((goal) => {
            const percent = Math.round((goal.current / goal.target) * 100);
            
            return (
              <div key={goal.id} className="group relative bg-[#172c3c] rounded-[3rem] p-8 text-white overflow-hidden shadow-2xl transition-all hover:-translate-y-2">
                
                {/* Indicador Flutuante de Porcentagem */}
                <div className="absolute top-8 right-8 w-20 h-20 rounded-full border-2 border-white/10 flex items-center justify-center">
                  <span className="text-2xl font-black italic">{percent}%</span>
                </div>

                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{goal.deadline}</p>
                  <h3 className="text-3xl font-black leading-tight mb-8 group-hover:text-[#e6b33d] transition-colors">
                    {goal.title}
                  </h3>

                  <div className="space-y-6">
                    {/* Visualizador de Progresso Customizado */}
                    <div className="relative h-24 w-full bg-white/5 rounded-3xl p-4 flex flex-col justify-end overflow-hidden">
                      <div 
                        className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${goal.color}`} 
                        style={{ height: `${percent}%`, opacity: 0.2 }}
                      />
                      <p className="text-[10px] font-black opacity-40 mb-1">PROGRESSO ATUAL</p>
                      <p className="text-2xl font-black leading-none">
                        R$ {goal.current.toLocaleString()} <span className="text-xs opacity-30 font-normal">/ {goal.target.toLocaleString()}</span>
                      </p>
                    </div>

                    {/* AÇÕES DE EDIÇÃO RÁPIDA (DAISY UI) */}
                    <div className="flex gap-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <label 
                        htmlFor={`edit-modal-${goal.id}`} 
                        className="btn btn-sm flex-1 bg-white/10 border-none text-white rounded-xl hover:bg-[#e6b33d] hover:text-[#172c3c]"
                      >
                        AJUSTAR VALOR
                      </label>
                      <button className="btn btn-sm bg-[#995052]/20 border-none text-[#995052] rounded-xl hover:bg-[#995052] hover:text-white">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

                {/* MODAL DE EDIÇÃO DINÂMICO */}
                <input type="checkbox" id={`edit-modal-${goal.id}`} className="modal-toggle" />
                <div className="modal text-[#172c3c]">
                  <div className="modal-box bg-white rounded-[3rem] p-10 max-w-sm">
                    <h3 className="font-black text-2xl mb-2">Ajustar Meta</h3>
                    <p className="text-xs opacity-50 mb-8 uppercase font-bold tracking-widest">{goal.title}</p>
                    
                    <div className="space-y-8">
                      <div className="form-control">
                        <label className="label flex justify-between">
                          <span className="label-text font-black text-[10px] opacity-40">VALOR GUARDADO</span>
                          <span className="font-black text-[#d96831]">R$ {goal.current}</span>
                        </label>
                        {/* Range Slider do DaisyUI */}
                        <input type="range" min="0" max={goal.target} value={goal.current} className="range range-warning range-sm" />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-black text-[10px] opacity-40">DATA ALVO</span>
                        </label>
                        <input type="text" defaultValue={goal.deadline} className="input input-bordered w-full rounded-2xl font-bold bg-[#f0f2f5] border-none" />
                      </div>
                    </div>

                    <div className="modal-action">
                      <label htmlFor={`edit-modal-${goal.id}`} className="btn btn-block bg-[#172c3c] text-white rounded-2xl border-none">
                        ATUALIZAR OBJETIVO
                      </label>
                    </div>
                  </div>
                  <label className="modal-backdrop" htmlFor={`edit-modal-${goal.id}`}>Close</label>
                </div>
              </div>
            );
          })}

          {/* CARD DE "ADD NOVO" ESTILIZADO */}
          <div className="border-4 border-dashed border-[#172c3c]/10 rounded-[3rem] flex flex-col items-center justify-center p-10 group cursor-pointer hover:border-[#d96831]/30 transition-colors">
            <div className="w-16 h-16 bg-[#172c3c]/5 rounded-full flex items-center justify-center text-4xl font-light opacity-20 group-hover:scale-110 group-hover:opacity-100 transition-all">
              +
            </div>
            <p className="mt-4 font-black opacity-20 group-hover:opacity-100 uppercase tracking-tighter">Novo Projeto</p>
          </div>
        </div>

      </div>
    </div>
  );
}