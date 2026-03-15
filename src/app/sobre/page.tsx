"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import { Fingerprint, Cpu, Workflow, Github, Instagram, Twitter } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();
  const logoUrl = "/logo.png";

  return (
    <ParallaxProvider>
      <div className="min-h-screen bg-[#172c3c] font-sans text-white overflow-x-hidden selection:bg-[#e6b33d]">
        
        {/* --- NAVBAR REDUZIDA (Mais elegante para o Sobre) --- */}
        <nav className="fixed top-0 w-full z-[100] bg-[#172c3c]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/')}>
              <img src={logoUrl} width="40" alt="Logo" className="grayscale group-hover:grayscale-0 transition-all" />
              <span className="font-black italic uppercase text-sm tracking-widest">Manifesto</span>
            </div>
            <button onClick={() => router.push('/')} className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-[#e6b33d] transition-colors">
              Voltar para Home
            </button>
          </div>
        </nav>

        {/* --- SPLIT HERO (Layout Diferente da Home) --- */}
        <section className="relative min-h-screen flex items-center pt-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 z-10">
              <Parallax translateX={[-10, 5]} opacity={[0, 2]}>
                <h1 className="text-[15vw] lg:text-[10rem] font-black italic uppercase leading-[0.75] tracking-tighter text-[#e6b33d]">
                  NOSSAS <br/> <span className="text-white">RAÍZES.</span>
                </h1>
              </Parallax>
              <Parallax translateY={[20, -20]} className="mt-12">
                <p className="text-2xl md:text-4xl font-bold italic leading-tight text-white/50 max-w-xl">
                  <span className="text-white">O projeto nasceu de uma discussão que tive com a minha namorada sobre eu estar gastando muito.</span>
                </p>
              </Parallax>
            </div>
            
            <div className="lg:col-span-5 relative h-[400px] lg:h-[600px]">
                <Parallax speed={-15} className="absolute inset-0">
                    <div className="w-full h-full bg-[#274862] rounded-3xl overflow-hidden border border-white/10 rotate-3 transform shadow-2xl">
                        <img 
                          className="w-full h-full object-cover mix-blend-overlay opacity-50 grayscale"
                          alt="Equipe"
                        />
                    </div>
                </Parallax>
                <Parallax speed={10} className="absolute -bottom-10 -left-10">
                    <div className="bg-[#d96831] p-8 rounded-2xl shadow-2xl -rotate-6">
                        <Fingerprint className="w-12 h-12 text-white" />
                    </div>
                </Parallax>
            </div>
          </div>
        </section>

        {/* --- GRID DE DNA (Substituindo os Stats da Home) --- */}
        <section className="py-40 bg-white text-[#172c3c]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
              <div className="sticky top-32">
                 <span className="text-[#995052] font-black uppercase tracking-[0.4em] text-xs italic">The Tech Stack</span>
                 <h2 className="text-6xl font-black italic uppercase leading-none mt-4 mb-8">
                   O que nos <br/> move por <br/> <span className="text-[#d96831]">baixo do capô.</span>
                 </h2>
                 <p className="text-xl font-bold text-slate-500 italic max-w-sm">
                   Usamos o T3 Stack porque não temos tempo para perder com configuração. Biome para o lint, Tailwind para o estilo, Postgres para o dado real.
                 </p>
              </div>

              <div className="space-y-32">
                {[
                  { title: "Escalabilidade", icon: <Cpu />, color: "bg-[#172c3c]", text: "Prisma e PostgreSQL garantem que seu dado esteja seguro, não importa o tamanho da sua conta." },
                  { title: "Automação", icon: <Workflow />, color: "bg-[#274862]", text: "Menos input manual, mais automação rodando em segundo plano." },
                ].map((item, i) => (
                  <Parallax key={i} translateY={[30, -30]} opacity={[0.3, 1]}>
                    <div className="flex gap-8 group">
                      <div className={`${item.color} w-20 h-20 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform`}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-3xl font-black italic uppercase mb-4">{item.title}</h4>
                        <p className="text-lg font-bold text-slate-400 italic leading-snug">{item.text}</p>
                      </div>
                    </div>
                  </Parallax>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- THE CREW (Seção de Perfil Assimétrica) --- */}
        <section className="py-40 bg-[#f0f2f5] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <Parallax translateX={[10, -10]}>
                    <h2 className="text-[12vw] font-black italic uppercase leading-none tracking-tighter text-[#172c3c]/5 whitespace-nowrap mb-[-5vw]">
                        Sem tempo
                    </h2>
                </Parallax>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-[#172c3c] p-12 rounded-[4rem] text-white flex flex-col justify-between min-h-[500px] shadow-3xl">
                        <div className="flex justify-between items-start">
                            <h3 className="text-5xl font-black italic uppercase">Luiz <br/> Guimarães</h3>
                            <div className="flex gap-4">
                                <Instagram className="hover:text-[#e6b33d] cursor-pointer" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold italic text-white/40 max-w-xl">
                           "Criar o Cinco Pila foi sobre parar de brigar com a interface (e com a mulher) e começar a ganhar tempo com o que importa."
                        </p>
                    </div>
                    
                    <Parallax translateY={[10, -10]} className="bg-[#e6b33d] p-12 rounded-[4rem] flex flex-col justify-end shadow-2xl">
                        <span className="text-[#172c3c] font-black uppercase tracking-widest text-xs mb-4">The Vision</span>
                        <h4 className="text-4xl font-black italic uppercase text-[#172c3c] leading-none">
                            Focado no <br/> Próximo <br/> Nível.
                        </h4>
                    </Parallax>
                </div>
            </div>
        </section>

        {/* --- FOOTER SIMPLIFICADO --- */}
        <footer className="bg-[#172c3c] py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
            <img src={logoUrl} width="60" alt="" className="mb-8" />
            <div className="flex gap-8 mb-12">
                {['Instagram', 'LinkedIn', 'Github'].map(link => (
                    <a key={link} href="#" className="text-xs font-black uppercase tracking-[0.3em] text-white/30 hover:text-[#e6b33d] transition-colors">
                        {link}
                    </a>
                ))}
            </div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">
                Cinco Pila 
            </p>
          </div>
        </footer>

      </div>
    </ParallaxProvider>
  );
}