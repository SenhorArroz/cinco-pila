"use client";
import React, { useState } from 'react';
import FloatingNav from '../_components/FloatingNav';

// Simulação de dados do backend (T3 Stack / Prisma)
interface Transaction {
  id: string;
  label: string;
  value: number;
  time: string;
  type: 'income' | 'expense';
}

const dailyExpenses: Transaction[] = [
  { id: '1', label: 'Almoço Executivo', value: 42.90, time: '12:30', type: 'expense' },
  { id: '2', label: 'Uber (Trabalho)', value: 18.50, time: '08:15', type: 'expense' },
  { id: '3', label: 'Café Espresso', value: 7.00, time: '15:40', type: 'expense' },
  { id: '4', label: 'Supermercado', value: 125.40, time: '18:20', type: 'expense' },
];

export default function DashboardCincoPila() {
    const [activeTab, setActiveTab] = useState<'home' | 'list' | 'goals' | 'limits'>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#172c3c] font-sans p-4 md:p-8 pb-32 overflow-x-hidden selection:bg-[#e6b33d]/30">
      
      {/* --- FLOATING NAV BAR --- */}
      <FloatingNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onAddClick={() => setIsModalOpen(true)} 
      />

      <div className="max-w-7xl mx-auto relative pt-4">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-10 md:mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#172c3c] rounded-xl flex items-center justify-center rotate-45 shadow-lg">
               <span className="text-white font-black text-lg -rotate-45">5P</span>
            </div>
            <h2 className="font-black tracking-[0.2em] text-[10px] uppercase opacity-40 hidden sm:block">Control Center</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black opacity-30 uppercase">Quarta-feira, 11 Março</p>
            <p className="font-black text-[#d96831]">MARÇO . 2026</p>
          </div>
        </header>

        {/* GRID PRINCIPAL */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUNA ESQUERDA: GASTOS DO DIA (DENSIDADE) */}
          <section className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-50">Gastos do Dia</h3>
                <span className="text-[10px] font-bold text-[#d96831]">TOTAL R$ 193,80</span>
              </div>
              <div className="space-y-4">
                {dailyExpenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between items-center group">
                    <div>
                      <p className="text-sm font-bold group-hover:text-[#d96831] transition-colors">{exp.label}</p>
                      <p className="text-[10px] opacity-40">{exp.time}</p>
                    </div>
                    <span className="font-black text-sm text-[#995052]">- {exp.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD FATURA ATUAL */}
            <div className="bg-[#274862] p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
              <p className="text-[10px] font-black uppercase opacity-50 mb-2">Fatura Atual (Cartão)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#e6b33d]">R$ 2.840</span>
                <span className="text-sm opacity-60">.90</span>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d96831] w-[65%]" />
                </div>
              </div>
              <div className="absolute top-[-20px] right-[-20px] text-6xl font-black opacity-5 rotate-12 group-hover:rotate-0 transition-transform">VISA</div>
            </div>
          </section>

          {/* COLUNA CENTRAL: O SALDO (HERO) */}
          <section className="lg:col-span-4 order-1 lg:order-2 flex flex-col items-center justify-center py-6">
            <div className="relative flex items-center justify-center w-full min-h-[300px]">
              {/* Órbitas Decorativas */}
              <div className="absolute w-[300px] h-[300px] border border-[#172c3c]/5 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-[240px] h-[240px] border-2 border-[#172c3c]/5 border-dashed rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              
              <div className="relative z-10 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-2 opacity-40">Saldo Atual</p>
                <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-[#172c3c]">
                  12<span className="text-[#d96831]">.</span>450
                </h1>
                <div className="mt-6 inline-flex flex-col items-center">
                   <p className="text-[10px] font-black uppercase opacity-30 mb-1">Saída do Dia</p>
                   <span className="bg-[#995052] text-white px-4 py-1 rounded-full text-xs font-black shadow-lg">
                     ↓ R$ 193,80
                   </span>
                </div>
              </div>
            </div>
          </section>

          {/* COLUNA DIREITA: METAS E INDICADORES */}
          <section className="lg:col-span-4 space-y-6 order-3">
            {/* CARD META ATUAL */}
            <div className="bg-[#172c3c] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Meta: Viagem Japão</p>
                    <h4 className="text-xl font-black text-[#e6b33d]">R$ 15.000</h4>
                  </div>
                  <span className="text-xs font-black opacity-40 italic">#2026</span>
                </div>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-4xl font-black">45%</span>
                  <span className="text-[10px] opacity-40 mb-1">COMPLETO</span>
                </div>
                <progress className="progress progress-warning w-full bg-white/10 h-3" value="45" max="100" />
                <p className="text-[10px] mt-4 opacity-40 uppercase font-bold">Faltam R$ 8.250,00</p>
              </div>
            </div>

            {/* MINI DASH ADICIONAL */}
            <div className="bg-[#d96831] p-6 rounded-[2rem] text-white shadow-xl">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black">JP</div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-70">Rendimento Previsto</p>
                    <p className="text-xl font-black italic">+ R$ 412,00</p>
                  </div>
               </div>
            </div>
          </section>

        </main>

        {/* FOOTER INFO: RESUMO DE INVESTIMENTOS */}
        <footer className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#172c3c]/10 pt-8">
          <div>
            <p className="text-[9px] font-black uppercase opacity-40">Investido</p>
            <p className="text-xl font-black text-[#274862]">R$ 45.201</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase opacity-40">Liquidez</p>
            <p className="text-xl font-black text-emerald-600">Alta</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase opacity-40">Pendências</p>
            <p className="text-xl font-black text-[#995052]">Nenhuma</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase opacity-40">Patrimônio</p>
            <p className="text-xl font-black text-[#172c3c]">R$ 57.651</p>
          </div>
        </footer>

      </div>
    </div>
  );
}