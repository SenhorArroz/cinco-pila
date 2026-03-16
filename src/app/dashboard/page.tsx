"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { 
  TrendingUp, Zap, Target, Sparkles, Send, 
  Bot, EyeOff, ShieldCheck, Calendar, Bell, CheckCircle2 
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import dynamic from "next/dynamic";

// --- GRÁFICO ISOLADO (ESTRATÉGIA DE SEGURANÇA VERCEL) ---
const SafeChart = dynamic(() => import("../_components/SafeChart"), { 
  ssr: false,
  loading: () => <div className="h-[280px] w-full bg-transparent animate-pulse rounded-[3rem]" />
});

import FloatingNav, { type Tab } from "../_components/FloatingNav";
import DashBoardLimit from "../_components/DashBoardLimit";
import MetasDashboard from "../_components/MetasDashboard";

// --- CARROSSEL ORIGINAL (SEM FUNDO) ---
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
    <div
      ref={scrollRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="carousel carousel-center w-full gap-6 pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
    >
      {children}
    </div>
  );
};

export default function DashboardCincoPila() {
  const utils = api.useUtils();
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [geminiPrompt, setGeminiPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState("Diz aí, meu nobre! Como tá o patrimônio hoje?");
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isReady = mounted && status === "authenticated";

  // Queries
  const { data: todasOperacoes } = api.operacoes.getAll.useQuery(undefined, { enabled: isReady });
  const { data: saldoAtual = 0 } = api.operacoes.saldoAtual.useQuery(undefined, { enabled: isReady });
  const { data: dailyIncomes } = api.operacoes.getDailyIncomes.useQuery(undefined, { enabled: isReady });
  const { data: dailyExpenses } = api.operacoes.getDailyExpenses.useQuery(undefined, { enabled: isReady });
  const { data: limits } = api.limites.getAll.useQuery(undefined, { enabled: isReady });
  const { data: goals } = api.metas.getAll.useQuery(undefined, { enabled: isReady });
  const { data: avisosDB } = api.avisos.getAll.useQuery(undefined, { enabled: isReady });

  const resolverAviso = api.avisos.resolver.useMutation({
    onSuccess: () => { void utils.avisos.getAll.invalidate(); }
  });

  // Cálculos de Progresso
  const entradasHoje = dailyIncomes?.reduce((acc, op) => acc + op.value, 0) ?? 0;
  const gastosHoje = dailyExpenses?.reduce((acc, op) => acc + op.value, 0) ?? 0;
  const totalFluxo = entradasHoje + gastosHoje;

  const chartData = useMemo(() => {
    if (!todasOperacoes) return [];
    const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const hoje = new Date();
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - (6 - i), 1);
      const mesIndex = d.getMonth();
      const nomeMes = mesesNomes[mesIndex] ?? "---"; // Garante que nunca seja undefined

      const totalGasto = todasOperacoes
        .filter((op) => {
          const opDate = new Date(op.createdAt);
          return op.type === "EXPENSE" && opDate.getMonth() === mesIndex && opDate.getFullYear() === d.getFullYear();
        })
        .reduce((acc, curr) => acc + curr.value, 0);

      return { 
        name: nomeMes, 
        value: totalGasto, 
        isAtual: i === 6 
      };
    });
  }, [todasOperacoes]);

  if (!mounted || status === "loading") {
    return <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center font-black text-[#172c3c]">CARREGANDO...</div>;
  }

  const [saldoInteiro, saldoCentavos] = saldoAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 }).split(",");

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#172c3c] font-sans pb-32">
      <FloatingNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="h-2 w-full bg-gradient-to-r from-[#172c3c] via-[#d96831] to-[#e6b33d] sticky top-0 z-[60]" />

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        
        {/* PATRIMÔNIO CENTRAL */}
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
          
          {/* COLUNA ESQUERDA: PROGRESSO + ALERTAS */}
          <div className="lg:col-span-3 space-y-6">
             <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5">
                <p className="text-[10px] font-black opacity-30 uppercase mb-4 italic">Balanço de Hoje</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-black mb-1 italic">
                      <span className="text-emerald-600">ENTRADAS</span>
                      <span>R$ {entradasHoje.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${totalFluxo > 0 ? (entradasHoje/totalFluxo)*100 : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black mb-1 italic">
                      <span className="text-[#995052]">SAÍDAS</span>
                      <span>R$ {gastosHoje.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#995052] transition-all duration-700" style={{ width: `${totalFluxo > 0 ? (gastosHoje/totalFluxo)*100 : 0}%` }} />
                    </div>
                  </div>
                </div>
             </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5 h-[450px] flex flex-col">
              <p className="text-[10px] font-black uppercase mb-4 flex items-center gap-2 italic">
                <Bell size={14} className="text-[#d96831]" /> Agenda
              </p>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                {avisosDB?.map((a) => (
                  <div key={a.id} className="p-4 rounded-2xl border-l-4 border-[#172c3c] bg-slate-50 relative group">
                    <button onClick={() => resolverAviso.mutate({ id: a.id })} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all p-1 bg-[#172c3c] text-[#e6b33d] rounded-full">
                      <CheckCircle2 size={12} />
                    </button>
                    <p className="text-[10px] font-black uppercase italic leading-tight truncate w-3/4">{a.nome}</p>
                    <p className="text-[9px] font-bold opacity-40">R$ {a.valor.toFixed(0)} • {format(new Date(a.data), 'dd/MM')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUNA CENTRAL: GRÁFICO (RECHARTS FIX) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-black/5">
              <h3 className="text-xs font-black uppercase italic mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#d96831]" /> Fluxo Semestral
              </h3>
              
              <div className="h-[280px] w-full flex items-end">
  {chartData.length > 0 ? (
                <SafeChart data={chartData} />
              ) : (
                <div className="h-full w-full flex items-center justify-center opacity-10 font-black text-xs uppercase italic">
                  Aguardando dados...
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <p className="px-4 text-[9px] font-black uppercase opacity-30 italic flex items-center gap-2"><Zap size={12} className="text-[#e6b33d]"/> Limites</p>
                  <AutoCarousel>{limits?.map((l, idx) => <DashBoardLimit key={l.id} l={l} index={idx} />)}</AutoCarousel>
               </div>
               <div className="space-y-3">
                  <p className="px-4 text-[9px] font-black uppercase opacity-30 italic flex items-center gap-2"><Target size={12} className="text-[#d96831]"/> Metas</p>
                  <AutoCarousel>{goals?.map(g => <MetasDashboard key={g.id} goal={g} />)}</AutoCarousel>
               </div>
            </div>
          </div>

          {/* COLUNA DIREITA: IA + RECENTES */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-[#172c3c]/5 flex flex-col h-[400px] overflow-hidden">
              <div className="p-4 bg-[#172c3c] text-white flex items-center gap-2">
                <Bot size={18} className="text-[#e6b33d]" />
                <p className="text-[10px] font-black uppercase italic leading-none flex-1">Cinco Pila AI</p>
              </div>
              <div className="flex-1 p-4 overflow-y-auto no-scrollbar bg-slate-50/50">
                <div className="p-4 rounded-2xl shadow-sm border bg-white border-black/5 text-[11px] font-medium leading-relaxed italic">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                </div>
              </div>
              <div className="p-3 bg-white border-t border-black/5 flex items-center gap-2">
                <input type="text" value={geminiPrompt} onChange={(e) => setGeminiPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setAiResponse("Analisando...")} placeholder="Pergunte..." className="flex-1 bg-slate-100 rounded-xl py-3 px-4 text-xs font-bold outline-none" />
                <button className="p-3 bg-[#172c3c] text-[#e6b33d] rounded-xl"><Send size={14} /></button>
              </div>
            </div>

            <div className="bg-[#172c3c] rounded-[2.5rem] p-6 text-white shadow-2xl overflow-hidden">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-[#e6b33d] mb-4 italic">Recentes</h3>
              <div className="space-y-3">
                {todasOperacoes?.slice(0, 5).map((op) => (
                  <div key={op.id} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <p className="text-[9px] font-black uppercase truncate w-24 italic leading-none">{op.title}</p>
                    <p className={`text-[10px] font-black italic ${op.type === "EXPENSE" ? "text-[#995052]" : "text-emerald-400"}`}>
                      {op.type === "EXPENSE" ? "-" : "+"} {op.value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </p>
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