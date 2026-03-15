"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import FloatingNav, { type Tab } from "../_components/FloatingNav";


// Definimos as opções manualmente para evitar importar o @prisma/client no lado do cliente
const AVISO_TIPOS = ["AVISO", "VENCIMENTO", "COBRANCA"] as const;
const RECORRENCIA_TIPOS = ["NENHUMA", "DIARIA", "SEMANAL", "MENSAL", "ANUAL"] as const;

type AvisoTipo = (typeof AVISO_TIPOS)[number];
type Recorrencia = (typeof RECORRENCIA_TIPOS)[number];

export default function AvisosPage() {
  const [activeTab, setActiveTab] = useState<Tab>("avisos");
  const utils = api.useUtils();
  const { data: avisos, isLoading } = api.avisos.getAll.useQuery();

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    valor: 0,
    tipo: "AVISO" as AvisoTipo,
    recorrencia: "NENHUMA" as Recorrencia,
    data: format(new Date(), "yyyy-MM-dd"),
  });

  const createMutation = api.avisos.create.useMutation({
    onSuccess: () => {
      void utils.avisos.getAll.invalidate();
      setForm({ ...form, nome: "", valor: 0, descricao: "" });
    },
  });

  const resolveMutation = api.avisos.resolver.useMutation({
    onSuccess: () => void utils.avisos.getAll.invalidate(),
  });

  const deleteMutation = api.avisos.delete.useMutation({
    onSuccess: () => void utils.avisos.getAll.invalidate(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      data: new Date(form.data),
    });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-6 md:p-12 text-[#172c3c]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* COLUNA ESQUERDA: FORMULÁRIO */}
        <div className="lg:col-span-4 space-y-8">
          <header>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.8]">
              Avisos <span className="text-[#d96831]">&</span><br />Cobranças
            </h1>
          </header>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[3rem] border-[6px] border-[#172c3c] shadow-2xl space-y-4">
            <div className="form-control">
              <label className="label font-black text-[10px] uppercase italic opacity-40">Título</label>
              <input 
                type="text" required value={form.nome}
                onChange={e => setForm({...form, nome: e.target.value})}
                className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-bold bg-white" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label font-black text-[10px] uppercase italic opacity-40">Valor R$</label>
                <input 
                  type="number" step="0.01" value={form.valor}
                  onChange={e => setForm({...form, valor: Number(e.target.value)})}
                  className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-bold bg-white" 
                />
              </div>
              <div className="form-control">
                <label className="label font-black text-[10px] uppercase italic opacity-40">Data</label>
                <input 
                  type="date" value={form.data}
                  onChange={e => setForm({...form, data: e.target.value})}
                  className="input input-bordered border-2 border-[#172c3c] rounded-2xl font-bold bg-white" 
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label font-black text-[10px] uppercase italic opacity-40">Tipo</label>
              <select 
                className="select select-bordered border-2 border-[#172c3c] rounded-2xl font-black italic bg-white"
                value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as AvisoTipo})}
              >
                {AVISO_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-control">
              <label className="label font-black text-[10px] uppercase italic opacity-40 text-[#d96831]">Recorrência</label>
              <select 
                className="select select-bordered border-2 border-[#d96831] rounded-2xl font-black italic bg-white text-[#d96831]"
                value={form.recorrencia} onChange={e => setForm({...form, recorrencia: e.target.value as Recorrencia})}
              >
                {RECORRENCIA_TIPOS.map(r => <option key={r} value={r}>{r === 'NENHUMA' ? 'SÓ UMA VEZ' : r}</option>)}
              </select>
            </div>

            <button 
              disabled={createMutation.isPending}
              className="btn w-full bg-[#172c3c] hover:bg-[#d96831] text-white border-none rounded-2xl font-black italic text-lg"
            >
              {createMutation.isPending ? "SALVANDO..." : "REGISTRAR"}
            </button>
          </form>
        </div>

        {/* COLUNA DIREITA: LISTAGEM */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-xl font-black uppercase italic opacity-20 tracking-widest">Cronograma Ativo</h2>
          
          <div className="grid gap-4">
            {avisos?.map((aviso) => (
              <div key={aviso.id} className="group flex items-center gap-6 bg-white p-6 rounded-[2.5rem] border-2 border-black/5 hover:border-[#e6b33d] shadow-xl transition-all">
                <div className="bg-[#172c3c] text-white p-4 rounded-3xl flex flex-col items-center justify-center min-w-[100px] shadow-lg italic">
                  <span className="text-[10px] font-black uppercase opacity-50">{format(new Date(aviso.data), "MMM", { locale: ptBR })}</span>
                  <span className="text-3xl font-black leading-none">{format(new Date(aviso.data), "dd")}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-md text-white ${
                      aviso.tipo === 'COBRANCA' ? 'bg-[#d96831]' : aviso.tipo === 'VENCIMENTO' ? 'bg-[#995052]' : 'bg-[#172c3c]'
                    }`}>
                      {aviso.tipo}
                    </span>
                    {aviso.recorrencia !== 'NENHUMA' && (
                      <span className="text-[8px] font-black text-[#e6b33d] uppercase italic">● {aviso.recorrencia}</span>
                    )}
                  </div>
                  <h4 className="text-2xl font-black italic uppercase text-[#172c3c] leading-none">{aviso.nome}</h4>
                  <p className="text-xs font-bold opacity-30 italic">R$ {aviso.valor.toLocaleString('pt-BR')}</p>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => resolveMutation.mutate({ id: aviso.id })} className="btn btn-circle bg-emerald-500 border-none text-white">✓</button>
                  <button onClick={() => deleteMutation.mutate({ id: aviso.id })} className="btn btn-circle bg-[#f0f2f5] border-none text-[#995052]">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        <FloatingNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
    </div>
  );
}