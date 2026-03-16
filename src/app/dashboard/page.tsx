"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { 
  TrendingUp, Zap, Target, Send, 
  Bot, Bell, CheckCircle2, ArrowUpCircle, ArrowDownCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format, isToday } from "date-fns";
import dynamic from "next/dynamic";


// --- COMPONENTE DE GRÁFICO ---
const ChartContainer = dynamic(() => import("recharts").then((re) => {
  const { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } = re;
  
  function InternalChart({ data, onSelect }: { data: any[], onSelect: (mes: any) => void }) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 900, fill: "#172c3c", opacity: 0.3 }} 
          />
          <Tooltip 
            cursor={{ fill: "#f0f2f5", radius: 10 }} 
            content={({ active, payload }) => {
              if (active && payload?.[0]) {
                return (
                  <div className="bg-[#172c3c] px-3 py-2 rounded-xl shadow-xl border border-white/10">
                    <p className="text-[10px] font-black text-[#e6b33d] uppercase mb-1">{payload[0].payload.nameFull}</p>
                    <p className="text-white font-black text-xs">R$ {Number(payload[0].value).toLocaleString("pt-BR")}</p>
                    <p className="text-[8px] text-white/50 uppercase mt-1 italic">Clique para detalhes</p>
                  </div>
                );
              }
              return null;
            }} 
          />
          <Bar 
            dataKey="value" 
            radius={[10, 10, 10, 10]} 
            barSize={32} 
            onClick={(data) => onSelect(data)}
            className="cursor-pointer"
          >
            {data.map((entry: any, index: number) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isAtual ? "#d96831" : "#172c3c"} 
                fillOpacity={entry.isAtual ? 1 : 0.08}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return InternalChart;
}), { 
  ssr: false, 
  loading: () => <div className="h-full w-full bg-slate-50 animate-pulse rounded-[2rem]" /> 
});

import FloatingNav, { type Tab } from "../_components/FloatingNav";
import DashBoardLimit from "../_components/DashBoardLimit";
import MetasDashboard from "../_components/MetasDashboard";

// --- CARROSSEL ---
const AutoCarousel = ({ children, autoScrollSpeed = 5000, step = 340 }: { children: React.ReactNode, autoScrollSpeed?: number, step?: number }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: step, behavior: "smooth" });
        }
      }
    }, autoScrollSpeed);
    return () => clearInterval(interval);
  }, [isPaused, autoScrollSpeed, step]);
  return (
    <div ref={scrollRef} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} className="carousel carousel-center w-full gap-6 pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory">{children}</div>
  );
};


