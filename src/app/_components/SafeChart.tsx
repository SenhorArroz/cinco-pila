"use client";
import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface ChartData {
  name: string;
  value: number;
  isAtual: boolean;
}

export default function SafeChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) return null;

  const maxGasto = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full space-y-5 py-2">
      {data.map((mes, i) => {
        const anterior = data[i - 1];
        const subiu = anterior ? mes.value > anterior.value : false;
        const desceu = anterior ? mes.value < anterior.value : false;
        const percentual = (mes.value / maxGasto) * 100;

        return (
          <div key={i} className={`flex flex-col gap-1.5 ${mes.isAtual ? "opacity-100" : "opacity-40"}`}>
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase italic ${mes.isAtual ? "text-[#d96831]" : "text-[#172c3c]"}`}>
                  {mes.name}
                </span>
                {mes.isAtual && (
                  <span className="bg-[#d96831] text-white text-[7px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                    HOJE
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black italic">
                  R$ {mes.value.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                </span>
                {anterior && (
                  subiu ? <ArrowUpRight size={14} className="text-red-500" /> : 
                  desceu ? <ArrowDownRight size={14} className="text-emerald-500" /> : 
                  <Minus size={14} className="text-slate-300" />
                )}
              </div>
            </div>

            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${mes.isAtual ? "bg-[#d96831]" : "bg-[#172c3c]"}`}
                style={{ width: `${Math.max(percentual, 2)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}