interface Goal {
    id: string;
    currentAmount: number;
    targetAmount: number;
    color: string;
    title: string;
}

export default function MetasDashboard({ goal }: { goal: Goal }) {
    const percent = Math.min(
        Math.round((goal.currentAmount / goal.targetAmount) * 100),
        100,
    );

    return (
        <div className="carousel-item snap-start w-full pt-5">
            <div 
                className="w-full rounded-[3rem] h-70 p-7 text-white shadow-2xl relative overflow-hidden transition-all duration-500"
                style={{ backgroundColor: goal.color || "#172c3c" }}
            >
                {/* Barra de Progresso de Fundo (Efeito de Preenchimento) */}
                <div 
                    className="absolute bottom-0 left-0 w-full bg-white/10 transition-all duration-1000 ease-out"
                    style={{ height: `${percent}%` }}
                />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1 italic">
                                Objetivo
                            </p>
                            <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none truncate max-w-[200px]">
                                {goal.title}
                            </h3>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-4xl font-black italic leading-none">
                                {percent}<span className="text-[15px] opacity-60 ml-0.5">%</span>
                            </span>
                        </div>
                    </div>

                    <div className="bg-white/15 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 shadow-inner">
                        <div className="flex flex-col">
                            <p className="text-[10px] text-white font-black opacity-60 uppercase italic mb-1">
                                Saldo Acumulado
                            </p>
                            <p className="text-3xl font-black italic text-white leading-none">
                                R$ {goal.currentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                            </p>
                            <div className="h-[2px] w-full bg-white/20 my-4" />
                            <p className="text-[11px] text-white font-black opacity-80 italic">
                                ALVO: <span className="text-white">R$ {goal.targetAmount.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detalhe estético: Brilho no topo */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            </div>
        </div>
    );
}