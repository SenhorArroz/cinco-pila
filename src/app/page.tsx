import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-[#172c3c] flex flex-col" data-theme="cincopila">
      
      {/* --- NAVBAR SIMÉTRICA --- */}
      <nav className="fixed top-0 w-full z-50 bg-[#172c3c]/95 backdrop-blur-md text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#e6b33d] p-1.5 rounded-lg">
              <img src="https://cdn-icons-png.flaticon.com/512/3135/3135706.png" width="28" alt="Logo" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Cinco Pila</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium text-sm uppercase tracking-widest">
            <a href="#" className="hover:text-[#e6b33d] transition-colors">Funcionalidades</a>
            <a href="#" className="hover:text-[#e6b33d] transition-colors">Sobre</a>
            <a href="#" className="hover:text-[#e6b33d] transition-colors">Segurança</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="btn btn-ghost btn-sm text-white hover:bg-white/10">Entrar</button>
            <button className="btn bg-[#d96831] hover:bg-[#b85628] border-none text-white btn-sm px-6">
              Começar
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION CENTRALIZADA --- */}
      <section className="relative pt-40 pb-32 overflow-hidden bg-[#172c3c]">
        {/* Elementos de Simetria de Fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 text-[#e6b33d] text-xs font-bold uppercase tracking-[0.2em]">
            Gestão Financeira Inteligente
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-none tracking-tighter">
            Controle cada <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d96831] to-[#e6b33d]">
              centavo.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/70 text-lg md:text-xl mb-12 font-light leading-relaxed">
            A ferramenta minimalista que você precisava para organizar sua vida financeira sem a complexidade das planilhas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="btn bg-[#d96831] hover:bg-[#b85628] border-none text-white btn-lg px-12 h-16 shadow-2xl shadow-[#d96831]/20">
              Criar Conta Grátis
            </button>
          </div>
        </div>
      </section>

      {/* --- GRID DE FUNCIONALIDADES (3 COLUNAS SIMÉTRICAS) --- */}
      <section className="py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Item 1 - Receitas */}
            <div className="group p-8 rounded-3xl bg-[#f8fafc] border border-slate-100 hover:border-[#274862]/20 transition-all text-center">
              <div className="w-16 h-16 bg-[#274862]/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                💰
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#274862]">Entradas</h3>
              <p className="text-slate-500 leading-relaxed">
                Registre seus rendimentos e tenha uma visão clara do seu potencial mensal.
              </p>
            </div>

            {/* Item 2 - Despesas */}
            <div className="group p-8 rounded-3xl bg-[#f8fafc] border border-slate-100 hover:border-[#995052]/20 transition-all text-center">
              <div className="w-16 h-16 bg-[#995052]/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                📉
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#995052]">Saídas</h3>
              <p className="text-slate-500 leading-relaxed">
                Categorize gastos e identifique padrões que estão drenando seu patrimônio.
              </p>
            </div>

            {/* Item 3 - Metas */}
            <div className="group p-8 rounded-3xl bg-[#f8fafc] border border-slate-100 hover:border-[#e6b33d]/20 transition-all text-center">
              <div className="w-16 h-16 bg-[#e6b33d]/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                🎯
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#e6b33d]">Objetivos</h3>
              <p className="text-slate-500 leading-relaxed">
                Defina metas de economia e acompanhe o progresso rumo à sua liberdade.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER SIMÉTRICO --- */}
      <footer className="mt-auto bg-[#172c3c] text-white/50 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-white">
            <span className="font-bold tracking-tighter">CINCO PILA © 2026</span>
          </div>
          
          <div className="flex gap-8 text-sm uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white">Privacidade</a>
            <a href="#" className="hover:text-white">Termos</a>
            <a href="#" className="hover:text-white">GitHub</a>
          </div>

          <div className="text-xs">
            Desenvolvido por <span className="text-white font-bold">Luiz Guimarães</span>
          </div>
        </div>
      </footer>
    </div>
  );
}