"use client";

import React from 'react';
import Link from 'next/link';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import { AlertTriangle, ArrowLeft, Ghost } from 'lucide-react';

export default function NotFound() {
  const logoUrl = "/logo.png";

  return (
    <ParallaxProvider>
      <div className="min-h-screen bg-[#172c3c] font-sans text-white overflow-hidden flex flex-col justify-center items-center relative selection:bg-[#e6b33d]">
        
        {/* Background Dinâmico (Mantendo o padrão da sua Hero) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d96831]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#995052]/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 text-center px-6">
          {/* Logo Flutuante com Parallax */}
          <Parallax translateY={[-20, 20]} rotate={[0, 15]}>
            <div className="flex justify-center mb-8">
              <img 
                src={logoUrl} 
                alt="Cinco Pila" 
                className="w-32 md:w-48 drop-shadow-[0_0_30px_rgba(230,179,61,0.3)] grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500" 
              />
            </div>
          </Parallax>

          {/* Título de Impacto */}
          <h1 className="text-8xl md:text-[14rem] font-black italic uppercase leading-none tracking-tighter mb-4">
            404<span className="text-[#d96831]">.</span>
          </h1>
          
          <div className="space-y-4 mb-12">
            <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight">
              PERDIDO NO <span className="text-[#e6b33d]">FLUXO?</span>
            </h2>
            <p className="max-w-md mx-auto text-white/50 font-bold uppercase text-sm tracking-[0.2em] leading-relaxed">
              Essa rota não existe no nosso sistema. <br />
              Até para errar você precisa de <span className="text-[#995052]">controle.</span>
            </p>
          </div>

          {/* Botão de Retorno Estilo CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/"
              className="group flex items-center gap-3 px-12 py-5 bg-[#d96831] hover:bg-[#e6b33d] text-white hover:text-[#172c3c] font-black italic uppercase text-xl rounded-2xl transition-all transform hover:scale-105 shadow-[0_20px_40px_rgba(217,104,49,0.2)]"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
              Voltar ao Início
            </Link>
          </div>
        </div>

        {/* Logo de Fundo Gigante Sutil */}
        <div className="absolute -bottom-20 -right-20 opacity-[0.02] pointer-events-none">
          <h1 className="text-[30rem] font-black italic select-none">PILA</h1>
        </div>

      </div>
    </ParallaxProvider>
  );
}