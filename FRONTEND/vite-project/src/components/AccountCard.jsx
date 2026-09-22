function AccountCard({ account }) {

    if (!account) {
        return (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6">

                <p className="text-sm text-slate-500">
                    No account information available.
                </p>

            </div>
        );
    }

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Bank Account
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                        Primary Account
                    </h3>

                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    {account.status || "Active"}
                </span>

            </div>

            <div className="mt-6 space-y-4">

                <div>
                    <p className="text-xs text-slate-400">
                        Account ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm text-slate-700">
                        {account._id || account.id}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-slate-400">
                        Currency
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                        {account.currency || "INR"}
                    </p>
                </div>

            </div>

        </div>
    );
}

export default AccountCard;