export default function DashboardCincoPila() {
  
  const utils = api.useUtils();
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  
  // ESTADOS DA IA
  const [geminiPrompt, setGeminiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("Diz aí, meu nobre! Como tá o patrimônio hoje?");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [mesDetalhado, setMesDetalhado] = useState<any>(null);

  useEffect(() => { setMounted(true); }, []);
  const isReady = mounted && status === "authenticated";

  // QUERIES
  const { data: todasOperacoes } = api.operacoes.getAll.useQuery(undefined, { enabled: isReady });
  const { data: saldoAtual = 0 } = api.operacoes.saldoAtual.useQuery(undefined, { enabled: isReady });
  const { data: limits = [] } = api.limites.getAll.useQuery(undefined, { enabled: isReady });
  const { data: goals = [] } = api.metas.getAll.useQuery(undefined, { enabled: isReady });
  const { data: avisosDB = [] } = api.avisos.getAll.useQuery(undefined, { enabled: isReady });

  // MUTATIONS
  const resolverAviso = api.avisos.resolver.useMutation({ onSuccess: () => { void utils.avisos.getAll.invalidate(); } });

  const balancoHoje = useMemo(() => {
    if (!todasOperacoes) return { entradas: 0, gastos: 0, total: 0 };
    const opsHoje = todasOperacoes.filter(op => isToday(new Date(op.createdAt)));
    const entradas = opsHoje.filter(op => op.type === "INCOME").reduce((acc, curr) => acc + curr.value, 0);
    const gastos = opsHoje.filter(op => op.type === "EXPENSE").reduce((acc, curr) => acc + curr.value, 0);
    return { entradas, gastos, total: entradas + gastos };
  }, [todasOperacoes]);

  // FUNÇÃO DE ENVIO PARA A IA (VIA FETCH DIRETO NA API)
  const handleSendAI = async () => {
    if (!geminiPrompt.trim() || isAiLoading) return;

    const currentPrompt = geminiPrompt;
    setGeminiPrompt("");
    setIsAiLoading(true);
    setAiResponse("Deixa eu dar um confere aqui nos seus números... 🧐");

    try {
      // Preparamos o contexto financeiro para a IA
      const financeData = {
        saldo: saldoAtual,
        hoje: balancoHoje,
        limites: limits.map(l => ({ nome: l.title, max: l.limitAmount, usado: l.currentSpent })),
        metas: goals.map(g => ({ nome: g.title, alvo: g.targetAmount, progresso: g.currentAmount })),
        avisos: avisosDB.map(a => ({ nome: a.nome, data: a.data, pago: a.pago })),
        operacoes: todasOperacoes?.map(o => ({nome: o.title, valor: o.value, tipo: o.type, data: o.createdAt})),
      };

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt, financeData }),
      });

      const data = await response.json();

      if (data.text) {
        setAiResponse(data.text);
      } else {
        setAiResponse("Deu um erro na comunicação com o Google. Tenta de novo?");
      }
    } catch (error) {
      console.error("Erro IA:", error);
      setAiResponse("Ih, meu processador fritou. Tenta mandar de novo?");
    } finally {
      setIsAiLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!todasOperacoes || todasOperacoes.length === 0) return [];
    const mesesNomes = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const mesesNomesFull = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const hoje = new Date();
    
    const dados = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
      const mesRef = d.getMonth();
      const anoRef = d.getFullYear();
      const opsMes = todasOperacoes.filter(op => {
        const opDate = new Date(op.createdAt);
        return opDate.getMonth() === mesRef && opDate.getFullYear() === anoRef;
      });
      const totalEntradas = opsMes.filter(op => op.type === "INCOME").reduce((acc, curr) => acc + curr.value, 0);
      const totalSaidas = opsMes.filter(op => op.type === "EXPENSE").reduce((acc, curr) => acc + curr.value, 0);

      return { 
        name: mesesNomes[mesRef], 
        nameFull: mesesNomesFull[mesRef],
        value: totalSaidas,
        entradas: totalEntradas,
        saidas: totalSaidas,
        isAtual: i === 5 
      };
    });
    if (!mesDetalhado && dados.length > 0) setMesDetalhado(dados[5]);
    return dados;
  }, [todasOperacoes]);

  if (!mounted || status === "loading") return <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center font-black text-[#172c3c]">CARREGANDO...</div>;

  const [saldoInteiro, saldoCentavos] = (saldoAtual ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 }).split(",");

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#172c3c] font-sans pb-32">
      <FloatingNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="h-2 w-full bg-gradient-to-r from-[#172c3c] via-[#d96831] to-[#e6b33d] sticky top-0 z-[60]" />

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col items-center mb-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] mb-2 opacity-30 italic">Patrimônio Consolidado</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#d96831] italic">R$</span>
            <h2 className="text-6xl md:text-9xl font-black tracking-tighter leading-none italic">
              {saldoInteiro}<span className="text-[#e6b33d]">,</span><span className="text-3xl md:text-5xl opacity-20">{saldoCentavos}</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ESQUERDA */}
          <div className="lg:col-span-3 space-y-6">
             <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5">
                <p className="text-[10px] font-black opacity-30 uppercase mb-4 italic">Balanço de Hoje</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-black mb-1 italic"><span className="text-emerald-600">ENTRADAS</span><span>R$ {balancoHoje.entradas.toLocaleString("pt-BR")}</span></div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${balancoHoje.total > 0 ? (balancoHoje.entradas/balancoHoje.total)*100 : 0}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black mb-1 italic"><span className="text-[#995052]">SAÍDAS</span><span>R$ {balancoHoje.gastos.toLocaleString("pt-BR")}</span></div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#995052]" style={{ width: `${balancoHoje.total > 0 ? (balancoHoje.gastos/balancoHoje.total)*100 : 0}%` }} /></div>
                  </div>
                </div>
             </div>
             <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5 h-[450px] flex flex-col">
              <p className="text-[10px] font-black uppercase mb-4 flex items-center gap-2 italic"><Bell size={14} className="text-[#d96831]" /> Agenda</p>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                {avisosDB.map((a) => (
                  <div key={a.id} className="p-4 rounded-2xl border-l-4 border-[#172c3c] bg-slate-50 relative group">
                    <button onClick={() => resolverAviso.mutate({ id: a.id })} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all p-1 bg-[#172c3c] text-[#e6b33d] rounded-full"><CheckCircle2 size={12} /></button>
                    <p className="text-[10px] font-black uppercase italic leading-tight truncate pr-4">{a.nome}</p>
                    <p className="text-[9px] font-bold opacity-40">R$ {a.valor.toFixed(0)} • {format(new Date(a.data), 'dd/MM')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTRAL */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-black/5">
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-xs font-black uppercase italic flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#d96831]" /> Fluxo Semestral</h3>
                {mesDetalhado && (
                  <div className="text-right">
                    <p className="text-[9px] font-black opacity-30 uppercase italic leading-none">{mesDetalhado.nameFull}</p>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-1.5"><ArrowUpCircle size={12} className="text-emerald-500" /><span className="text-[11px] font-black">R$ {mesDetalhado.entradas.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</span></div>
                      <div className="flex items-center gap-1.5"><ArrowDownCircle size={12} className="text-[#995052]" /><span className="text-[11px] font-black">R$ {mesDetalhado.saidas.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</span></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="h-[300px] w-full">
                {chartData.length > 0 && <ChartContainer data={chartData} onSelect={setMesDetalhado} />}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <p className="px-4 text-[9px] font-black uppercase opacity-30 italic flex items-center gap-2"><Zap size={12} className="text-[#e6b33d]"/> Limites</p>
                  <AutoCarousel>{limits.map((l: any, idx: number) => <DashBoardLimit key={l.id} l={l} index={idx} />)}</AutoCarousel>
               </div>
               <div className="space-y-3">
                  <p className="px-4 text-[9px] font-black uppercase opacity-30 italic flex items-center gap-2"><Target size={12} className="text-[#d96831]"/> Metas</p>
                  <AutoCarousel>{goals.map((g: any) => <MetasDashboard key={g.id} goal={g} />)}</AutoCarousel>
               </div>
            </div>
          </div>

          {/* DIREITA - CHAT AI */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-[#172c3c]/5 flex flex-col h-[400px] overflow-hidden">
              <div className="p-4 bg-[#172c3c] text-white flex items-center gap-2">
                <Bot size={18} className="text-[#e6b33d]" />
                <p className="text-[10px] font-black uppercase italic flex-1 leading-none">Cinco Pila AI</p>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto no-scrollbar bg-slate-50/50">
                <div className="p-4 rounded-2xl shadow-sm border bg-white border-black/5 text-[11px] font-medium leading-relaxed italic">
                  {isAiLoading ? (
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-2 h-2 bg-[#d96831] rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#d96831] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-[#d96831] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  ) : (
                    <ReactMarkdown>{aiResponse}</ReactMarkdown>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white border-t border-black/5 flex items-center gap-2">
                <input 
                  type="text" 
                  value={geminiPrompt} 
                  onChange={(e) => setGeminiPrompt(e.target.value)} 
                  onKeyDown={(e) => e.key === "Enter" && handleSendAI()}
                  placeholder="Pergunte..." 
                  className="flex-1 bg-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none" 
                />
                <button 
                  onClick={handleSendAI}
                  disabled={isAiLoading}
                  className="p-3 bg-[#172c3c] text-[#e6b33d] rounded-xl hover:bg-[#d96831] transition-all disabled:opacity-50 active:scale-95"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

            <div className="bg-[#172c3c] rounded-[2.5rem] p-6 text-white shadow-2xl">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-[#e6b33d] mb-4 italic">Recentes</h3>
              <div className="space-y-3">
                {todasOperacoes?.slice(0, 5).map((op: any) => (
                  <div key={op.id} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <p className="text-[9px] font-black uppercase truncate w-24 italic leading-none">{op.title}</p>
                    <p className={`text-[10px] font-black italic ${op.type === "EXPENSE" ? "text-[#995052]" : "text-emerald-400"}`}>{op.type === "EXPENSE" ? "-" : "+"} {op.value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}