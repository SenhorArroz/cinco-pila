"use client";
import { api, type RouterOutputs } from "~/trpc/react";
import { useState, useMemo } from "react";

type Limit = RouterOutputs["limites"]["getAll"][number];

export default function LimiteComponente({
	l,
	index,
}: {
	l: Limit;
	index: number;
}) {
	const utils = api.useUtils();

	// --- MUTATIONS ---
	const updateLimit = api.limites.update.useMutation({
		onSuccess: () => {
			void utils.limites.getAll.invalidate();
			setIsModalOpen(false);
		},
	});

	const deleteLimit = api.limites.delete.useMutation({
		onSuccess: () => void utils.limites.getAll.invalidate(),
	});

	// --- ESTADOS DO MODAL ---
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formData, setFormData] = useState({
		title: l.title,
		currentSpent: l.currentSpent,
		limitAmount: l.limitAmount,
		color: l.color,
	});

	// --- HANDLERS ---
	const handleOpenModal = () => {
		setFormData({
			title: l.title,
			currentSpent: l.currentSpent,
			limitAmount: l.limitAmount,
			color: l.color,
		});
		setIsModalOpen(true);
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		updateLimit.mutate({ id: l.id, ...formData });
	};

	const usage = (l.currentSpent / l.limitAmount) * 100;
	const isCritical = usage >= 85;

	return (
		<>
			<div
				key={l.id}
				style={
					{
						animationDelay: `${index * 50}ms`,
						"--tw-ring-color": isCritical ? "#995052" : l.color || "#172c3c",
					} as React.CSSProperties
				}
				className={`
                    group p-8 rounded-[2.5rem] shadow-xl transition-all duration-500 relative overflow-hidden animate-in zoom-in-95
                    ${isCritical ? "bg-[#995052] text-white scale-95 z-10" : "bg-white text-[#172c3c] hover:shadow-2xl hover:-translate-y-1"}
                    ${isCritical && usage < 100 ? "ring-5 ring-offset-4 ring-offset-[#f0f2f5] animate-pulse-slow" : "ring-4"}
                  `}
			>
				{isCritical && (
					<div className="absolute top-4 right-6">
						<span className="relative flex h-3 w-3">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
							<span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
						</span>
					</div>
				)}

				<div className="mb-10">
					<span
						className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${isCritical ? "bg-yellow-500/50 text-white" : ""}`}
						style={
							!isCritical
								? { backgroundColor: `${l.color}1A`, color: l.color }
								: {}
						}
					>
						Gasto Ativo
					</span>
					<h3 className="text-xl font-black mt-3 leading-tight uppercase tracking-tighter truncate">
						{l.title}
					</h3>
				</div>

				<div className="space-y-4">
					<div className="flex justify-between items-end">
						<div>
							<p className="text-[10px] font-black opacity-40 uppercase">
								Gasto
							</p>
							<p className="text-2xl font-black italic">
								R$ {l.currentSpent.toFixed(2)}
							</p>
						</div>
						<div className="text-right">
							<p className="text-[10px] font-black opacity-40 uppercase">
								Teto
							</p>
							<p className="text-sm font-bold opacity-60">R$ {l.limitAmount}</p>
						</div>
					</div>

					<div
						className={`h-4 w-full rounded-full overflow-hidden p-1 border transition-all duration-500 ${isCritical ? "border-white/20 bg-white/10" : "border-[#172c3c]/10 bg-black/5"}`}
					>
						<div
							className={`h-full rounded-full transition-all duration-1000 ease-out ${isCritical ? "bg-[#e6b33d]" : "bg-[#172c3c]"}`}
							style={{ width: `${Math.min(usage, 100)}%` }}
						/>
					</div>
					<p
						className={`text-[10px] font-black uppercase tracking-widest ${isCritical ? "text-white" : "opacity-40"}`}
					>
						{usage >= 100
							? "⚠️ LIMITE EXCEDIDO"
							: `RESTAM R$ ${(l.limitAmount - l.currentSpent).toFixed(2)}`}
					</p>
				</div>

				<div className="mt-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
					<button
						onClick={handleOpenModal}
						className={`btn btn-xs flex-1 rounded-lg border-none font-black ${isCritical ? "bg-white text-[#995052] hover:bg-[#e6b33d]" : "bg-[#172c3c] text-white"}`}
					>
						AJUSTAR
					</button>
					<button
						onClick={() => {
							if (confirm("Remover?")) deleteLimit.mutate({ id: l.id });
						}}
						className={`btn btn-xs rounded-lg border-none ${isCritical ? "bg-white/20 text-white hover:bg-white/40" : "bg-[#f0f2f5] text-[#172c3c]"}`}
					>
						✕
					</button>
				</div>
			</div>

			{/* MODAL PARA AJUSTE */}
			{isModalOpen && (
				<div className="modal modal-open backdrop-blur-sm z-50">
					<div className="modal-box bg-white border-4 border-[#172c3c] rounded-[2rem] animate-in zoom-in-95">
						<h3 className="font-black text-2xl uppercase italic mb-6 text-[#172c3c]">
							Editar Limite
						</h3>

						<form onSubmit={handleSave} className="space-y-4">
							<div className="form-control">
								<label className="label uppercase font-black text-[10px]">
									O que é esse gasto?
								</label>
								<input
									type="text"
									required
									className="input input-bordered border-2 border-[#172c3c] rounded-xl focus:outline-none font-bold bg-white text-[#172c3c]"
									value={formData.title}
									onChange={(e) =>
										setFormData({ ...formData, title: e.target.value })
									}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="form-control">
									<label className="label uppercase font-black text-[10px]">
										Valor Já Gasto
									</label>
									<input
										type="number"
										step="0.01"
										className="input input-bordered border-2 border-[#172c3c] rounded-xl font-bold bg-white text-[#172c3c]"
										value={formData.currentSpent}
										onChange={(e) =>
											setFormData({
												...formData,
												currentSpent: Number(e.target.value),
											})
										}
									/>
								</div>
								<div className="form-control">
									<label className="label uppercase font-black text-[10px]">
										Limite Máximo
									</label>
									<input
										type="number"
										step="0.01"
										required
										className="input input-bordered border-2 border-[#172c3c] rounded-xl font-black text-[#d96831] bg-white"
										value={formData.limitAmount}
										onChange={(e) =>
											setFormData({
												...formData,
												limitAmount: Number(e.target.value),
											})
										}
									/>
								</div>
								<div className="form-control">
									<label className="label uppercase font-black text-[10px]">
										Cor
									</label>
									<input
										type="color"
										className="input input-bordered border-2 border-[#172c3c] rounded-xl font-bold bg-white text-[#172c3c]"
										value={formData.color}
										onChange={(e) =>
											setFormData({ ...formData, color: e.target.value })
										}
									/>
								</div>
							</div>

							<div className="modal-action">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="btn btn-ghost font-bold text-[#172c3c]"
								>
									Cancelar
								</button>
								<button
									disabled={updateLimit.isPending}
									type="submit"
									className="btn bg-[#172c3c] text-white hover:bg-[#d96831] border-none px-8 font-black"
								>
									{updateLimit.isPending ? "SALVANDO..." : "SALVAR"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
