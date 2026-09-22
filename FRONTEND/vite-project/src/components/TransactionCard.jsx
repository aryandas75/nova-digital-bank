import { useState } from "react";

function TransactionCard({
    transaction,
    accountId
}) {
    const [showDetails, setShowDetails] =
        useState(false);

    const outgoing =
        String(transaction.fromAccount?._id) ===
        String(accountId);

    const personName = outgoing
        ? transaction.toAccount?.user?.name
        : transaction.fromAccount?.user?.name;

    const personEmail = outgoing
        ? transaction.toAccount?.user?.email
        : transaction.fromAccount?.user?.email;

    const date = transaction.createdAt
        ? new Date(
              transaction.createdAt
          ).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
          })
        : "Unknown date";

    const time = transaction.createdAt
        ? new Date(
              transaction.createdAt
          ).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit"
          })
        : "";

    return (
        <div className="py-4">

            {/* SUMMARY */}
            <button
                onClick={() =>
                    setShowDetails(!showDetails)
                }
                className="flex w-full items-center justify-between gap-4 text-left"
            >
                <div className="flex min-w-0 items-center gap-3">

                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            outgoing
                                ? "bg-red-400/10 text-red-400"
                                : "bg-emerald-400/10 text-emerald-400"
                        }`}
                    >
                        {outgoing ? "↗" : "↙"}
                    </div>

                    <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-white">
                            {outgoing
                                ? "Money sent"
                                : "Money received"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-600">
                            {outgoing
                                ? `To ${
                                      personName ||
                                      "Unknown"
                                  }`
                                : `From ${
                                      personName ||
                                      "Unknown"
                                  }`}
                            {" • "}
                            {date}
                        </p>

                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-4">

                    <div className="text-right">

                        <p
                            className={`text-sm font-bold ${
                                outgoing
                                    ? "text-red-400"
                                    : "text-emerald-400"
                            }`}
                        >
                            {outgoing ? "-" : "+"}
                            ₹
                            {Number(
                                transaction.amount
                            ).toLocaleString("en-IN")}
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-700">
                            {transaction.status}
                        </p>

                    </div>

                    <span
                        className={`text-xs text-slate-600 transition ${
                            showDetails
                                ? "rotate-180"
                                : ""
                        }`}
                    >
                        ↓
                    </span>

                </div>
            </button>

            {/* DETAILS */}
            {showDetails && (
                <div className="mt-4 rounded-2xl border border-white/8 bg-[#080b0a] p-5">

                    <div className="mb-5 flex items-center justify-between">

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                                Transaction details
                            </p>

                            <p className="mt-1 text-sm font-bold text-white">
                                {outgoing
                                    ? "Money sent"
                                    : "Money received"}
                            </p>
                        </div>

                        <span
                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                                transaction.status ===
                                "success"
                                    ? "bg-emerald-400/10 text-emerald-400"
                                    : transaction.status ===
                                      "failed"
                                    ? "bg-red-400/10 text-red-400"
                                    : "bg-yellow-400/10 text-yellow-400"
                            }`}
                        >
                            {transaction.status}
                        </span>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                        {/* AMOUNT */}
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                Amount
                            </p>

                            <p
                                className={`mt-1 text-lg font-bold ${
                                    outgoing
                                        ? "text-red-400"
                                        : "text-emerald-400"
                                }`}
                            >
                                {outgoing ? "-" : "+"}
                                ₹
                                {Number(
                                    transaction.amount
                                ).toLocaleString("en-IN")}
                            </p>
                        </div>

                        {/* PERSON */}
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                {outgoing
                                    ? "Receiver"
                                    : "Sender"}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-white">
                                {personName ||
                                    "Unknown"}
                            </p>

                            {personEmail && (
                                <p className="mt-1 truncate text-xs text-slate-600">
                                    {personEmail}
                                </p>
                            )}
                        </div>

                        {/* DATE */}
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                Date
                            </p>

                            <p className="mt-1 text-sm font-semibold text-white">
                                {date}
                            </p>
                        </div>

                        {/* TIME */}
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                Time
                            </p>

                            <p className="mt-1 text-sm font-semibold text-white">
                                {time}
                            </p>
                        </div>

                        {/* FROM ACCOUNT */}
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                From account
                            </p>

                            <p className="mt-1 break-all font-mono text-xs text-slate-400">
                                {transaction.fromAccount?._id ||
                                    "N/A"}
                            </p>
                        </div>

                        {/* TO ACCOUNT */}
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                To account
                            </p>

                            <p className="mt-1 break-all font-mono text-xs text-slate-400">
                                {transaction.toAccount?._id ||
                                    "N/A"}
                            </p>
                        </div>

                    </div>

                    {/* TRANSACTION ID */}
                    <div className="mt-5 border-t border-white/8 pt-4">
                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                            Transaction ID
                        </p>

                        <p className="mt-1 break-all font-mono text-xs text-slate-500">
                            {transaction._id}
                        </p>
                    </div>

                </div>
            )}
        </div>
    );
}

export default TransactionCard;