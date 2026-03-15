"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { 
  TrendingUp, Zap, Target, Sparkles, Send, 
  Bot, EyeOff, ShieldCheck, Calendar, Bell, CheckCircle2 
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { differenceInDays, isPast, isToday, format } from "date-fns";

// Componentes internos (assumindo que existem no seu projeto)
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

  // --- QUERIES (tRPC) ---
  const { data: todasOperacoes } = api.operacoes.getAll.useQuery(undefined, { enabled: status === "authenticated" });
  const { data: saldoAtual } = api.operacoes.saldoAtual.useQuery(undefined, { enabled: status === "authenticated" });
  const { data: dailyIncomes } = api.operacoes.getDailyIncomes.useQuery(undefined, { enabled: status === "authenticated" });
  const { data: dailyExpenses } = api.operacoes.getDailyExpenses.useQuery(undefined, { enabled: status === "authenticated" });
  const { data: limits } = api.limites.getAll.useQuery(undefined, { enabled: status === "authenticated" });
  const { data: goals } = api.metas.getAll.useQuery(undefined, { enabled: status === "authenticated" });
  const { data: avisosDB } = api.avisos.getAll.useQuery(undefined, { enabled: status === "authenticated" });

  const resolverAviso = api.avisos.resolver.useMutation({
    onSuccess: () => {
      void utils.avisos.getAll.invalidate();
    }
  });

  // --- LÓGICA DE NEGÓCIO ---
  useEffect(() => {
    const saved = localStorage.getItem("cinco-pila-ai-enabled");
    if (saved !== null) setAiEnabled(saved === "true");
  }, []);

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

  // --- PROCESSAMENTO DO GRÁFICO (CORRIGIDO) ---
  const chartData = useMemo(() => {
    if (!todasOperacoes) return [];
    const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const hoje = new Date();
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - (6 - i), 1);
      
      const totalGasto = todasOperacoes
        .filter((op) => {
          const opDate = new Date(op.createdAt);
          return (
            op.type === "EXPENSE" && 
            opDate.getMonth() === d.getMonth() && 
            opDate.getFullYear() === d.getFullYear()
          );
        })
        .reduce((acc, curr) => acc + curr.value, 0);

      return { 
        name: mesesNomes[d.getMonth()], 
        value: totalGasto, 
        isAtual: i === 6 
      };
    });
  }, [todasOperacoes]);

  if (status === "loading") {
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
      
      {/* Top Banner Gradient */}
      <div className="h-2 w-full bg-gradient-to-r from-[#172c3c] via-[#d96831] to-[#e6b33d] sticky top-0 z-[60]" />

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 pb-32">
        
        {/* HEADER PATRIMÔNIO */}
        <div className="flex flex-col items-center mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] mb-2 opacity-30 italic">
            Patrimônio Consolidado
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#d96831] italic">R$</span>
            <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-none italic">
              {saldoInteiro}
              <span className="text-[#e6b33d]">,</span>
              <span className="text-3xl md:text-5xl opacity-20">{saldoCentavos}</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* --- COLUNA ESQUERDA (3/12) --- */}
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
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-700" 
                        style={{ width: `${(entradasHoje / (entradasHoje + gastosHoje || 1)) * 100}%` }} 
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-black mb-1">
                      <span className="text-[#995052]">SAÍDAS</span>
                      <span>R$ {gastosHoje.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#995052] transition-all duration-700" 
                        style={{ width: `${(gastosHoje / (entradasHoje + gastosHoje || 1)) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>
             </div>

            {/* QUADRO DE AVISOS */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-black/5 flex flex-col h-[480px]">
              <p className="text-[10px] font-black uppercase text-[#172c3c] mb-4 italic flex items-center gap-2">
                <Bell size={14} className="text-[#d96831]" /> Agenda e Alertas
              </p>
              
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                {(!avisosDB || avisosDB.length === 0) && (
                  <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <CheckCircle2 size={40} />
                    <p className="text-[10px] font-black uppercase mt-2">Nada pendente</p>
                  </div>
                )}
                
                {avisosDB?.map((a) => {
                  const dataAviso = new Date(a.data);
                  const diasParaVencer = differenceInDays(dataAviso, new Date());
                  const vencido = isPast(dataAviso) && !isToday(dataAviso);
                  const venceHoje = isToday(dataAviso);

                  return (
                    <div key={a.id} className={`group p-4 rounded-2xl border-l-4 transition-all relative ${
                      vencido || venceHoje ? 'border-[#995052] bg-red-50/50' : 'border-[#172c3c] bg-slate-50'
                    }`}>
                      <button 
                        onClick={() => resolverAviso.mutate({ id: a.id })}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all p-1 bg-[#172c3c] text-[#e6b33d] rounded-full"
                      >
                        <CheckCircle2 size={12} />
                      </button>

                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] font-black uppercase italic leading-tight truncate w-3/4">{a.nome}</p>
                        <span className="text-[9px] font-black">R$ {a.valor.toFixed(0)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar size={10} className={vencido ? "text-[#995052]" : "text-[#d96831]"}/>
                        <p className={`text-[8px] font-bold uppercase ${vencido ? 'text-[#995052]' : 'opacity-40'}`}>
                          {vencido ? "Atrasado" : venceHoje ? "Vence Hoje" : `Em ${diasParaVencer + 1} dias`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* --- COLUNA CENTRAL (GRÁFICO) (6/12) --- */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-black/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black uppercase italic tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#d96831]" /> Fluxo Semestral
                </h3>
              </div>
              
              {/* CONTAINER DO GRÁFICO CORRIGIDO */}
              <div className="h-[250px] w-full min-w-0 overflow-hidden">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <Tooltip 
                        cursor={{ fill: "#172c3c", fillOpacity: 0.05 }} 
                        content={({ active, payload }) => {
                          if (active && payload?.length) {
                            return (
                              <div className="bg-[#172c3c] p-2 rounded-lg text-white font-black text-[10px] italic shadow-xl">
                                R$ {Number(payload[0]?.value).toLocaleString("pt-BR")}
                              </div>
                            );
                          }
                          return null;
                        }} 
                      />
                      <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={35}>
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.isAtual ? "#d96831" : "#172c3c"} 
                            fillOpacity={entry.isAtual ? 1 : 0.1}
                          />
                        ))}
                      </Bar>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 900, fill: "#172c3c", opacity: 0.4 }} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
                     <p className="text-[10px] font-black uppercase opacity-20">Sem dados financeiros</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-3">
                  <p className="px-4 text-[9px] font-black uppercase opacity-30 italic flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#e6b33d]"/> Limites
                  </p>
                  <AutoCarousel>
                    {limits?.map((l, idx) => <DashBoardLimit key={l.id} l={l} index={idx} />)}
                  </AutoCarousel>
               </div>
               <div className="space-y-3">
                  <p className="px-4 text-[9px] font-black uppercase opacity-30 italic flex items-center gap-2">
                    <Target className="w-3 h-3 text-[#d96831]"/> Metas
                  </p>
                  <AutoCarousel>
                    {goals?.map(g => <MetasDashboard key={g.id} goal={g} />)}
                  </AutoCarousel>
               </div>
            </div>
          </div>

          {/* --- COLUNA DIREITA (IA E RECENTES) (3/12) --- */}
          <div className="lg:col-span-3 space-y-6">
            {/* CINCO PILA AI */}
            <div className={`bg-white rounded-[2.5rem] shadow-xl border-2 border-[#172c3c]/5 flex flex-col h-[400px] overflow-hidden transition-all duration-300 ${!aiEnabled ? 'opacity-80' : ''}`}>
              <div className="p-4 bg-[#172c3c] text-white flex items-center gap-2">
                <div className="p-1.5 bg-[#e6b33d] rounded-lg"><Bot size={16} className="text-[#172c3c]" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase leading-none">Cinco Pila AI</p>
                  <p className="text-[8px] opacity-60 font-black italic">{aiEnabled ? "Modo Ativo" : "Privado"}</p>
                </div>

                <div className="dropdown dropdown-end ml-auto">
                  <label tabIndex={0} className="btn btn-ghost btn-xs btn-circle text-[#e6b33d]">
                    <Sparkles size={14} className={aiEnabled ? "animate-pulse" : "opacity-20"} />
                  </label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-2xl bg-[#172c3c] border border-white/10 rounded-2xl w-48 mt-2">
                    <li>
                      <button onClick={handleToggleAI} className="text-[10px] font-black uppercase flex justify-between hover:bg-white/5 active:bg-[#d96831]">
                        {aiEnabled ? (
                          <>Desligar IA <EyeOff size={14} className="text-[#995052]" /></>
                        ) : (
                          <>Ligar IA <Zap size={14} className="text-[#e6b33d]" /></>
                        )}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {aiEnabled ? (
                <>
                  <div className="flex-1 p-4 overflow-y-auto no-scrollbar bg-slate-50/50 space-y-4">
                    <div className={`p-4 rounded-2xl shadow-sm border ${isAnalyzing ? 'opacity-50' : 'opacity-100'} transition-opacity bg-white border-black/5`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-[#e6b33d]" />
                        <span className="text-[9px] font-black uppercase opacity-40 italic text-[#172c3c]">Insight</span>
                      </div>
                      <div className="text-[11px] font-medium leading-relaxed text-[#172c3c]">
                        <ReactMarkdown components={{ 
                          strong: ({node, ...props}) => <span className="font-black text-[#d96831]" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                        }}>
                          {aiResponse}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white border-t border-black/5">
                    <div className="relative flex items-center">
                      <input 
                        type="text" 
                        value={geminiPrompt} 
                        onChange={(e) => setGeminiPrompt(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleGeminiAnalysis()} 
                        placeholder="Pergunte algo..." 
                        className="w-full bg-slate-100 rounded-xl py-3 px-4 pr-12 text-xs font-bold outline-none text-[#172c3c] focus:ring-1 ring-[#e6b33d]" 
                      />
                      <button 
                        onClick={handleGeminiAnalysis} 
                        disabled={isAnalyzing}
                        className="absolute right-2 p-2 bg-[#172c3c] text-[#e6b33d] rounded-lg disabled:opacity-50"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f8f9fa]">
                  <ShieldCheck size={32} className="text-[#172c3c] opacity-10 mb-2" />
                  <p className="text-[9px] font-black uppercase italic text-[#172c3c] opacity-40">Privacidade Ativa</p>
                </div>
              )}
            </div>

            {/* FLUXO RECENTE */}
            <div className="bg-[#172c3c] rounded-[2.5rem] p-6 text-white shadow-2xl relative overflow-hidden group">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-[#e6b33d] mb-4 italic">Fluxo Recente</h3>
              <div className="space-y-3">
                {todasOperacoes?.slice(0, 6).map((op) => (
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