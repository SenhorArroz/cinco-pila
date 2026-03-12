"use client";
import React from 'react';
import { signIn } from "next-auth/react";

export default function LoginCincoPila() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-6 selection:bg-[#e6b33d]">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-700">
        
        {/* LOGO / BRANDING */}
        <div className="text-center mb-12">
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-[#172c3c]">
            Cinco<br />
            <span className="text-[#d96831]">Pila</span>
            <span className="text-[#e6b33d]">.</span>
          </h1>
          <div className="mt-6 flex justify-center">
            <div className="h-2 w-20 bg-[#172c3c] rounded-full"></div>
          </div>
          <p className="mt-4 font-bold opacity-40 tracking-[0.3em] text-[10px] uppercase">
            Gestão financeira bruta e direta
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white border-4 border-[#172c3c] rounded-[3.5rem] p-10 shadow-[20px_20px_0px_0px_#172c3c] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[24px_24px_0px_0px_#172c3c] transition-all duration-300">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-[#172c3c]">
              Bora focar no dindin?
            </h2>
            <p className="text-xs font-bold opacity-40 mt-1 uppercase">Acesse sua conta para continuar</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => void signIn("google", { callbackUrl: "/dashboard" })}
              className="group relative w-full h-16 bg-white border-4 border-[#172c3c] rounded-2xl flex items-center justify-center gap-4 hover:bg-[#172c3c] transition-all duration-300 active:scale-95"
            >
              {/* ÍCONE GOOGLE CUSTOMIZADO */}
              <svg className="w-6 h-6 group-hover:invert transition-all" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="font-black uppercase tracking-tighter text-[#172c3c] group-hover:text-white transition-colors">
                Entrar com Google
              </span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[9px] font-black opacity-20 uppercase tracking-[0.2em]">
              Segurança via NextAuth & Google Cloud
            </p>
          </div>
        </div>

        {/* FOOTER DECORATIVO */}
        <div className="mt-12 flex justify-between items-center opacity-10 px-6">
           <span className="font-black italic text-4xl leading-none">$</span>
           <span className="font-black italic text-4xl leading-none">R$</span>
           <span className="font-black italic text-4xl leading-none">₿</span>
           <span className="font-black italic text-4xl leading-none">€</span>
        </div>
      </div>
    </div>
  );
}