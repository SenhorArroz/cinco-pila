"use client";
import React, { useState } from 'react';
import FloatingNav from '../_components/FloatingNav';

interface Budget {
  id: string;
  label: string;
  spent: number;
  limit: number;
  period: 'Diário' | 'Semanal' | 'Mensal';
  category: string;
}

const budgets: Budget[] = [
  { id: '1', label: 'Transporte (Ônibus)', spent: 145.20, limit: 200, period: 'Mensal', category: 'Essencial' },
  { id: '2', label: 'Alimentação Fora', spent: 380, limit: 400, period: 'Semanal', category: 'Lazer' },
  { id: '3', label: 'Margem de Segurança', spent: 50, limit: 500, period: 'Mensal', category: 'Reserva' },
  { id: '4', label: 'Assinaturas Digitais', spent: 89.90, limit: 100, period: 'Mensal', category: 'Fixo' },
];

export default function LimitesCincoPila() {
  // Estado para controlar a aba ativa na Nav Bar
  const [activeTab, setActiveTab] = useState<'home' | 'list' | 'goals' | 'limits'>('limits');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#172c3c] font-sans p-4 md:p-10 pb-32">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER BRUTALISTA */}
        <header className="mb-12 relative">
          <div className="flex justify-between items-end border-b-8 border-[#172c3c] pb-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
              Limites<span className="text-[#d96831]">/</span>
            </h1>
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">Status_Geral</p>
              <p className="font-black text-[#995052]">3 ALERTAS ATIVOS</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* CARD DE ADICIONAR NOVO LIMITE */}
          <button className="h-full min-h-[200px] border-4 border-dashed border-[#172c3c]/20 rounded-[2.5rem] flex flex-col items-center justify-center group hover:border-[#d96831] transition-all">
            <span className="text-4xl font-light text-[#172c3c]/20 group-hover:text-[#d96831]">+</span>
            <span className="text-[10px] font-black opacity-20 group-hover:opacity-100 uppercase mt-2">Definir Teto</span>
          </button>

          {budgets.map((b) => {
            const usage = (b.spent / b.limit) * 100;
            const isCritical = usage > 85;

            return (
              <div key={b.id} className={`p-8 rounded-[2.5rem] shadow-2xl transition-all relative overflow-hidden ${isCritical ? 'bg-[#995052] text-white scale-105 z-10' : 'bg-white text-[#172c3c]'}`}>
                
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${isCritical ? 'bg-white/20' : 'bg-[#172c3c]/5'}`}>
                      {b.period}
                    </span>
                    <h3 className="text-xl font-black mt-3 leading-tight uppercase tracking-tighter">{b.label}</h3>
                  </div>
                  {isCritical && <span className="animate-ping absolute top-4 right-4 h-2 w-2 rounded-full bg-white opacity-75"></span>}
                </div>

                {/* Visualização de Consumo */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black opacity-40 uppercase">Gasto</p>
                      <p className="text-2xl font-black italic">R$ {b.spent.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black opacity-40 uppercase">Teto</p>
                      <p className="text-sm font-bold opacity-60">R$ {b.limit}</p>
                    </div>
                  </div>

                  {/* Barra de Progresso Customizada */}
                  <div className={`h-4 w-full rounded-full overflow-hidden p-1 border ${isCritical ? 'border-white/20' : 'border-[#172c3c]/10'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-[#e6b33d]' : 'bg-[#172c3c]'}`} 
                      style={{ width: `${Math.min(usage, 100)}%` }}
                    />
                  </div>

                  <p className={`text-[10px] font-black uppercase tracking-widest ${isCritical ? 'text-white' : 'opacity-40'}`}>
                    {usage >= 100 ? 'LIMITE EXCEDIDO' : `RESTAM R$ ${(b.limit - b.spent).toFixed(2)}`}
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="mt-8 flex gap-2">
                   <button className={`btn btn-xs flex-1 rounded-lg border-none ${isCritical ? 'bg-white text-[#995052]' : 'bg-[#172c3c] text-white'}`}>
                     AJUSTAR
                   </button>
                   <button className={`btn btn-xs rounded-lg border-none ${isCritical ? 'bg-white/20 text-white' : 'bg-[#f0f2f5] text-[#172c3c]'}`}>
                     ✕
                   </button>
                </div>
              </div>
            );
          })}

        </div>

        {/* SEÇÃO DE MARGEM DE MANOBRA */}
        <section className="mt-16 bg-[#274862] rounded-[3rem] p-10 text-white relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="max-w-md">
                <h2 className="text-3xl font-black uppercase italic mb-4">Margem de Manobra Automática</h2>
                <p className="text-sm opacity-60 leading-relaxed">
                  Este valor é calculado subtraindo todos os seus limites e gastos fixos do seu saldo total. 
                </p>
              </div>
              <div className="text-center md:text-right">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-2">Disponível para Hoje</p>
                 <div className="text-6xl md:text-8xl font-black text-[#e6b33d] tracking-tighter">
                   R$ 142<span className="text-white">,00</span>
                 </div>
              </div>
           </div>
           <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#172c3c] rounded-full blur-[100px] opacity-50 pointer-events-none" />
        </section>

      </div>

      {/* --- FLOATING NAV BAR --- */}
      <FloatingNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onAddClick={() => setIsModalOpen(true)} 
      />
    </div>
  );
}