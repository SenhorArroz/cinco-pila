"use client";
import React, { useState, useMemo } from 'react';
import FloatingNav, { type Tab } from '../_components/FloatingNav';
import { api } from '~/trpc/react';

// Paleta de cores oficial
const PALETTE = ["#172c3c", "#274862", "#995052", "#d96831", "#e6b33d"];

export default function GestaoFinanceira() {
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const utils = api.useUtils();

  // --- API QUERIES ---
  const { data: transactions = [], isLoading } = api.operacoes.getAll.useQuery();
  const { data: tags = [] } = api.transactionTag.getAll.useQuery();

  // --- ESTADOS DE FILTRO ---
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // --- MUTATIONS (OPERAÇÕES) ---
  const createOp = api.operacoes.create.useMutation({
    onSuccess: () => { void utils.operacoes.getAll.invalidate(); setIsOpModalOpen(false); },
  });
  const updateOp = api.operacoes.update.useMutation({
    onSuccess: () => { void utils.operacoes.getAll.invalidate(); setIsOpModalOpen(false); },
  });
  const deleteOp = api.operacoes.delete.useMutation({
    onSuccess: () => void utils.operacoes.getAll.invalidate(),
  });

  // --- MUTATIONS (TAGS) ---
  const createTag = api.transactionTag.create.useMutation({
    onSuccess: () => { void utils.transactionTag.getAll.invalidate(); resetTagForm(); },
  });
  const updateTag = api.transactionTag.update.useMutation({
    onSuccess: () => { void utils.transactionTag.getAll.invalidate(); resetTagForm(); },
  });
  const deleteTag = api.transactionTag.delete.useMutation({
    onSuccess: () => void utils.transactionTag.getAll.invalidate(),
  });

  // --- ESTADOS DOS FORMULÁRIOS ---
  const [isOpModalOpen, setIsOpModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  
  const [editingOpId, setEditingOpId] = useState<string | null>(null);
  const [opValueInput, setOpValueInput] = useState(""); 
  const [opFormData, setOpFormData] = useState({
    title: '', description: '', type: 'EXPENSE' as 'INCOME' | 'EXPENSE', tagId: ''
  });

  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagFormData, setTagFormData] = useState({ name: '', color: '#172c3c' });

  // --- LOGICA DE FILTRO ---
  const toggleTagFilter = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const filteredTransactions = useMemo(() => {
    if (selectedTagIds.length === 0) return transactions;
    return transactions.filter(item => item.tagId && selectedTagIds.includes(item.tagId));
  }, [transactions, selectedTagIds]);

  // --- CÁLCULOS (Dashboards fixos no total geral) ---
  const totals = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'INCOME') acc.income += curr.value;
      else acc.expense += curr.value;
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const balance = totals.income - totals.expense;

  // --- HANDLERS ---
  const handleOpenOpModal = (item?: any) => {
    if (item) {
      setEditingOpId(item.id);
      setOpFormData({ title: item.title, description: item.description ?? '', type: item.type, tagId: item.tagId ?? '' });
      setOpValueInput(item.value.toString());
    } else {
      setEditingOpId(null);
      setOpFormData({ title: '', description: '', type: 'EXPENSE', tagId: '' });
      setOpValueInput("");
    }
    setIsOpModalOpen(true);
  };

  const handleSaveOp = (e: React.FormEvent) => {
    e.preventDefault();
    const finalValue = parseFloat(opValueInput.replace(',', '.'));
    if (isNaN(finalValue)) return alert("Valor inválido");
    const payload = { ...opFormData, value: finalValue };
    if (editingOpId) updateOp.mutate({ id: editingOpId, ...payload });
    else createOp.mutate(payload);
  };

  const resetTagForm = () => {
    setTagFormData({ name: '', color: '#172c3c' });
    setEditingTagId(null);
  };

  const handleSaveTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTagId) updateTag.mutate({ id: editingTagId, ...tagFormData });
    else createTag.mutate(tagFormData);
  };

  return (
    <div className="min-h-screen p-4 md:p-4 lg:p-0 bg-[#f0f2f5] text-[#172c3c] font-sans">
      <div className="h-2 absolute top-0 left-0 w-full bg-gradient-to-r from-[#172c3c] via-[#d96831] to-[#e6b33d]" />
      <div className='p-10 pb-2'></div>
      <FloatingNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-6xl mx-auto animate-in fade-in duration-700">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-8 border-[#172c3c] pb-4 mb-12 gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
              Operações<span className="text-[#d96831]">$</span>
            </h1>
            <p className="mt-2 font-bold opacity-40 tracking-[0.3em] text-[10px] uppercase">Fluxo de Caixa Bruto</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsTagModalOpen(true)} className="btn bg-white border-4 border-[#172c3c] text-[#172c3c] rounded-2xl px-6 font-black shadow-sm">TAGS</button>
            <button onClick={() => handleOpenOpModal()} className="btn bg-[#172c3c] hover:bg-[#d96831] border-none text-white rounded-2xl px-8 shadow-lg font-black transition-all">
              + NOVO REGISTRO
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ASIDE DE RESUMO */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#274862] p-8 rounded-[2.5rem] text-white shadow-xl">
              <h3 className="text-[10px] font-black uppercase opacity-50 mb-6 tracking-[0.2em]">Balanço Rápido</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-emerald-400">
                  <span className="text-xs font-bold opacity-60 text-white">Entradas</span>
                  <span className="font-black">+ R$ {totals.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4 text-[#995052]">
                  <span className="text-xs font-bold opacity-60 text-white">Saídas</span>
                  <span className="font-black">- R$ {totals.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-2">
                  <p className="text-[10px] font-black opacity-40 uppercase mb-1">Saldo em Conta</p>
                  <p className={`text-4xl font-black italic ${balance >= 0 ? 'text-[#e6b33d]' : 'text-red-400'}`}>
                    R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  style={{ width: `${Math.max(0, Math.min(100, totals.income > 0 ? (balance / totals.income) * 100 : 0))}%` }}
                />
              </div>
            </div>
          </aside>

          {/* TABELA E FILTROS */}
          <section className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap items-center gap-2 px-2 overflow-x-auto pb-2 custom-scrollbar">
              <span className="text-[9px] font-black uppercase opacity-40 mr-2 tracking-widest whitespace-nowrap">Filtrar:</span>
              <button 
                onClick={() => setSelectedTagIds([])}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all border-2 ${selectedTagIds.length === 0 ? 'bg-[#172c3c] border-[#172c3c] text-white' : 'bg-white border-[#172c3c]/10 opacity-60 hover:opacity-100'}`}
              >
                Todas
              </button>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTagFilter(tag.id)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all border-2 flex items-center gap-2 whitespace-nowrap`}
                  style={{ 
                    borderColor: selectedTagIds.includes(tag.id) ? tag.color : 'transparent',
                    backgroundColor: selectedTagIds.includes(tag.id) ? `${tag.color}15` : 'white',
                    color: selectedTagIds.includes(tag.id) ? tag.color : '#172c3c',
                    opacity: selectedTagIds.length === 0 || selectedTagIds.includes(tag.id) ? 1 : 0.4
                  }}
                >
                  <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </button>
              ))}
            </div>

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
                      {filteredTransactions.map((item) => {
                        const tag = tags.find(t => t.id === item.tagId);
                        return (
                          <tr key={item.id} className="group hover:bg-[#f0f2f5]/50 transition-colors">
                            <td className="p-6">
                              <div className="flex items-center gap-4">
                                <div className="w-3 h-10 rounded-full" style={{ backgroundColor: tag?.color ?? (item.type === 'INCOME' ? '#10b981' : '#995052') }} />
                                <div>
                                  <p className="font-black text-[#172c3c] uppercase tracking-tighter text-base">{item.title}</p>
                                  <div className="flex gap-2 items-center">
                                    <p className="text-[10px] opacity-40 uppercase font-black tracking-widest">{item.description}</p>
                                    {tag && <span className="text-[8px] font-black px-1.5 py-0.5 rounded border border-black/10 uppercase" style={{ color: tag.color, borderColor: `${tag.color}33` }}>{tag.name}</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className={`font-black italic text-lg ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-[#995052]'}`}>
                              {item.type === 'INCOME' ? '+' : '-'} R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="text-right p-6">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenOpModal(item)} className="btn btn-ghost btn-xs font-black text-[#172c3c]">EDIT</button>
                                <button onClick={() => { if (confirm("Apagar?")) deleteOp.mutate({ id: item.id }) }} className="btn btn-ghost btn-xs font-black text-[#995052]">DEL</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

     {/* --- MODAL OPERAÇÃO --- */}
{isOpModalOpen && (
  <div className="modal modal-open backdrop-blur-sm p-4">
    <div className="modal-box bg-white border-4 border-[#172c3c] rounded-[3rem] p-8 max-w-lg w-full">
      {/* Título centralizado na grid */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        <h3 className="font-black text-2xl col-span-6 text-center md:text-3xl italic uppercase text-[#172c3c]">
          {editingOpId ? 'Ajustar Registro' : 'Lançar no Caixa'}
        </h3>
      </div>

      <form onSubmit={handleSaveOp} className="grid grid-cols-6 gap-x-4 gap-y-2 md:gap-y-4">
        {/* Título: Ocupa tudo */}
        <div className="form-control col-span-6">
          <label className="label uppercase font-black text-[10px] opacity-40">Título</label>
          <input 
            type="text" 
            required 
            className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-bold bg-[#f0f2f5] w-full" 
            value={opFormData.title} 
            onChange={e => setOpFormData({ ...opFormData, title: e.target.value })} 
          />
        </div>

        {/* Valor: Metade */}
        <div className="form-control col-span-3">
          <label className="label uppercase font-black text-[10px] opacity-40">Valor (R$)</label>
          <input 
            type="text" 
            inputMode="decimal" 
            required 
            className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-[#f0f2f5] w-full" 
            value={opValueInput} 
            onChange={e => setOpValueInput(e.target.value.replace(/[^0-9.,]/g, ""))} 
          />
        </div>

        {/* Tipo: Metade */}
        <div className="form-control col-span-3">
          <label className="label uppercase font-black text-[10px] opacity-40">Tipo</label>
          <select 
            className="select select-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-[#f0f2f5] w-full" 
            value={opFormData.type} 
            onChange={e => setOpFormData({ ...opFormData, type: e.target.value as any })}
          >
            <option value="EXPENSE">SAÍDA (-)</option>
            <option value="INCOME">ENTRADA (+)</option>
          </select>
        </div>

        {/* Tag: Ocupa tudo */}
        <div className="form-control col-span-6">
          <label className="label uppercase font-black text-[10px] opacity-40">Etiqueta (Tag)</label>
          <select 
            className="select select-bordered border-2 border-[#172c3c] rounded-2xl font-black bg-[#f0f2f5] w-full" 
            value={opFormData.tagId} 
            onChange={e => setOpFormData({ ...opFormData, tagId: e.target.value })}
          >
            <option value="">Nenhuma Tag</option>
            {tags.map(tag => <option key={tag.id} value={tag.id}>{tag.name.toUpperCase()}</option>)}
          </select>
        </div>

        {/* Descrição: Ocupa tudo */}
        <div className="form-control col-span-6">
          <label className="label uppercase font-black text-[10px] opacity-40">Descrição</label>
          <input 
            type="text" 
            required 
            className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-bold bg-[#f0f2f5] w-full" 
            value={opFormData.description} 
            onChange={e => setOpFormData({ ...opFormData, description: e.target.value })} 
          />
        </div>

        {/* Ações: Ocupa tudo */}
        <div className="col-span-6 flex flex-col md:flex-row gap-2 mt-6">
          <button 
            type="button" 
            onClick={() => setIsOpModalOpen(false)} 
            className="btn btn-ghost font-black opacity-30 order-2 md:order-1"
          >
            FECHAR
          </button>
          <button 
            type="submit" 
            className="btn bg-[#172c3c] text-white border-none rounded-2xl px-10 font-black flex-1 order-1 md:order-2 uppercase"
          >
            Confirmar
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* --- MODAL TAGS --- */}
      {isTagModalOpen && (
        <div className="modal modal-open backdrop-blur-sm p-4">
          <div className="modal-box bg-white border-4 border-[#172c3c] rounded-[3.5rem] p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-2xl italic uppercase text-[#172c3c]">Tags do Sistema</h3>
              <button onClick={() => { setIsTagModalOpen(false); resetTagForm(); }} className="btn btn-circle btn-ghost font-black">✕</button>
            </div>
            <form onSubmit={handleSaveTag} className="bg-[#f0f2f5] p-6 rounded-[2rem] border-2 border-dashed border-[#172c3c]/20 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="form-control">
                  <label className="label uppercase font-black text-[10px] opacity-40">Nome da Tag</label>
                  <input type="text" required className="input input-bordered border-2 border-[#172c3c] rounded-xl font-bold bg-white" value={tagFormData.name} onChange={e => setTagFormData({ ...tagFormData, name: e.target.value })} />
                </div>
                <div className="form-control">
                  <label className="label uppercase font-black text-[10px] opacity-40">Cor (Paleta ou Seletor)</label>
                  <div className="flex items-center gap-3 bg-white p-2 rounded-xl border-2 border-[#172c3c]/10">
                    <div className="flex gap-1 flex-wrap">
                      {PALETTE.map(color => (
                        <button key={color} type="button" onClick={() => setTagFormData({ ...tagFormData, color })} className={`w-7 h-7 rounded-full border-2 transition-transform ${tagFormData.color === color ? 'border-[#172c3c] scale-110 shadow-sm' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <div className="divider divider-horizontal mx-0"></div>
                    <input type="color" className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0" value={tagFormData.color} onChange={e => setTagFormData({ ...tagFormData, color: e.target.value })} />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn bg-[#172c3c] text-white w-full mt-8 rounded-xl font-black uppercase">
                {editingTagId ? 'Atualizar Tag' : 'Criar Tag'}
              </button>
              {editingTagId && <button type="button" onClick={resetTagForm} className="btn btn-ghost btn-xs w-full mt-2 font-black opacity-30">CANCELAR EDIÇÃO</button>}
            </form>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {tags?.map(tag => (
                <div key={tag.id} className="flex justify-between items-center bg-white border-2 border-[#172c3c]/5 p-4 rounded-2xl hover:border-[#172c3c]/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: tag.color }} />
                    <span className="font-black uppercase text-sm tracking-tight">{tag.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingTagId(tag.id); setTagFormData({ name: tag.name, color: tag.color }); }} className="btn btn-ghost btn-xs font-black text-[#172c3c]">EDIT</button>
                    <button onClick={() => { if(confirm("Apagar tag permanentemente?")) deleteTag.mutate({ id: tag.id }) }} className="btn btn-ghost btn-xs font-black text-[#995052]">DEL</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className='p-10 pb-32'></div>
    </div>
  );
}