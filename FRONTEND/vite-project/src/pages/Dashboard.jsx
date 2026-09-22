import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import Sidebar from "../components/Sidebar";
import BalanceCard from "../components/BalanceCard";
import StatCard from "../components/StatCard";
import TransactionCard from "../components/TransactionCard";

import {
    getMyAccount,
    getBalance,
} from "../api/account.api";

import {
    getTransactions,
} from "../api/transaction.api";

function Dashboard() {
    const navigate = useNavigate();

    const { user } = useAuth();

    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const accountData =
                await getMyAccount();

            const activeAccount =
                accountData.account?.find(
                    (item) =>
                        item.status === "active"
                ) ||
                accountData.account?.[0];

            if (!activeAccount) {
                setError(
                    "No bank account found."
                );

                return;
            }

            setAccount(activeAccount);

            const balanceData =
                await getBalance(
                    activeAccount._id
                );

            setBalance(
                balanceData.balance || 0
            );

            const transactionData =
                await getTransactions(
                    1,
                    10
                );

            setTransactions(
                transactionData.transactions ||
                    []
            );
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                    "Unable to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const refreshDashboard = async () => {
        try {
            setRefreshing(true);
            setError("");

            const balanceData =
                await getBalance(
                    account._id
                );

            setBalance(
                balanceData.balance || 0
            );

            const transactionData =
                await getTransactions(
                    1,
                    10
                );

            setTransactions(
                transactionData.transactions ||
                    []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to refresh dashboard"
            );
        } finally {
            setRefreshing(false);
        }
    };

    const totalReceived =
        transactions
            .filter(
                (transaction) =>
                    String(
                        transaction.toAccount?._id
                    ) === String(account?._id)
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(transaction.amount),
                0
            );

    const totalSent =
        transactions
            .filter(
                (transaction) =>
                    String(
                        transaction.fromAccount?._id
                    ) === String(account?._id)
            )
            .reduce(
                (total, transaction) =>
                    total +
                    Number(transaction.amount),
                0
            );

    const recentTransactions =
        transactions.slice(0, 5);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080b0a]">
                <div className="flex">
                    <Sidebar />

                    <main className="min-w-0 flex-1 p-6">
                        <div className="mx-auto max-w-7xl animate-pulse">
                            <div className="h-3 w-28 rounded bg-white/10" />

                            <div className="mt-3 h-8 w-52 rounded bg-white/10" />

                            <div className="mt-8 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
                                <div className="h-64 rounded-3xl bg-white/10" />

                                <div className="h-64 rounded-3xl bg-white/10" />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080b0a] text-white">
            <div className="flex">
                <Sidebar />

                <main className="min-w-0 flex-1">
                    {/* HEADER */}
                    <header className="border-b border-white/8 bg-[#080b0a]/90 px-5 py-5 backdrop-blur-xl sm:px-8">
                        <div className="mx-auto flex max-w-7xl items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
                                    Personal banking
                                </p>

                                <h1 className="mt-1 text-xl font-bold">
                                    Overview
                                </h1>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={
                                        refreshDashboard
                                    }
                                    disabled={
                                        refreshing
                                    }
                                    className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:block"
                                >
                                    {refreshing
                                        ? "Refreshing..."
                                        : "↻ Refresh"}
                                </button>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/profile"
                                        )
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 font-bold text-black"
                                >
                                    {user?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "U"}
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
                        <div className="mb-7">
                            <p className="text-sm text-slate-500">
                                Welcome back,
                            </p>

                            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                                {user?.name ||
                                    "User"}
                            </h2>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-2xl border border-red-400/10 bg-red-400/5 p-4 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* BALANCE + ACTIONS */}
                        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
                            <BalanceCard
                                balance={balance}
                                account={account}
                            />

                            <div className="rounded-3xl border border-white/8 bg-[#101512] p-6">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                                    Quick actions
                                </p>

                                <h3 className="mt-1 text-lg font-bold">
                                    What would you like to do?
                                </h3>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <Link
                                        to="/transfer"
                                        className="rounded-2xl bg-emerald-400 p-5 text-black transition hover:-translate-y-1 hover:bg-emerald-300"
                                    >
                                        <div className="text-xl">
                                            ↗
                                        </div>

                                        <p className="mt-5 font-bold">
                                            Send money
                                        </p>

                                        <p className="mt-1 text-xs text-black/50">
                                            Transfer funds
                                        </p>
                                    </Link>

                                    <Link
                                        to="/transactions"
                                        className="rounded-2xl border border-white/8 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10"
                                    >
                                        <div className="text-xl text-emerald-400">
                                            ↔
                                        </div>

                                        <p className="mt-5 font-bold">
                                            Activity
                                        </p>

                                        <p className="mt-1 text-xs text-slate-600">
                                            View history
                                        </p>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* STATS */}
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                title="Balance"
                                value={`₹${Number(
                                    balance || 0
                                ).toLocaleString(
                                    "en-IN"
                                )}`}
                                subtitle="Available now"
                                icon="₹"
                                positive
                            />

                            <StatCard
                                title="Received"
                                value={`₹${Number(
                                    totalReceived || 0
                                ).toLocaleString(
                                    "en-IN"
                                )}`}
                                subtitle="Recent activity"
                                icon="↓"
                                positive
                            />

                            <StatCard
                                title="Sent"
                                value={`₹${Number(
                                    totalSent || 0
                                ).toLocaleString(
                                    "en-IN"
                                )}`}
                                subtitle="Recent activity"
                                icon="↑"
                            />

                            <StatCard
                                title="Activity"
                                value={
                                    transactions.length
                                }
                                subtitle="Recent transactions"
                                icon="↔"
                            />
                        </div>

                        {/* ACTIVITY */}
                        <div className="mt-5 rounded-3xl border border-white/8 bg-[#101512] p-5 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                                        Activity
                                    </p>

                                    <h3 className="mt-1 text-lg font-bold">
                                        Recent transactions
                                    </h3>
                                </div>

                                <Link
                                    to="/transactions"
                                    className="text-xs font-semibold text-emerald-400"
                                >
                                    View all →
                                </Link>
                            </div>

                            <div className="mt-4 divide-y divide-white/5">
                                {recentTransactions.length ===
                                0 ? (
                                    <div className="py-14 text-center">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 text-xl text-emerald-400">
                                            ↔
                                        </div>

                                        <p className="mt-4 font-semibold">
                                            No transactions yet
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600">
                                            Your recent banking activity will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    recentTransactions.map(
                                        (
                                            transaction
                                        ) => (
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
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;