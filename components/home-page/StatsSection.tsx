export default function StatsSection() {
	const stats = [
		{ value: 10000, label: "Travelers", suffix: "+", showIcon: false },
		{
			value: 150,
			label: "Hidden Destinations",
			suffix: "+",
			showIcon: false,
		},
		{
			value: 4.9,
			label: "Average Rating",
			suffix: "",
			decimals: true,
			showIcon: false,
		},
		{ value: 25, label: "Years Experience", suffix: "+", showIcon: false },
	];

	return (
		<section className="bg-muted/20 py-14 sm:py-16">
			<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
					{stats.map((stat, index) => (
						<div
							key={index}
							className="rounded-xl border bg-card p-5 text-center">
							<div className="mb-2 flex items-center justify-center gap-1 text-2xl font-semibold text-foreground sm:text-3xl">
								{stat.decimals ? (
									<div className="flex items-center gap-2">
										<span>{stat.value}</span>
									</div>
								) : (
									<>
										{stat.value.toLocaleString()}
										{stat.suffix}
									</>
								)}
							</div>
							<div className="text-xs text-muted-foreground sm:text-sm">
								{stat.label}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
