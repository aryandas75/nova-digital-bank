function BalanceCard({ balance, account }) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-300 to-teal-400 p-7 text-black shadow-[0_20px_60px_rgba(52,211,153,0.12)]">

            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-black/10" />

            <div className="absolute -bottom-24 right-20 h-48 w-48 rounded-full border border-black/10" />

            <div className="relative">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/50">
                            Available Balance
                        </p>

                        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                            ₹
                            {Number(
                                balance || 0
                            ).toLocaleString("en-IN")}
                        </h1>
                    </div>

                    <div className="rounded-full bg-black/10 px-3 py-1 text-xs font-bold">
                        INR
                    </div>
                </div>

                <div className="mt-12 flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                            Account
                        </p>

                        <p className="mt-1 font-mono text-sm font-semibold">
                            ••••{" "}
                            {account?._id?.slice(-4) ||
                                "----"}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                            Status
                        </p>

                        <p className="mt-1 text-sm font-bold capitalize">
                            {account?.status ||
                                "Active"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BalanceCard;