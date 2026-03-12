"use client";
import React, { useState } from 'react';
import FloatingNav from '../_components/FloatingNav'; 

// Tipagem para alinhar com seu Postgresql/Typescript
interface Transaction {
  id: string;
  label: string;
  value: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
}

export default function GestaoFinanceira() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', label: 'Freelance Design', value: 2500, date: '2026-03-10', category: 'Trampo', type: 'income' },
    { id: '2', label: 'Aluguel Loft', value: 1200, date: '2026-03-05', category: 'Moradia', type: 'expense' },
  ]);
  const [activeTab, setActiveTab] = useState<'home' | 'list' | 'goals' | 'limits'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#172c3c] font-sans p-4 md:p-10 pb-32">
      
      {/* --- FLOATING NAV BAR --- */}
      <FloatingNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddClick={() => setIsModalOpen(true)}
      />
      
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER DA ABA */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-[#172c3c]">
              Lançamentos<span className="text-[#d96831]">.</span>
            </h1>
            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Controle de fluxo de caixa</p>
          </div>
          
          {/* BOTÃO PARA ACIONAR MODAL (DAISY UI) */}
          <label htmlFor="modal-registro" className="btn bg-[#172c3c] hover:bg-[#274862] border-none text-white rounded-2xl px-8 shadow-lg">
            + Novo Registro
          </label>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* FORMULÁRIO DE FILTROS / SUMÁRIO (ESQUERDA) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#274862] p-8 rounded-[2.5rem] text-white shadow-xl">
              <h3 className="text-[10px] font-black uppercase opacity-50 mb-6 tracking-[0.2em]">Filtro Rápido</h3>
              <div className="space-y-4">
                <select className="select select-bordered w-full bg-white/10 border-white/10 text-white rounded-xl focus:outline-none">
                  <option disabled selected>Categoria</option>
                  <option>Moradia</option>
                  <option>Alimentação</option>
                  <option>Trampo</option>
                </select>
                <div className="flex gap-2">
                  <button className="btn btn-sm flex-1 bg-[#e6b33d] border-none text-[#172c3c] rounded-lg font-black">ENTRADAS</button>
                  <button className="btn btn-sm flex-1 bg-white/10 border-none text-white rounded-lg font-black">SAÍDAS</button>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5">
              <p className="text-[10px] font-black opacity-30 uppercase mb-2">Balanço do Período</p>
              <p className="text-3xl font-black text-[#172c3c]">R$ 1.300,00</p>
              <div className="mt-4 h-2 w-full bg-[#f0f2f5] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[70%]" />
              </div>
            </div>
          </aside>

          {/* LISTA DE TRANSAÇÕES (DIREITA) */}
          <section className="lg:col-span-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden border border-white shadow-sm">
              <table className="table w-full">
                <thead className="bg-[#172c3c]/5">
                  <tr className="border-none">
                    <th className="text-[10px] font-black uppercase opacity-40">Descrição</th>
                    <th className="text-[10px] font-black uppercase opacity-40">Valor</th>
                    <th className="text-[10px] font-black uppercase opacity-40 hidden md:table-cell">Data</th>
                    <th className="text-[10px] font-black uppercase opacity-40 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item) => (
                    <tr key={item.id} className="hover:bg-white/80 transition-colors border-b border-[#172c3c]/5">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-8 rounded-full ${item.type === 'income' ? 'bg-emerald-500' : 'bg-[#995052]'}`} />
                          <div>
                            <p className="font-bold text-sm">{item.label}</p>
                            <p className="text-[10px] opacity-40 uppercase font-black">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`font-black ${item.type === 'income' ? 'text-emerald-600' : 'text-[#995052]'}`}>
                        {item.type === 'income' ? '+' : '-'} R$ {item.value.toFixed(2)}
                      </td>
                      <td className="text-xs opacity-50 hidden md:table-cell font-mono">
                        {item.date}
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button className="btn btn-ghost btn-xs text-[#274862] hover:bg-[#274862]/10">EDIT</button>
                          <button className="btn btn-ghost btn-xs text-[#995052] hover:bg-[#995052]/10">DEL</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

      </div>

      {/* --- MODAL DE CADASTRO (DAISY UI) --- */}
      <input type="checkbox" id="modal-registro" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white rounded-[2.5rem] p-8">
          <h3 className="font-black text-2xl mb-6 text-[#172c3c]">Novo Lançamento</h3>
          
          <div className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-bold opacity-50 uppercase text-[10px]">Descrição</span></label>
              <input type="text" placeholder="Ex: Supermercado" className="input input-bordered w-full rounded-xl border-[#172c3c]/10 focus:border-[#d96831] focus:outline-none bg-[#f0f2f5]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-bold opacity-50 uppercase text-[10px]">Valor</span></label>
                <input type="number" placeholder="0.00" className="input input-bordered w-full rounded-xl border-[#172c3c]/10 bg-[#f0f2f5]" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-bold opacity-50 uppercase text-[10px]">Tipo</span></label>
                <select className="select select-bordered w-full rounded-xl border-[#172c3c]/10 bg-[#f0f2f5]">
                  <option>Entrada</option>
                  <option>Saída</option>
                </select>
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-bold opacity-50 uppercase text-[10px]">Categoria</span></label>
              <input type="text" placeholder="Ex: Lazer" className="input input-bordered w-full rounded-xl border-[#172c3c]/10 bg-[#f0f2f5]" />
            </div>
          </div>

          <div className="modal-action gap-3">
            <label htmlFor="modal-registro" className="btn btn-ghost rounded-xl px-6">Cancelar</label>
            <button className="btn bg-[#d96831] hover:bg-[#995052] border-none text-white rounded-xl px-8 shadow-lg">Salvar Registro</button>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="modal-registro">Close</label>
      </div>

    </div>
  );
}