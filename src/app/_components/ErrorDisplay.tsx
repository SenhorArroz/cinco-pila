// src/components/ErrorDisplay.tsx
import { AlertCircle, Lock, Server, Timer } from 'lucide-react';

interface ErrorProps {
  code: 401 | 403 | 429 | 500;
  message?: string;
}

const errorMap = {
  401: { 
    title: "SESSÃO EXPIRADA", 
    desc: "Sua chave de acesso caiu. Entra de novo.", 
    icon: <Lock className="w-12 h-12 text-[#e6b33d]" /> 
  },
  429: { 
    title: "CALMA LÁ.", 
    desc: "Muitas requisições. O Google pediu um tempo.", 
    icon: <Timer className="w-12 h-12 text-[#d96831]" /> 
  },
  500: { 
    title: "ERRO DE MOTOR", 
    desc: "Nosso servidor tropeçou nos cabos. Já estamos arrumando.", 
    icon: <Server className="w-12 h-12 text-[#995052]" /> 
  },
};

export default function ErrorDisplay({ code }: ErrorProps) {
  const info = errorMap[code as keyof typeof errorMap] || errorMap[500];

  return (
    <div className="bg-[#274862] p-10 rounded-[2rem] border-2 border-[#995052] shadow-2xl text-center max-w-lg">
      <div className="flex justify-center mb-6">{info.icon}</div>
      <h2 className="text-4xl font-black italic uppercase text-white mb-2">{info.title}</h2>
      <p className="text-white/60 font-bold uppercase text-xs tracking-widest">{info.desc}</p>
      
      <button 
        onClick={() => window.location.reload()}
        className="mt-8 btn bg-[#d96831] border-none text-white font-black italic hover:bg-[#e6b33d] hover:text-[#172c3c]"
      >
        RECARREGAR
      </button>
    </div>
  );
}