import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            await login({
                email: email.trim(),
                password
            });

            navigate("/dashboard");
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#080b0a] text-white">
            <div className="grid min-h-screen lg:grid-cols-2">

                {/* LEFT */}
                <div className="hidden border-r border-white/8 bg-[#0b0f0d] lg:flex lg:flex-col lg:justify-between lg:p-12">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 font-black text-black">
                                N
                            </div>

                            <div>
                                <p className="text-xl font-black">
                                    NOVA
                                </p>
                                <p className="text-[9px] uppercase tracking-[0.25em] text-emerald-400">
                                    Digital Bank
                                </p>
                            </div>
                        </div>

                        <div className="mt-32 max-w-lg">
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                                Banking, simplified
                            </p>

                            <h1 className="mt-5 text-6xl font-black leading-[0.95] tracking-tight">
                                Your money.
                                <br />
                                Your control.
                            </h1>

                            <p className="mt-7 max-w-md text-base leading-7 text-slate-500">
                                A secure digital banking experience
                                built around simplicity, speed and
                                complete visibility.
                            </p>
                        </div>
                    </div>

                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-700">
                        NOVA BANK © 2026
                    </p>
                </div>

                {/* RIGHT */}
                <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
                    <div className="w-full max-w-md">

                        {/* MOBILE LOGO */}
                        <div className="mb-12 lg:hidden">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 font-black text-black">
                                    N
                                </div>

                                <div>
                                    <p className="text-lg font-black">
                                        NOVA
                                    </p>
                                    <p className="text-[8px] uppercase tracking-[0.25em] text-emerald-400">
                                        Digital Bank
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                                Welcome back
                            </p>

                            <h2 className="mt-2 text-3xl font-black tracking-tight">
                                Sign in to NOVA.
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Access your account securely.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    className="mt-3 w-full rounded-2xl border border-white/10 bg-[#101512] px-5 py-4 text-sm text-white placeholder:text-slate-700 transition focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="mt-3 w-full rounded-2xl border border-white/10 bg-[#101512] px-5 py-4 text-sm text-white placeholder:text-slate-700 transition focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-black transition hover:bg-emerald-300 disabled:opacity-50"
                            >
                                {loading
                                    ? "Signing in..."
                                    : "Sign in →"}
                            </button>
                        </form>

                        <div className="my-7 flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/8" />
                            <span className="text-[10px] uppercase tracking-wider text-slate-700">
                                or
                            </span>
                            <div className="h-px flex-1 bg-white/8" />
                        </div>

                        <p className="text-center text-sm text-slate-500">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="font-bold text-emerald-400 hover:text-emerald-300"
                            >
                                Create one
                            </Link>
                        </p>

                        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-slate-700">
                            <span className="text-emerald-400">
                                ●
                            </span>
                            Secure authenticated session
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;