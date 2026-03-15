import { AlertCircle, Calendar } from "lucide-react";

interface LembreteProps {
  titulo: string;
  valor: string;
  dias: number;
  urgente: boolean;
}

export const LembreteCard = ({ titulo, valor, dias, urgente }: LembreteProps) => (
  <div className={`p-4 rounded-[2rem] border-l-8 transition-all hover:scale-[1.02] cursor-pointer shadow-sm
    ${urgente ? 'border-[#995052] bg-red-50/40' : 'border-[#172c3c] bg-slate-50'}`}>
    <div className="flex justify-between items-start mb-2">
      <h4 className="text-[10px] font-black uppercase italic text-[#172c3c] leading-tight w-2/3">{titulo}</h4>
      <span className="text-[10px] font-black text-[#172c3c]">R$ {valor}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${urgente ? 'bg-[#995052] animate-ping' : 'bg-[#172c3c]'}`} />
      <p className="text-[8px] font-bold opacity-50 uppercase tracking-tighter">
        Vence em {dias} {dias === 1 ? 'dia' : 'dias'}
      </p>
    </div>
  </div>
);