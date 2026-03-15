"use client";
import React from "react";

interface ChartData {
  name?: string; // Interrogação aqui resolve o erro de "undefined"
  value: number;
  isAtual: boolean;
}

export default function SafeChart({ data }: { data: ChartData[] }) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 200; 
  const barWidth = 40;
  const gap = 20;

  return (
    <div className="w-full h-full flex flex-col items-center justify-end min-h-[250px]">
      <svg 
        viewBox={`0 0 ${data.length * (barWidth + gap)} ${chartHeight + 40}`} 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {data.map((entry, i) => {
          const barHeight = (entry.value / maxValue) * chartHeight;
          const x = i * (barWidth + gap);
          const y = chartHeight - barHeight;

          return (
            <g key={i} className="group cursor-pointer">
              <title>{`${entry.name ?? "Mês"}: R$ ${entry.value.toLocaleString("pt-BR")}`}</title>
              
              {/* Barra de Fundo */}
              <rect x={x} y={0} width={barWidth} height={chartHeight} rx={8} fill="#172c3c" fillOpacity={0.03} />

              {/* Barra de Valor com Transição */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={8}
                fill={entry.isAtual ? "#d96831" : "#172c3c"}
                fillOpacity={entry.isAtual ? 1 : 0.1}
                className="transition-all duration-700"
              />

              {/* Label do Mês - Usando ?? para garantir string */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 25}
                textAnchor="middle"
                fontSize="12"
                fontWeight="900"
                fill="#172c3c"
                opacity={0.4}
                className="italic uppercase"
              >
                {entry.name ?? "---"}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}