"use client";
import React, { useState, useMemo } from 'react';
import FloatingNav from '../_components/FloatingNav'; 

// --- TYPES ---
interface Transaction {
  id: string;
  label: string;
  value: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
}

const INITIAL_DATA: Transaction[] = [
  { id: '1', label: 'Freelance Design', value: 2500, date: '2026-03-10', category: 'Trampo', type: 'income' },
  { id: '2', label: 'Aluguel Loft', value: 1200, date: '2026-03-05', category: 'Moradia', type: 'expense' },
];

export default function GestaoFinanceira() {
  const [activeTab, setActiveTab] = useState<'home' | 'list' | 'goals' | 'limits'>('list');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_DATA);
  
  // --- ESTADOS DO CRUD ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    label: '', value: 0, date: new Date().toISOString().split('T')[0]!, category: '', type: 'expense'
  });

  // --- CÁLCULOS DO ASIDE ---
  const totals = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'income') acc.income += curr.value;
      else acc.expense += curr.value;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const balance = totals.income - totals.expense;

  // --- HANDLERS ---
  const handleOpenModal = (item?: Transaction) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ ...item });
    } else {
      setEditingId(null);
      setFormData({ label: '', value: 0, date: new Date().toISOString().split('T')[0]!, category: '', type: 'expense' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setTransactions(prev => prev.map(t => t.id === editingId ? { ...formData, id: t.id } : t));
    } else {
      setTransactions(prev => [{ ...formData, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apagar esse registro?")) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#172c3c] font-sans p-4 md:p-10 pb-32">
      <FloatingNav activeTab={activeTab} setActiveTab={setActiveTab} onAddClick={() => handleOpenModal()} />
      
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
            <div className="bg-[#274862] p-8 rounded-[2.5rem] text-white shadow-xl animate-in slide-in-from-left duration-500">
              <h3 className="text-[10px] font-black uppercase opacity-50 mb-6 tracking-[0.2em]">Balanço Rápido</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold opacity-60">Entradas</span>
                  <span className="font-black text-emerald-400">+ R$ {totals.income.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-xs font-bold opacity-60">Saídas</span>
                  <span className="font-black text-[#995052]">- R$ {totals.expense.toFixed(2)}</span>
                </div>
                <div className="pt-2">
                  <p className="text-[10px] font-black opacity-40 uppercase mb-1">Saldo Atual</p>
                  <p className={`text-4xl font-black italic ${balance >= 0 ? 'text-[#e6b33d]' : 'text-red-400'}`}>
                    R$ {balance.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-black/5 group hover:border-[#172c3c] transition-colors">
              <p className="text-[10px] font-black opacity-30 uppercase mb-2">Saúde do Mês</p>
              <div className="flex items-end gap-2">
                 <span className="text-4xl font-black tracking-tighter">
                   {totals.income > 0 ? Math.round((balance / totals.income) * 100) : 0}%
                 </span>
                 <span className="text-[10px] font-bold opacity-40 mb-2 uppercase">Margem livre</span>
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
          <section className="lg:col-span-8 animate-in slide-in-from-bottom duration-700">
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-black/5">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-[#172c3c]/5 border-none">
                      <th className="p-6 text-[10px] font-black uppercase opacity-40">Item</th>
                      <th className="text-[10px] font-black uppercase opacity-40">Valor</th>
                      <th className="text-[10px] font-black uppercase opacity-40 hidden md:table-cell">Data</th>
                      <th className="text-[10px] font-black uppercase opacity-40 text-right p-6">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#172c3c]/5">
                    {transactions.map((item) => (
                      <tr key={item.id} className="group hover:bg-[#f0f2f5]/50 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-10 rounded-full ${item.type === 'income' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[#995052] shadow-[0_0_15px_rgba(153,80,82,0.3)]'}`} />
                            <div>
                              <p className="font-black text-[#172c3c] uppercase tracking-tighter text-base">{item.label}</p>
                              <p className="text-[10px] opacity-40 uppercase font-black tracking-widest">{item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className={`font-black italic text-lg ${item.type === 'income' ? 'text-emerald-600' : 'text-[#995052]'}`}>
                          {item.type === 'income' ? '+' : '-'} R$ {item.value.toLocaleString()}
                        </td>
                        <td className="text-[10px] font-black opacity-30 hidden md:table-cell uppercase">
                          {new Date(item.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="text-right p-6">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(item)} className="btn btn-ghost btn-xs font-black text-[#172c3c] hover:bg-[#172c3c] hover:text-white rounded-lg">EDIT</button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-xs font-black text-[#995052] hover:bg-[#995052] hover:text-white rounded-lg">DEL</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {transactions.length === 0 && (
                <div className="p-20 text-center opacity-20 font-black uppercase tracking-widest text-xs">
                  Nenhuma operação registrada.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* --- MODAL DE REGISTRO --- */}
      {isModalOpen && (
        <div className="modal modal-open backdrop-blur-sm transition-all">
          <div className="modal-box bg-white border-4 border-[#172c3c] rounded-[3rem] p-10 animate-in zoom-in-95">
            <h3 className="font-black text-3xl italic uppercase tracking-tighter mb-8 text-[#172c3c]">
              {editingId ? 'Ajustar Operação' : 'Novo Lançamento'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="form-control">
                <label className="label uppercase font-black text-[10px] opacity-40">O que aconteceu?</label>
                <input 
                  type="text" required placeholder="Ex: Venda de curso" 
                  className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-bold bg-[#f0f2f5] focus:outline-none" 
                  value={formData.label}
                  onChange={e => setFormData({...formData, label: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label uppercase font-black text-[10px] opacity-40">Quanto (R$)</label>
                  <input 
                    type="number" step="0.01" required placeholder="0.00" 
                    className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-[#f0f2f5]" 
                    value={formData.value}
                    onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                  />
                </div>
                <div className="form-control">
                  <label className="label uppercase font-black text-[10px] opacity-40">Natureza</label>
                  <select 
                    className="select select-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-[#f0f2f5]"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="expense">SAÍDA (-)</option>
                    <option value="income">ENTRADA (+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label uppercase font-black text-[10px] opacity-40">Data</label>
                  <input 
                    type="date" className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-bold bg-[#f0f2f5]" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="form-control">
                  <label className="label uppercase font-black text-[10px] opacity-40">Categoria</label>
                  <input 
                    type="text" placeholder="Lazer, Job..." 
                    className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-bold bg-[#f0f2f5]" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="modal-action mt-10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost font-black opacity-30">FECHAR</button>
                <button type="submit" className="btn bg-[#172c3c] text-white hover:bg-[#d96831] border-none rounded-2xl px-10 font-black flex-1 shadow-lg">
                  {editingId ? 'ATUALIZAR' : 'REGISTRAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}