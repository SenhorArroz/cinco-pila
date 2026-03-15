interface Goal {
	id: string;
	currentAmount: number;
	targetAmount: number;
	title: string;
}
export default function MetasDashboard({ goal }: { goal: Goal }) {
	const percent = Math.min(
		Math.round((goal.currentAmount / goal.targetAmount) * 100),
		100,
	);

	return (
		<div key={goal.id} className="carousel-item snap-start w-full">
			<div className="w-full bg-[#172c3c] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
				<div className="relative z-10">
					<div className="flex justify-between mb-8">
						<h3 className="text-3xl font-black italic tracking-tighter uppercase w-2/3">
							{goal.title}
						</h3>
						<span className="text-3xl font-black italic text-[#e6b33d]">
							{percent}%
						</span>
					</div>
					<div className="bg-white/5 rounded-2xl p-6 border border-white/10">
						<p className="text-2xl font-black italic text-[#e6b33d]">
							R$ {goal.currentAmount.toLocaleString()}
						</p>
						<p className="text-[10px] font-black opacity-30 mt-1">
							META: R$ {goal.targetAmount.toLocaleString()}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
