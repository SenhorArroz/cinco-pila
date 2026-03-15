"use client";
import React from "react";
import { BarChart, Bar, XAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";

interface ChartData {
  name: string;
  value: number;
  isAtual: boolean;
}

export default function SafeChart({ data }: { data: ChartData[] }) {
  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fontWeight: 900, fill: "#172c3c", opacity: 0.4 }} 
          />
          <Tooltip 
            cursor={{ fill: "#172c3c", fillOpacity: 0.05 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0 && payload[0]?.value !== undefined) {
                return (
                  <div className="bg-[#172c3c] p-2 rounded-lg text-white font-black text-[10px] shadow-xl">
                    R$ {Number(payload[0].value).toLocaleString("pt-BR")}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={35}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isAtual ? "#d96831" : "#172c3c"} 
                fillOpacity={entry.isAtual ? 1 : 0.1} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}