"use client";
import React, { useState, useMemo } from 'react';
import FloatingNav, { type Tab } from '../_components/FloatingNav';
import { api } from '~/trpc/react';

export default function GestaoFinanceira() {
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const utils = api.useUtils();

  // --- QUERIES & MUTATIONS ---
  const { data: transactions = [], isLoading } = api.operacoes.getAll.useQuery();

  const createOp = api.operacoes.create.useMutation({
    onSuccess: () => {
      void utils.operacoes.getAll.invalidate();
      setIsModalOpen(false);
    },
  });

  const updateOp = api.operacoes.update.useMutation({
    onSuccess: () => {
      void utils.operacoes.getAll.invalidate();
      setIsModalOpen(false);
    },
  });

  const deleteOp = api.operacoes.delete.useMutation({
    onSuccess: () => void utils.operacoes.getAll.invalidate(),
  });

  // --- ESTADOS DO MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: 0,
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE'
  });

  // --- CÁLCULOS ---
  const totals = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'INCOME') acc.income += curr.value;
      else acc.expense += curr.value;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const balance = totals.income - totals.expense;

  // --- HANDLERS ---
  const handleOpenModal = (item?: (typeof transactions)[0]) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        title: item.title,
        description: item.description ?? '',
        value: item.value,
        type: item.type as 'INCOME' | 'EXPENSE',
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', value: 0, type: 'EXPENSE' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateOp.mutate({ id: editingId, ...formData });
    } else {
      createOp.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-4 lg:p-0 sm:p-0 bg-[#f0f2f5] text-[#172c3c] font-sans">
      <div className="h-2 absolute top-0 left-0 min-w-screen bg-gradient-to-r from-[#172c3c] via-[#d96831] to-[#e6b33d]" />
      <div className='p-4 md:p-10 pb-2'></div>
      <FloatingNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-6xl mx-auto animate-in fade-in duration-700">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-8 border-[#172c3c] pb-4 mb-12 gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
              Operações<span className="text-[#d96831]">$</span>
            </h1>
            <p className="mt-2 font-bold opacity-40 tracking-[0.3em] text-[10px] uppercase">Fluxo de Caixa Bruto</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn bg-[#172c3c] hover:bg-[#d96831] border-none text-white rounded-2xl px-8 shadow-lg font-black transition-all">
            + NOVO REGISTRO
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ASIDE DE RESUMO */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#274862] p-8 rounded-[2.5rem] text-white shadow-xl">
              <h3 className="text-[10px] font-black uppercase opacity-50 mb-6 tracking-[0.2em]">Balanço Rápido</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="text-xs font-bold opacity-60 text-white">Entradas</span>
                  <span className="font-black">+ R$ {totals.income.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4 text-[#995052]">
                  <span className="text-xs font-bold opacity-60 text-white">Saídas</span>
                  <span className="font-black">- R$ {totals.expense.toFixed(2)}</span>
                </div>
                <div className="pt-2">
                  <p className="text-[10px] font-black opacity-40 uppercase mb-1">Saldo em Conta</p>
                  <p className={`text-4xl font-black italic ${balance >= 0 ? 'text-[#e6b33d]' : 'text-red-400'}`}>
                    R$ {balance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-black/5">
              <p className="text-[10px] font-black opacity-30 uppercase mb-2">Margem de Lucro</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black tracking-tighter">
                  {totals.income > 0 ? Math.round((balance / totals.income) * 100) : 0}%
                </span>
              </div>
              <div className="mt-4 h-3 w-full bg-[#f0f2f5] rounded-full overflow-hidden p-1 border border-black/5">
                <div
                  className="h-full bg-[#172c3c] rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(0, Math.min(100, (balance / totals.income) * 100))}%` }}
                />
              </div>
            </div>
          </aside>

          {/* TABELA DE OPERAÇÕES */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-black/5 min-h-[400px]">
              {isLoading ? (
                <div className="p-20 text-center animate-pulse font-black opacity-20 uppercase">Carregando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-[#172c3c]/5 border-none">
                        <th className="p-6 text-[10px] font-black uppercase opacity-40 text-[#172c3c]">Item</th>
                        <th className="text-[10px] font-black uppercase opacity-40 text-[#172c3c]">Valor</th>
                        <th className="text-[10px] font-black uppercase opacity-40 text-right p-6 text-[#172c3c]">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#172c3c]/5">
                      {transactions.map((item) => (
                        <tr key={item.id} className="group hover:bg-[#f0f2f5]/50 transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-3 h-10 rounded-full ${item.type === 'INCOME' ? 'bg-emerald-500' : 'bg-[#995052]'}`} />
                              <div>
                                <p className="font-black text-[#172c3c] uppercase tracking-tighter text-base">{item.title}</p>
                                <p className="text-[10px] opacity-40 uppercase font-black tracking-widest">{item.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className={`font-black italic text-lg ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-[#995052]'}`}>
                            {item.type === 'INCOME' ? '+' : '-'} R$ {item.value.toLocaleString()}
                          </td>
                          <td className="text-right p-6">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenModal(item)} className="btn btn-ghost btn-xs font-black text-[#172c3c]">EDIT</button>
                              <button
                                onClick={() => { if (confirm("Apagar?")) deleteOp.mutate({ id: item.id }) }}
                                className="btn btn-ghost btn-xs font-black text-[#995052]"
                              >
                                DEL
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="modal modal-open backdrop-blur-sm">
          <div className="modal-box bg-white border-4 border-[#172c3c] rounded-[3rem] p-10">
            <h3 className="font-black text-3xl italic uppercase mb-8 text-[#172c3c]">
              {editingId ? 'Ajustar Registro' : 'Lançar no Caixa'}
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="form-control">
                <label className="label uppercase font-black text-[10px] opacity-40">Título</label>
                <input
                  type="text" required className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-bold bg-[#f0f2f5]"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label uppercase font-black text-[10px] opacity-40">Valor (R$)</label>
                  <input
                    type="number" step="0.01" required className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-[#f0f2f5]"
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                  />
                </div>
                <div className="form-control">
                  <label className="label uppercase font-black text-[10px] opacity-40">Tipo</label>
                  <select
                    className="select select-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-[#f0f2f5]"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="EXPENSE">SAÍDA (-)</option>
                    <option value="INCOME">ENTRADA (+)</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label uppercase font-black text-[10px] opacity-40">Descrição / Categoria</label>
                <input
                  type="text" required className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-bold bg-[#f0f2f5]"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost font-black opacity-30">FECHAR</button>
                <button
                  disabled={createOp.isPending || updateOp.isPending}
                  type="submit"
                  className="btn bg-[#172c3c] text-white border-none rounded-2xl px-10 font-black flex-1"
                >
                  {(createOp.isPending || updateOp.isPending) ? 'SALVANDO...' : 'CONFIRMAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className='p-5 md:p-15 pb-32'></div>

    </div>
  );
}