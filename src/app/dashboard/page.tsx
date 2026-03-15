"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { 
  TrendingUp, Zap, Target, Sparkles, Send, 
  Bot, EyeOff, ShieldCheck, Calendar, Bell, CheckCircle2 
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { differenceInDays, isPast, isToday } from "date-fns";
import dynamic from "next/dynamic";

// --- TRAVA DE PRODUÇÃO: IMPORT DINÂMICO DO RECHARTS ---
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const Cell = dynamic(() => import("recharts").then(m => m.Cell), { ssr: false });

// Componentes internos (certifique-se de que os caminhos estão corretos)
import FloatingNav, { type Tab } from "../_components/FloatingNav";
import DashBoardLimit from "../_components/DashBoardLimit";
import MetasDashboard from "../_components/MetasDashboard";

// --- COMPONENTE DE CARROSSEL ---
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
  
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [geminiPrompt, setGeminiPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState("Olá! Sou o assistente do Cinco Pila. Pergunte-me sobre seus gastos.");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  // --- TRAVA DE HIDRATAÇÃO ---
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("cinco-pila-ai-enabled");
    if (saved !== null) setAiEnabled(saved === "true");
  }, []);

  // --- QUERIES (tRPC) ---
  const { data: todasOperacoes } = api.operacoes.getAll.useQuery(undefined, { enabled: status === "authenticated" });
  const { data: saldoAtual } = api.operacoes.saldoAtual.useQuery(undefined, { enabled: status === "authenticated" });
  const { data: dailyIncomes } = api.operacoes.getDailyIncomes.useQuery(undefined, { enabled: status === "authenticated" });
  const { data: dailyExpenses } = api.operacoes.getDailyExpenses.useQuery(undefined, { enabled: status === "authenticated" });
  const { data: limits } = api.limites.getAll.useQuery(undefined, { enabled: status === "authenticated" });
  const { data: goals } = api.metas.getAll.useQuery(undefined, { enabled: status === "authenticated" });
  const { data: avisosDB } = api.avisos.getAll.useQuery(undefined, { enabled: status === "authenticated" });

  const resolverAviso = api.avisos.resolver.useMutation({
    onSuccess: () => { void utils.avisos.getAll.invalidate(); }
  });

  const handleToggleAI = () => {
    const newState = !aiEnabled;
    setAiEnabled(newState);
    localStorage.setItem("cinco-pila-ai-enabled", String(newState));
  };

  const entradasHoje = dailyIncomes?.reduce((acc, op) => acc + op.value, 0) ?? 0;
  const gastosHoje = dailyExpenses?.reduce((acc, op) => acc + op.value, 0) ?? 0;

  const handleGeminiAnalysis = async () => {
    if (!geminiPrompt.trim() || !aiEnabled) return;
    setIsAnalyzing(true);
    setAiResponse("Analisando seus dados financeiros...");
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: geminiPrompt,
          financeData: { saldo: saldoAtual, operacoes: todasOperacoes?.slice(0, 30), metas: goals, limites: limits }
        }),
      });
      const data = await response.json();
      setAiResponse(response.ok ? data.text : "Erro ao conectar com a IA.");
    } catch (error) {
      setAiResponse("Erro de conexão.");
    } finally {
      setIsAnalyzing(false);
      setGeminiPrompt("");
    }
  };

  const chartData = useMemo(() => {
    if (!todasOperacoes) return [];
    const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const hoje = new Date();
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - (6 - i), 1);
      const totalGasto = todasOperacoes
        .filter((op) => {
          const opDate = new Date(op.createdAt);
          return op.type === "EXPENSE" && opDate.getMonth() === d.getMonth() && opDate.getFullYear() === d.getFullYear();
        })
        .reduce((acc, curr) => acc + curr.value, 0);

      return { name: mesesNomes[d.getMonth()], value: totalGasto, isAtual: i === 6 };
    });
  }, [todasOperacoes]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#172c3c]" />
      </div>
    );
  }

  const [saldoInteiro, saldoCentavos] = (saldoAtual || 0)
    .toLocaleString("pt-BR", { minimumFractionDigits: 2 })
    .split(",");

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#172c3c] font-sans selection:bg-[#e6b33d]">
      <FloatingNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="h-2 w-full bg-gradient-to-r from-[#172c3c] via-[#d96831] to-[#e6b33d] sticky top-0 z-[60]" />

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 pb-32">
        
        {/* HEADER PATRIMÔNIO */}
        <div className="flex flex-col items-center mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] mb-2 opacity-30 italic">Patrimônio Consolidado</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#d96831] italic">R$</span>
            <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-none italic">
              {saldoInteiro}<span className="text-[#e6b33d]">,</span><span className="text-3xl md:text-5xl opacity-20">{saldoCentavos}</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUNA ESQUERDA */}
          <div className="lg:col-span-3 space-y-6">
             <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5">
                <p className="text-[10px] font-black opacity-30 uppercase mb-4 italic">Balanço de Hoje</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-black mb-1">
                      <span className="text-emerald-600">ENTRADAS</span>
                      <span>R$ {entradasHoje.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${(entradasHoje / (entradasHoje + gastosHoje || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black mb-1">
                      <span className="text-[#995052]">SAÍDAS</span>
                      <span>R$ {gastosHoje.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#995052]" style={{ width: `${(gastosHoje / (entradasHoje + gastosHoje || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
             </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5 flex flex-col h-[480px]">
              <p className="text-[10px] font-black uppercase text-[#172c3c] mb-4 italic flex items-center gap-2">
                <Bell size={14} className="text-[#d96831]" /> Agenda e Alertas
              </p>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                {avisosDB?.length === 0 && <p className="text-[10px] font-black opacity-10 text-center mt-20">LIMPO</p>}
                {avisosDB?.map((a) => {
                  const d = new Date(a.data);
                  const vencido = isPast(d) && !isToday(d);
                  return (
                    <div key={a.id} className={`p-4 rounded-2xl border-l-4 relative ${vencido || isToday(d) ? 'border-[#995052] bg-red-50/50' : 'border-[#172c3c] bg-slate-50'}`}>
                      <button onClick={() => resolverAviso.mutate({ id: a.id })} className="absolute right-2 top-2 p-1 bg-[#172c3c] text-[#e6b33d] rounded-full"><CheckCircle2 size={12} /></button>
                      <p className="text-[10px] font-black uppercase italic leading-tight truncate w-3/4">{a.nome}</p>
                      <p className="text-[9px] font-black opacity-40">R$ {a.valor.toFixed(0)} • {isToday(d) ? "HOJE" : format(d, 'dd/MM')}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUNA CENTRAL - GRÁFICO BLINDADO */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-black/5">
              <h3 className="text-xs font-black uppercase italic mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#d96831]" /> Fluxo Semestral
              </h3>
              
              <div className="h-[250px] w-full min-w-0">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="99%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <Tooltip 
                        cursor={{ fill: "#172c3c", fillOpacity: 0.05 }}
                        content={({ active, payload }) => active && payload?.[0] ? (
                          <div className="bg-[#172c3c] p-2 rounded-lg text-white font-black text-[10px]">
                            R$ {Number(payload[0].value).toLocaleString("pt-BR")}
                          </div>
                        ) : null}
                      />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={35}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.isAtual ? "#d96831" : "#172c3c"} fillOpacity={entry.isAtual ? 1 : 0.1} />
                        ))}
                      </Bar>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "#172c3c", opacity: 0.4 }} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl opacity-20">
                    <p className="text-[10px] font-black uppercase">Sem dados</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <p className="px-4 text-[9px] font-black uppercase opacity-30 italic flex items-center gap-2"><Zap className="w-3 h-3 text-[#e6b33d]"/> Limites</p>
                  <AutoCarousel>{limits?.map((l, idx) => <DashBoardLimit key={l.id} l={l} index={idx} />)}</AutoCarousel>
               </div>
               <div className="space-y-3">
                  <p className="px-4 text-[9px] font-black uppercase opacity-30 italic flex items-center gap-2"><Target className="w-3 h-3 text-[#d96831]"/> Metas</p>
                  <AutoCarousel>{goals?.map(g => <MetasDashboard key={g.id} goal={g} />)}</AutoCarousel>
               </div>
            </div>
          </div>

          {/* COLUNA DIREITA - IA */}
          <div className="lg:col-span-3 space-y-6">
            <div className={`bg-white rounded-[2.5rem] shadow-xl border-2 border-[#172c3c]/5 flex flex-col h-[400px] overflow-hidden ${!aiEnabled ? 'opacity-80' : ''}`}>
              <div className="p-4 bg-[#172c3c] text-white flex items-center gap-2">
                <div className="p-1.5 bg-[#e6b33d] rounded-lg"><Bot size={16} className="text-[#172c3c]" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase leading-none">Cinco Pila AI</p>
                  <p className="text-[8px] opacity-60 font-black italic">{aiEnabled ? "Modo Ativo" : "Privado"}</p>
                </div>
                <button onClick={handleToggleAI} className="ml-auto text-[#e6b33d]"><Sparkles size={14} className={aiEnabled ? "animate-pulse" : "opacity-20"} /></button>
              </div>
              {aiEnabled ? (
                <>
                  <div className="flex-1 p-4 overflow-y-auto no-scrollbar bg-slate-50/50">
                    <div className="p-4 rounded-2xl shadow-sm border bg-white border-black/5 text-[11px] font-medium leading-relaxed">
                      <ReactMarkdown>{aiResponse}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="p-3 bg-white border-t border-black/5">
                    <div className="relative flex items-center">
                      <input type="text" value={geminiPrompt} onChange={(e) => setGeminiPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGeminiAnalysis()} placeholder="Pergunte..." className="w-full bg-slate-100 rounded-xl py-3 px-4 pr-12 text-xs font-bold outline-none" />
                      <button onClick={handleGeminiAnalysis} disabled={isAnalyzing} className="absolute right-2 p-2 bg-[#172c3c] text-[#e6b33d] rounded-lg"><Send size={14} /></button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-10"><ShieldCheck size={32} /></div>
              )}
            </div>
            
            <div className="bg-[#172c3c] rounded-[2.5rem] p-6 text-white shadow-2xl overflow-hidden">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-[#e6b33d] mb-4 italic">Recentes</h3>
              <div className="space-y-3">
                {todasOperacoes?.slice(0, 4).map((op) => (
                  <div key={op.id} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <p className="text-[9px] font-black uppercase truncate w-24 italic">{op.title}</p>
                    <p className={`text-[10px] font-black ${op.type === "EXPENSE" ? "text-[#995052]" : "text-emerald-400"}`}>
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