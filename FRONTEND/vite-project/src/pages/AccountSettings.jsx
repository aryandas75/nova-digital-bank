import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import BalanceCard from "../components/BalanceCard";
import {
    getMyAccount,
    getBalance,
    createAccount
} from "../api/account.api";

function AccountSettings() {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(0);

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadAccount = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMyAccount();

            const activeAccount =
                data.account?.find(
                    (item) => item.status === "active"
                ) || data.account?.[0];

            if (!activeAccount) {
                setAccount(null);
                return;
            }

            setAccount(activeAccount);

            const balanceData =
                await getBalance(activeAccount._id);

            setBalance(balanceData.balance);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load account."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccount();
    }, []);

    const handleCreateAccount = async () => {
        try {
            setCreating(true);
            setError("");
            setSuccess("");

            const data = await createAccount();

            setSuccess(
                data.message ||
                "Account created successfully."
            );

            await loadAccount();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to create account."
            );
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080b0a] text-white">
            <div className="flex">
                <Sidebar />

                <main className="min-w-0 flex-1">

                    <header className="border-b border-white/8 bg-[#080b0a]/90 px-5 py-5 backdrop-blur-xl sm:px-8">
                        <div className="mx-auto max-w-5xl">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
                                Banking
                            </p>

                            <h1 className="mt-1 text-xl font-bold">
                                Account
                            </h1>
                        </div>
                    </header>

                    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">

                        <div className="mb-8">
                            <p className="text-sm text-slate-500">
                                Manage and view your NOVA bank account.
                            </p>

                            <h2 className="mt-2 text-3xl font-black tracking-tight">
                                Account overview
                            </h2>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-400">
                                {success}
                            </div>
                        )}

                        {loading ? (
                            <div className="animate-pulse">

                                <div className="h-64 rounded-3xl bg-white/10" />

                                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                                    <div className="h-28 rounded-2xl bg-white/10" />
                                    <div className="h-28 rounded-2xl bg-white/10" />
                                    <div className="h-28 rounded-2xl bg-white/10" />
                                </div>

                            </div>
                        ) : !account ? (

                            <div className="rounded-3xl border border-white/8 bg-[#101512] px-6 py-20 text-center">

                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-2xl text-emerald-400">
                                    +
                                </div>

                                <h3 className="mt-5 text-xl font-bold">
                                    No bank account
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                                    Create your NOVA bank account to start
                                    receiving and sending money.
                                </p>

                                <button
                                    onClick={handleCreateAccount}
                                    disabled={creating}
                                    className="mt-6 rounded-2xl bg-emerald-400 px-6 py-3.5 text-sm font-black text-black hover:bg-emerald-300 disabled:opacity-50"
                                >
                                    {creating
                                        ? "Creating..."
                                        : "Create bank account →"}
                                </button>

                            </div>

                        ) : (

                            <>
                                <BalanceCard
                                    balance={balance}
                                    account={account}
                                />

                                <div className="mt-5 grid gap-4 sm:grid-cols-3">

                                    <div className="rounded-2xl border border-white/8 bg-[#101512] p-5">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                            Account ID
                                        </p>

                                        <p className="mt-3 break-all font-mono text-xs text-slate-300">
                                            {account._id}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/8 bg-[#101512] p-5">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                            Currency
                                        </p>

                                        <p className="mt-3 text-xl font-bold text-white">
                                            {account.currency || "INR"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/8 bg-[#101512] p-5">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                            Status
                                        </p>

                                        <p className="mt-3 flex items-center gap-2 text-sm font-bold capitalize text-emerald-400">
                                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                            {account.status}
                                        </p>
                                    </div>

                                </div>

                                <div className="mt-5 rounded-3xl border border-white/8 bg-[#101512] p-6">

                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                                        Account information
                                    </p>

                                    <div className="mt-5 space-y-4">

                                        <div className="flex flex-col justify-between gap-2 border-b border-white/5 pb-4 sm:flex-row">
                                            <span className="text-sm text-slate-600">
                                                Account created
                                            </span>

                                            <span className="text-sm font-semibold text-white">
                                                {account.createdAt
                                                    ? new Date(
                                                          account.createdAt
                                                      ).toLocaleDateString(
                                                          "en-IN",
                                                          {
                                                              day: "2-digit",
                                                              month: "long",
                                                              year: "numeric"
                                                          }
                                                      )
                                                    : "—"}
                                            </span>
                                        </div>

                                        <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                            <span className="text-sm text-slate-600">
                                                Account status
                                            </span>

                                            <span className="text-sm font-semibold capitalize text-emerald-400">
                                                {account.status}
                                            </span>
                                        </div>

                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}

export default AccountSettings;