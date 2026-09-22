function StatCard({
    title,
    value,
    subtitle,
    icon,
    positive = false,
}) {
    return (
        <div className="group rounded-2xl border border-white/8 bg-[#101512] p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/20">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        {title}
                    </p>

                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">
                        {value}
                    </h3>

                    {subtitle && (
                        <p
                            className={`mt-2 text-xs ${
                                positive
                                    ? "text-emerald-400"
                                    : "text-slate-600"
                            }`}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-sm text-emerald-400">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default StatCard;