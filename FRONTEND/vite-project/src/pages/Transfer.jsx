import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
    findAccountByEmail,
    getMyAccount,
} from "../api/account.api";
import { createTransaction } from "../api/transaction.api";

function Transfer() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [receiver, setReceiver] = useState(null);
    const [amount, setAmount] = useState("");

    const [searching, setSearching] = useState(false);
    const [sending, setSending] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [step, setStep] = useState(1);

    // Find receiver using email
    const findReceiver = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setReceiver(null);

        if (!email.trim()) {
            setError("Please enter the receiver's email.");
            return;
        }

        try {
            setSearching(true);

            const data = await findAccountByEmail(email.trim());

            setReceiver(data.account);
            setStep(2);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to find this account."
            );
        } finally {
            setSearching(false);
        }
    };

    // Continue to amount
    const continueToAmount = () => {
        setError("");

        if (!receiver) {
            setError("Please find a receiver first.");
            return;
        }

        setStep(2);
    };

    // Continue to review
    const continueToReview = () => {
        setError("");

        const numericAmount = Number(amount);

        if (!amount || numericAmount <= 0) {
            setError("Please enter a valid amount.");
            return;
        }

        if (numericAmount > 1000000) {
            setError("Maximum transfer amount is ₹10,00,000.");
            return;
        }

        setStep(3);
    };

    // Send money
    const sendMoney = async () => {
        try {
            setSending(true);
            setError("");
            setSuccess("");

            /*
             * Get the logged-in user's bank account.
             *
             * IMPORTANT:
             * We are NOT using localhost here.
             * getMyAccount() uses your Axios instance,
             * which uses VITE_API_URL.
             */
            const accountData = await getMyAccount();

            const senderAccount =
                accountData.account?.find(
                    (account) =>
                        account.status === "active"
                ) || accountData.account?.[0];

            if (!senderAccount) {
                throw new Error(
                    "No active bank account found."
                );
            }

            // Generate unique idempotency key
            const idempotencyKey =
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 12)}`;

            // Create transaction
            await createTransaction({
                fromAccount: senderAccount._id,
                toAccount: receiver._id,
                amount: Number(amount),
                idempotencyKey,
            });

            // Success message
            setSuccess(
                `₹${Number(amount).toLocaleString(
                    "en-IN"
                )} sent successfully to ${receiver.name}.`
            );

            // Reset form
            setAmount("");
            setReceiver(null);
            setEmail("");
            setStep(1);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Transaction failed. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080b0a] text-white">
            <div className="flex">

                <Sidebar />

                <main className="min-w-0 flex-1">

                    {/* HEADER */}
                    <header className="border-b border-white/8 bg-[#080b0a]/90 px-5 py-5 backdrop-blur-xl sm:px-8">
                        <div className="mx-auto max-w-4xl">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
                                Payments
                            </p>

                            <h1 className="mt-1 text-xl font-bold tracking-tight">
                                Send money
                            </h1>
                        </div>
                    </header>

                    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">

                        {/* INTRO */}
                        <div className="mb-8">
                            <p className="text-sm text-slate-500">
                                Fast, simple and secure transfers.
                            </p>

                            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                                Move money with confidence.
                            </h2>
                        </div>

                        {/* STEPS */}
                        <div className="mb-6 flex items-center gap-2">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center"
                                >
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                            step >= item
                                                ? "bg-emerald-400 text-black"
                                                : "bg-white/5 text-slate-600"
                                        }`}
                                    >
                                        {item}
                                    </div>

                                    {item !== 3 && (
                                        <div
                                            className={`mx-2 h-px w-8 sm:w-16 ${
                                                step > item
                                                    ? "bg-emerald-400"
                                                    : "bg-white/10"
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}

                            <span className="ml-2 text-xs text-slate-600">
                                {step === 1 &&
                                    "Choose recipient"}

                                {step === 2 &&
                                    "Enter amount"}

                                {step === 3 &&
                                    "Review transfer"}
                            </span>
                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* SUCCESS */}
                        {success && (
                            <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-lg text-black">
                                        ✓
                                    </div>

                                    <div>
                                        <p className="font-bold text-emerald-400">
                                            Transfer successful
                                        </p>

                                        <p className="mt-1 text-sm text-slate-400">
                                            {success}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        navigate(
                                            "/transactions"
                                        )
                                    }
                                    className="mt-5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                                >
                                    View transaction history →
                                </button>
                            </div>
                        )}

                        {/* MAIN CARD */}
                        {!success && (
                            <div className="overflow-hidden rounded-3xl border border-white/8 bg-[#101512]">

                                {/* STEP 1 */}
                                {step === 1 && (
                                    <form
                                        onSubmit={findReceiver}
                                        className="p-6 sm:p-8"
                                    >
                                        <div className="mb-8">
                                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-xl text-emerald-400">
                                                @
                                            </div>

                                            <h3 className="text-xl font-bold">
                                                Who are you sending to?
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                                Enter the recipient's
                                                registered email address.
                                            </p>
                                        </div>

                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Receiver email
                                        </label>

                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="name@example.com"
                                            className="mt-3 w-full rounded-2xl border border-white/10 bg-[#080b0a] px-5 py-4 text-sm text-white placeholder:text-slate-700 transition focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20"
                                        />

                                        <button
                                            type="submit"
                                            disabled={searching}
                                            className="mt-5 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-black transition hover:bg-emerald-300 disabled:opacity-50"
                                        >
                                            {searching
                                                ? "Finding account..."
                                                : "Find receiver →"}
                                        </button>
                                    </form>
                                )}

                                {/* STEP 2 */}
                                {step === 2 && receiver && (
                                    <div className="p-6 sm:p-8">

                                        <div className="mb-8">
                                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-xl text-emerald-400">
                                                ₹
                                            </div>

                                            <h3 className="text-xl font-bold">
                                                How much?
                                            </h3>

                                            <p className="mt-2 text-sm text-slate-500">
                                                Enter the amount you want
                                                to transfer.
                                            </p>
                                        </div>

                                        {/* RECEIVER */}
                                        <div className="mb-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                                Sending to
                                            </p>

                                            <div className="mt-3 flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 font-bold text-black">
                                                    {receiver.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() ||
                                                        "U"}
                                                </div>

                                                <div>
                                                    <p className="font-bold text-white">
                                                        {receiver.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {receiver.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Amount
                                        </label>

                                        <div className="relative mt-3">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-emerald-400">
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                min="1"
                                                max="1000000"
                                                value={amount}
                                                onChange={(e) =>
                                                    setAmount(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="0"
                                                className="w-full rounded-2xl border border-white/10 bg-[#080b0a] py-5 pl-12 pr-5 text-2xl font-bold text-white placeholder:text-slate-700 focus:border-emerald-400/50"
                                            />
                                        </div>

                                        <div className="mt-5 flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setStep(1);
                                                    setReceiver(null);
                                                }}
                                                className="rounded-2xl border border-white/10 px-5 py-4 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white"
                                            >
                                                Back
                                            </button>

                                            <button
                                                onClick={
                                                    continueToReview
                                                }
                                                className="flex-1 rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-black hover:bg-emerald-300"
                                            >
                                                Continue →
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3 */}
                                {step === 3 && receiver && (
                                    <div className="p-6 sm:p-8">

                                        <div className="mb-8">
                                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-xl text-emerald-400">
                                                ✓
                                            </div>

                                            <h3 className="text-xl font-bold">
                                                Review transfer
                                            </h3>

                                            <p className="mt-2 text-sm text-slate-500">
                                                Check the details before
                                                sending.
                                            </p>
                                        </div>

                                        <div className="rounded-3xl border border-white/8 bg-[#080b0a] p-6">

                                            <div className="text-center">
                                                <p className="text-xs uppercase tracking-wider text-slate-600">
                                                    You're sending
                                                </p>

                                                <p className="mt-3 text-5xl font-black text-emerald-400">
                                                    ₹
                                                    {Number(
                                                        amount
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </p>
                                            </div>

                                            <div className="my-6 h-px bg-white/8" />

                                            <div className="space-y-4">

                                                <div className="flex justify-between gap-4">
                                                    <span className="text-sm text-slate-600">
                                                        Recipient
                                                    </span>

                                                    <span className="text-right text-sm font-semibold">
                                                        {receiver.name}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between gap-4">
                                                    <span className="text-sm text-slate-600">
                                                        Email
                                                    </span>

                                                    <span className="max-w-[60%] truncate text-right text-sm text-slate-400">
                                                        {receiver.email}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between gap-4">
                                                    <span className="text-sm text-slate-600">
                                                        Currency
                                                    </span>

                                                    <span className="text-sm font-semibold">
                                                        {receiver.currency ||
                                                            "INR"}
                                                    </span>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="mt-5 flex gap-3">

                                            <button
                                                onClick={() =>
                                                    setStep(2)
                                                }
                                                disabled={sending}
                                                className="rounded-2xl border border-white/10 px-5 py-4 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white"
                                            >
                                                Back
                                            </button>

                                            <button
                                                onClick={sendMoney}
                                                disabled={sending}
                                                className="flex-1 rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-black transition hover:bg-emerald-300 disabled:opacity-50"
                                            >
                                                {sending
                                                    ? "Sending..."
                                                    : `Send ₹${Number(
                                                          amount
                                                      ).toLocaleString(
                                                          "en-IN"
                                                      )}`}
                                            </button>

                                        </div>
                                    </div>
                                )}

                            </div>
                        )}

                        {/* SECURITY NOTE */}
                        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                            <span className="text-emerald-400">
                                ●
                            </span>

                            <p className="text-xs leading-5 text-slate-600">
                                Transfers are authenticated and
                                protected by your NOVA account session.
                            </p>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}

export default Transfer;