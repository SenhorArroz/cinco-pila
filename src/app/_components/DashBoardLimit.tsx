import { type RouterOutputs } from "~/trpc/react";

type Limit = RouterOutputs["limites"]["getAll"][number];

export default function DashBoardLimit({
    l,
    index,
}: {
    l: Limit;
    index: number;
}) {
    const usage = (l.currentSpent / l.limitAmount) * 100;
    const isCritical = usage >= 85;

    return (
        <div
            className="carousel-item p-5 snap-start w-80"
            
        >
            <div
                className={`
                    w-full h-70 p-8 rounded-[2.5rem] shadow-xl transition-all duration-500 relative overflow-hidden flex flex-col justify-between
                    ${isCritical 
                        ? "bg-[#995052] text-white scale-95 z-10" 
                        : "bg-white text-[#172c3c] hover:shadow-2xl hover:-translate-y-0.5"
                    }
                    ${isCritical && usage < 100 
                        ? "ring-5 ring-offset animate-pulse-slow" 
                        : "ring-4"
                    }
                `}
                style={
                {
                    animationDelay: `${index * 50}ms`,
                    "--tw-ring-color": isCritical ? "#995052" : l.color || "#172c3c",
                } as React.CSSProperties
            }
            >
                {/* INDICADOR DE ALERTA (PING) */}
                {isCritical && (
                    <div className="absolute top-6 right-8">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e6b33d]"></span>
                        </span>
                    </div>
                )}

                {/* TOPO: Badge e Título */}
                <div className="relative">
                    <span
                        className={`text-[9px] font-black uppercase px-2 py-1 rounded-md italic tracking-widest ${
                            isCritical ? "bg-[#e6b33d] text-[#172c3c]" : ""
                        }`}
                        style={
                            !isCritical
                                ? { backgroundColor: `${l.color}1A`, color: l.color }
                                : {}
                        }
                    >
                        {isCritical ? "⚠️ Risco Alto" : "Gasto Ativo"}
                    </span>
                    <h3 className="text-2xl font-black mt-4 leading-none uppercase italic tracking-tighter truncate">
                        {l.title}
                    </h3>
                </div>

                {/* MEIO: Valores e Barra de Progresso */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-black opacity-40 uppercase italic">Gasto</p>
                            <p className="text-3xl font-black italic tracking-tighter leading-none">
                                R$ {l.currentSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className={`text-sm font-black italic ${isCritical ? 'text-[#e6b33d]' : 'opacity-40'}`}>
                                {Math.round(usage)}%
                            </p>
                        </div>
                    </div>

                    {/* Barra de Progresso Customizada */}
                    <div className={`h-4 w-full rounded-full overflow-hidden p-1 border transition-all duration-500 ${
                        isCritical ? "border-white/20 bg-white/10" : "border-[#172c3c]/10 bg-black/5"
                    }`}>
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                isCritical ? "bg-[#e6b33d]" : "bg-[#172c3c]"
                            }`}
                            style={{ 
                                width: `${Math.min(usage, 100)}%`,
                                backgroundColor: !isCritical ? l.color : undefined 
                            }}
                        />
                    </div>
                    <p className={`text-[9px] font-black uppercase italic tracking-widest ${isCritical ? "text-white" : "opacity-40"}`}>
                        {usage >= 100 ? "Limite Excedido" : `Restam R$ ${(l.limitAmount - l.currentSpent).toFixed(2)}`}
                    </p>
                </div>

                {/* BASE: Teto Máximo */}
                <div className="flex justify-between items-end border-t border-black/5 pt-4">
                    <div>
                        <p className="text-[9px] font-black opacity-40 uppercase italic leading-none">Teto Máximo</p>
                        <p className="text-lg font-black italic opacity-60">
                            R$ {l.limitAmount.toLocaleString("pt-BR")}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className={`text-[10px] font-black uppercase italic tracking-widest ${
                            isCritical ? "text-[#e6b33d]" : "text-[#d96831]"
                        }`}>
                            {isCritical ? "Esgotando" : "Seguro"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}