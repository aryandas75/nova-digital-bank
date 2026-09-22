import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TransactionCard from "../components/TransactionCard";
import {
    getMyAccount
} from "../api/account.api";
import {
    getTransactions
} from "../api/transaction.api";

function Transactions() {
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTransactions, setTotalTransactions] =
        useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAccount = async () => {
        const data = await getMyAccount();

        const activeAccount =
            data.account?.find(
                (item) => item.status === "active"
            ) || data.account?.[0];

        if (!activeAccount) {
            throw new Error("No bank account found.");
        }

        setAccount(activeAccount);

        return activeAccount;
    };

    const loadTransactions = async (
        currentPage = page
    ) => {
        try {
            setLoading(true);
            setError("");

            let currentAccount = account;

            if (!currentAccount) {
                currentAccount = await loadAccount();
            }

            const data = await getTransactions(
                currentPage,
                10
            );

            setTransactions(
                data.transactions || []
            );

            setTotalPages(
                data.totalPages || 1
            );

            setTotalTransactions(
                data.totalTransactions ??
                data.total ??
                data.transactions?.length ??
                0
            );

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load transactions."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions(page);
    }, [page]);

    const handlePrevious = () => {
        if (page > 1) {
            setPage((current) => current - 1);
        }
    };

    const handleNext = () => {
        if (page < totalPages) {
            setPage((current) => current + 1);
        }
    };

    return (
        <div className="min-h-screen bg-[#080b0a] text-white">
            <div className="flex">

                <Sidebar />

                <main className="min-w-0 flex-1">

                    {/* HEADER */}
                    <header className="border-b border-white/8 bg-[#080b0a]/90 px-5 py-5 backdrop-blur-xl sm:px-8">
                        <div className="mx-auto max-w-5xl">

                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
                                Banking
                            </p>

                            <h1 className="mt-1 text-xl font-bold tracking-tight">
                                Activity
                            </h1>

                        </div>
                    </header>

                    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">

                        {/* TITLE */}
                        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                            <div>
                                <p className="text-sm text-slate-500">
                                    Your complete transaction history.
                                </p>

                                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                                    Recent activity
                                </h2>
                            </div>

                            <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2">
                                <span className="text-xs text-slate-500">
                                    Total{" "}
                                </span>

                                <span className="text-xs font-bold text-white">
                                    {totalTransactions}
                                </span>

                                <span className="text-xs text-slate-500">
                                    {" "}
                                    transactions
                                </span>
                            </div>

                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* CONTENT */}
                        <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#101512]">

                            {/* TOP BAR */}
                            <div className="border-b border-white/8 px-5 py-5 sm:px-6">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                                            Ledger
                                        </p>

                                        <h3 className="mt-1 font-bold text-white">
                                            Transactions
                                        </h3>
                                    </div>

                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                                        ↔
                                    </div>

                                </div>

                            </div>

                            {/* LOADING */}
                            {loading ? (
                                <div className="divide-y divide-white/5">

                                    {[1, 2, 3, 4, 5].map(
                                        (item) => (
                                            <div
                                                key={item}
                                                className="flex items-center justify-between p-5"
                                            >
                                                <div className="flex items-center gap-3">

                                                    <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />

                                                    <div>
                                                        <div className="h-3 w-28 animate-pulse rounded bg-white/10" />

                                                        <div className="mt-2 h-2 w-40 animate-pulse rounded bg-white/5" />
                                                    </div>

                                                </div>

                                                <div className="text-right">
                                                    <div className="h-3 w-20 animate-pulse rounded bg-white/10" />

                                                    <div className="mt-2 ml-auto h-2 w-12 animate-pulse rounded bg-white/5" />
                                                </div>
                                            </div>
                                        )
                                    )}

                                </div>
                            ) : transactions.length === 0 ? (

                                /* EMPTY */
                                <div className="px-5 py-20 text-center">

                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-2xl text-emerald-400">
                                        ↔
                                    </div>

                                    <h3 className="mt-5 text-lg font-bold">
                                        No transactions yet
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
                                        When you send or receive
                                        money, your activity will
                                        appear here.
                                    </p>

                                </div>

                            ) : (

                                /* TRANSACTIONS */
                                <div className="divide-y divide-white/5 px-5 sm:px-6">

                                    {transactions.map(
                                        (transaction) => (
                                            <TransactionCard
                                                key={
                                                    transaction._id
                                                }
                                                transaction={
                                                    transaction
                                                }
                                                accountId={
                                                    account?._id
                                                }
                                            />
                                        )
                                    )}

                                </div>
                            )}

                            {/* PAGINATION */}
                            {!loading &&
                                transactions.length > 0 && (
                                    <div className="flex flex-col gap-4 border-t border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                                        <p className="text-xs text-slate-600">
                                            Page{" "}
                                            <span className="font-bold text-slate-400">
                                                {page}
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-bold text-slate-400">
                                                {totalPages}
                                            </span>
                                        </p>

                                        <div className="flex gap-2">

                                            <button
                                                onClick={
                                                    handlePrevious
                                                }
                                                disabled={
                                                    page === 1
                                                }
                                                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                ← Previous
                                            </button>

                                            <button
                                                onClick={
                                                    handleNext
                                                }
                                                disabled={
                                                    page >=
                                                    totalPages
                                                }
                                                className="rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-bold text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                Next →
                                            </button>

                                        </div>

                                    </div>
                                )}

                        </div>

                        {/* SECURITY */}
                        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">

                            <span className="text-emerald-400">
                                ●
                            </span>

                            <p className="text-xs leading-5 text-slate-600">
                                Your transaction history is protected
                                by NOVA's authenticated banking session.
                            </p>

                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}

export default Transactions;