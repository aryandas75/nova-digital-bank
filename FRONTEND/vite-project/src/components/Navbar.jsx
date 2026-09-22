import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {

    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const firstLetter =
        user?.name?.charAt(0)?.toUpperCase() || "U";

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">

            <div className="flex h-18 items-center justify-between px-5 md:px-8">

                {/* Logo */}

                <div
                    className="flex cursor-pointer items-center gap-3"
                    onClick={() => navigate("/dashboard")}
                >

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
                        M
                    </div>

                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-slate-900">
                            MyBank
                        </h1>

                        <p className="hidden text-[10px] font-medium uppercase tracking-widest text-slate-400 sm:block">
                            Secure Banking
                        </p>
                    </div>

                </div>

                {/* Right */}

                <div className="relative">

                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
                    >

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white">
                            {firstLetter}
                        </div>

                        <div className="hidden text-left md:block">

                            <p className="text-sm font-semibold text-slate-800">
                                {user?.name || "User"}
                            </p>

                            <p className="text-xs text-slate-400">
                                Personal Account
                            </p>

                        </div>

                        <span className="text-slate-400">
                            {open ? "▲" : "▼"}
                        </span>

                    </button>

                    {open && (

                        <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">

                            <button
                                onClick={() => navigate("/dashboard")}
                                className="w-full rounded-xl px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                            >
                                Dashboard
                            </button>

                            <button
                                onClick={() => navigate("/transactions")}
                                className="w-full rounded-xl px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                            >
                                Transactions
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                                onClick={handleLogout}
                                className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                                Logout
                            </button>

                        </div>

                    )}

                </div>

            </div>

        </header>
    );
}

export default Navbar;