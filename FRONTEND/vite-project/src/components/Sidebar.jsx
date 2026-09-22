import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const menu = [
        { name: "Overview", path: "/dashboard", icon: "⌂" },
        { name: "Send Money", path: "/transfer", icon: "↗" },
        { name: "Activity", path: "/transactions", icon: "↔" },
        { name: "Profile", path: "/profile", icon: "◉" },
        { name: "Account", path: "/account", icon: "▣" }
    ];

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <>
            <aside className="hidden min-h-screen w-64 shrink-0 border-r border-white/10 bg-[#0b0f0d] lg:block">
                <div className="sticky top-0 flex min-h-screen flex-col p-6">

                    {/* LOGO */}
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mb-12 flex items-center gap-3 text-left"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 font-black text-black">
                            N
                        </div>

                        <div>
                            <p className="text-lg font-bold tracking-tight text-white">
                                NOVA
                            </p>

                            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400">
                                Digital Bank
                            </p>
                        </div>
                    </button>

                    {/* MENU */}
                    <div>
                        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            Banking
                        </p>

                        <div className="space-y-1">
                            {menu.map((item) => {
                                const active =
                                    location.pathname === item.path;

                                return (
                                    <button
                                        key={item.path}
                                        onClick={() =>
                                            navigate(item.path)
                                        }
                                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                                            active
                                                ? "bg-emerald-400 text-black"
                                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-base">
                                            {item.icon}
                                        </span>

                                        <span className="font-medium">
                                            {item.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* BOTTOM */}
                    <div className="mt-auto">

                        {/* USER */}
                        <div className="mb-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400 font-bold text-black">
                                    {user?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "U"}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-white">
                                        {user?.name || "User"}
                                    </p>

                                    <p className="truncate text-xs text-slate-600">
                                        {user?.email || ""}
                                    </p>
                                </div>

                            </div>

                            <button
                                onClick={handleLogout}
                                className="mt-4 w-full rounded-xl border border-red-400/10 bg-red-400/5 px-3 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-400/10"
                            >
                                ↪ Sign out
                            </button>
                        </div>

                        {/* SECURITY */}
                        <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-xs font-semibold text-white">
                                    Security
                                </span>

                                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />
                            </div>

                            <p className="text-xs leading-5 text-slate-500">
                                Your account is protected with secure
                                authentication.
                            </p>
                        </div>

                        <p className="mt-5 text-center text-[10px] uppercase tracking-[0.2em] text-slate-700">
                            NOVA BANK © 2026
                        </p>
                    </div>
                </div>
            </aside>

            {/* MOBILE NAV */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0b0f0d]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
                <div className="grid grid-cols-5">
                    {menu.map((item) => {
                        const active =
                            location.pathname === item.path;

                        return (
                            <button
                                key={item.path}
                                onClick={() =>
                                    navigate(item.path)
                                }
                                className={`flex flex-col items-center gap-1 rounded-xl py-2 ${
                                    active
                                        ? "text-emerald-400"
                                        : "text-slate-500"
                                }`}
                            >
                                <span className="text-lg">
                                    {item.icon}
                                </span>

                                <span className="text-[9px] font-medium">
                                    {item.name === "Send Money"
                                        ? "Send"
                                        : item.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}

export default Sidebar;