"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import { CircleDollarSign, Loader2, ArrowRight, ShieldCheck, Zap, Target } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const logoUrl = "/logo.png";

  return (
    <ParallaxProvider>
      <div className="min-h-screen bg-[#f0f2f5] font-sans text-[#172c3c] overflow-x-hidden selection:bg-[#e6b33d]">
        
        {/* --- NAVBAR --- */}
        <nav className="fixed top-0 w-full z-[100] bg-[#172c3c] text-white border-b border-white/5 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <img src={logoUrl} width="80" alt="Logo" className="transition-transform group-hover:rotate-12" />
              <span className="text-2xl font-black tracking-tighter uppercase italic">Cinco Pila</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10 font-black text-[10px] uppercase tracking-[0.2em]">
              <a href="#features" className="hover:text-[#e6b33d] transition-colors">Funcionalidades</a>
              <a href="#stats" className="hover:text-[#e6b33d] transition-colors">Dados</a>
              <button onClick={() => router.push('/login')} className="bg-[#d96831] hover:bg-[#b85628] px-8 py-2.5 rounded-xl font-black italic transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                ENTRAR
              </button>
            </div>
          </div>
        </nav>

        {/* --- HERO SECTION --- */}
        <section className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden bg-[#172c3c]">
          {/* Background Dinâmico - Sem sumir no final */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e6b33d]/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#d96831]/5 rounded-full blur-[150px]" />
          </div>

          <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
            <Parallax translateY={[-15, 15]} easing="easeInQuad">
              <div className="flex justify-center mb-10">
                <img src={logoUrl} alt="Cinco Pila" className="w-32 md:w-56 drop-shadow-[0_20px_50px_rgba(230,179,61,0.4)]" />
              </div>
            </Parallax>

            <Parallax translateY={[10, -10]}>
              <h1 className="text-6xl md:text-[10rem] font-black text-white mb-6 leading-[0.8] tracking-tighter italic uppercase">
                CONTROLE <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d96831] via-[#e6b33d] to-[#d96831]">
                  TOTAL.
                </span>
              </h1>
            </Parallax>

            <Parallax translateY={[20, -20]}>
              <p className="max-w-3xl mx-auto text-white/70 text-lg md:text-2xl mb-12 font-bold uppercase tracking-tight italic">
                Para que usar uma planilha velha e feia? <br className="hidden md:block"/> 
                <span className="text-[#e6b33d]">Usa isso aqui que é mais jogo.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button 
                  onClick={() => router.push('/login')} 
                  className="px-16 py-6 font-black text-white bg-[#d96831] rounded-2xl hover:bg-[#e6b33d] hover:text-[#172c3c] transition-all transform hover:scale-110 shadow-[0_20px_50px_rgba(217,104,49,0.3)] italic uppercase text-xl tracking-widest"
                >
                  Começar Agora
                </button>
              </div>
            </Parallax>
          </div>
        </section>

        {/* --- STATS SECTION (Sólida e Alinhada) --- */}
        <section id="stats" className="relative z-30 py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { val: "+ Rápido", label: "Usual", icon: <Zap className="text-[#d96831]" />, bg: "bg-[#f8fafc]" },
                { val: "+ Bonito", label: "Intuitivo", icon: <CircleDollarSign className="text-[#e6b33d]" />, bg: "bg-[#172c3c] text-white" },
                { val: "+ Simples", label: "Seguro", icon: <ShieldCheck className="text-emerald-500" />, bg: "bg-[#f8fafc]" },
              ].map((stat, i) => (
                <Parallax key={i} translateY={[5, -5]} className="h-full">
                  <div className={`${stat.bg} p-12 rounded-[3rem] shadow-xl border border-black/5 flex flex-col items-center justify-center text-center h-full transition-transform hover:scale-105`}>
                    <div className="mb-4">{stat.icon}</div>
                    <h4 className="text-5xl font-black italic uppercase tracking-tighter">{stat.val}</h4>
                    <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.3em] mt-3">{stat.label}</p>
                  </div>
                </Parallax>
              ))}
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section id="features" className="py-32 bg-[#f0f2f5]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              
              <Parallax translateX={[-5, 5]}>
                <div className="space-y-8 text-center lg:text-left">
                  <span className="text-[#d96831] font-black uppercase tracking-[0.4em] text-xs italic">Simplicidade Radical</span>
                  <h2 className="text-6xl md:text-8xl font-black italic uppercase leading-[0.9] tracking-tighter">
                    Tudo em <br/> <span className="text-[#172c3c]">um só</span> <br/> <span className="text-[#e6b33d]">lugar.</span>
                  </h2>
                  <p className="text-xl text-slate-500 font-bold leading-relaxed italic">
                    Chega de 50 abas no navegador. Lançamentos, metas e avisos de contas futuras organizados em uma interface que não te faz perder tempo.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border-l-8 border-[#d96831]">
                      <Target className="w-8 h-8 text-[#172c3c]" />
                      <span className="font-black italic uppercase text-xs">Metas Reais</span>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border-l-8 border-[#e6b33d]">
                      <BellRing className="w-8 h-8 text-[#172c3c]" />
                      <span className="font-black italic uppercase text-xs">Avisos Prévios</span>
                    </div>
                  </div>
                </div>
              </Parallax>

              <Parallax scale={[0.95, 1.05]} rotate={[-2, 2]}>
                <div className="relative">
                  <div className="bg-[#172c3c] p-3 rounded-[3.5rem] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1611974714675-8b630b1e427d?auto=format&fit=crop&q=80&w=1200" 
                      className="rounded-[3rem] w-full object-cover aspect-video grayscale" 
                      alt="Interface" 
                    />
                  </div>
                  {/* Floating Badge Alinhada */}
                  <div className="absolute -top-6 -right-6 bg-[#e6b33d] text-[#172c3c] p-8 rounded-full shadow-2xl animate-pulse flex items-center justify-center">
                    <ArrowRight className="w-10 h-10 -rotate-45 stroke-[4px]" />
                  </div>
                </div>
              </Parallax>

            </div>
          </div>
        </section>

        {/* --- CTA FINAL (Corrigido Opacidade e Logo) --- */}
        <section className="py-40 bg-[#172c3c] relative overflow-hidden flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-6 text-center text-white relative z-10">
            <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter mb-12 leading-none">
              SAIA DO <br/> <span className="text-[#d96831]">VERMELHO.</span>
            </h2>
            <button 
                onClick={() => router.push('/login')} 
                className="group relative h-24 px-20 rounded-3xl bg-white text-[#172c3c] font-black italic uppercase text-2xl hover:bg-[#e6b33d] transition-all transform hover:scale-110 active:scale-95 shadow-2xl"
            >
              CRIAR MINHA CONTA
            </button>
          </div>
          
          {/* Logo de Fundo - Fixa e Sutil (Sem ficar torta na saída) */}
          <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
              <Parallax rotate={[0, 45]} speed={-10}>
                <img src={logoUrl} alt="" className="w-[1000px] max-w-none" />
              </Parallax>
          </div>
        </section>

        {/* --- FOOTER (Limpo e Simétrico) --- */}
        <footer className="bg-white py-16 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex items-center gap-4">
                 <img src={logoUrl} width="35" alt="" />
                 <span className="font-black italic uppercase tracking-tighter text-xl">Cinco Pila</span>
              </div>
              
              <div className="flex gap-12 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                <a href="/sobre" className="hover:text-[#d96831] transition-colors">sobre</a>
                <a href="#" className="hover:text-[#d96831] transition-colors">Termos</a>
                <a href="#" className="hover:text-[#d96831] transition-colors">Segurança</a>
              </div>

              <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
                Desenvolvido por Luiz Guimarães © 2026
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ParallaxProvider>
  );
}

// Helpers Adicionais
function BellRing({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
    )
}