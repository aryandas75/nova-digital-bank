import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../api/auth.api";

function Profile() {
    const navigate = useNavigate();

    const { user, logout, clearAuth } = useAuth();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!currentPassword || !newPassword) {
            setError("Please fill in both password fields.");
            return;
        }

        if (newPassword.length < 6) {
            setError(
                "New password must contain at least 6 characters."
            );
            return;
        }

        try {
            setLoading(true);

            const data = await changePassword({
                currentPassword,
                newPassword,
            });

            setSuccess(
                data.message ||
                "Password changed successfully. Please login again."
            );

            setCurrentPassword("");
            setNewPassword("");

            /*
             * IMPORTANT:
             *
             * Changing the password invalidates the current JWT.
             * Therefore, do NOT call the logout API here.
             *
             * Just clear the frontend authentication state
             * and navigate to the login page.
             */
            setTimeout(() => {
                clearAuth();
                navigate("/login", { replace: true });
            }, 1500);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to change password."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            setLogoutLoading(true);

            await logout();

            navigate("/login", { replace: true });

        } finally {
            setLogoutLoading(false);
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
                                Settings
                            </p>

                            <h1 className="mt-1 text-xl font-bold">
                                Profile
                            </h1>
                        </div>
                    </header>

                    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">

                        <div className="mb-8">
                            <p className="text-sm text-slate-500">
                                Manage your personal information and security.
                            </p>

                            <h2 className="mt-2 text-3xl font-black tracking-tight">
                                Your profile
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

                        <div className="grid gap-5 lg:grid-cols-2">

                            {/* USER INFO */}
                            <div className="rounded-3xl border border-white/8 bg-[#101512] p-6">

                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                                    Personal information
                                </p>

                                <div className="mt-6 flex items-center gap-4">

                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-2xl font-black text-black">
                                        {user?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "U"}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold">
                                            {user?.name || "User"}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {user?.email}
                                        </p>
                                    </div>

                                </div>

                                <div className="mt-8 space-y-4">

                                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                            Name
                                        </p>

                                        <p className="mt-1 text-sm font-semibold">
                                            {user?.name || "—"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                                            Email
                                        </p>

                                        <p className="mt-1 break-all text-sm font-semibold">
                                            {user?.email || "—"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-emerald-400" />

                                            <p className="text-xs font-bold text-emerald-400">
                                                Account secured
                                            </p>
                                        </div>

                                        <p className="mt-2 text-xs leading-5 text-slate-600">
                                            Your session is protected by authenticated
                                            cookies and token validation.
                                        </p>
                                    </div>

                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div className="rounded-3xl border border-white/8 bg-[#101512] p-6">

                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                                    Security
                                </p>

                                <h3 className="mt-2 text-xl font-bold">
                                    Change password
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Update your password to keep your
                                    account secure.
                                </p>

                                <form
                                    onSubmit={handlePasswordChange}
                                    className="mt-6 space-y-4"
                                >

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Current password
                                        </label>

                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) =>
                                                setCurrentPassword(
                                                    e.target.value
                                                )
                                            }
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#080b0a] px-4 py-3.5 text-sm focus:border-emerald-400/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                            New password
                                        </label>

                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(
                                                    e.target.value
                                                )
                                            }
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#080b0a] px-4 py-3.5 text-sm focus:border-emerald-400/50"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-2xl bg-emerald-400 px-5 py-3.5 text-sm font-black text-black hover:bg-emerald-300 disabled:opacity-50"
                                    >
                                        {loading
                                            ? "Updating..."
                                            : "Update password →"}
                                    </button>

                                </form>

                            </div>

                        </div>

                        {/* LOGOUT */}
                        <div className="mt-5 rounded-3xl border border-red-400/10 bg-red-400/[0.03] p-6">

                            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                                <div>
                                    <p className="font-bold text-white">
                                        Sign out of NOVA
                                    </p>

                                    <p className="mt-1 text-sm text-slate-600">
                                        End your current authenticated session.
                                    </p>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    disabled={logoutLoading}
                                    className="rounded-2xl border border-red-400/20 bg-red-400/5 px-6 py-3 text-sm font-bold text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                                >
                                    {logoutLoading
                                        ? "Signing out..."
                                        : "Sign out"}
                                </button>

                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}

export default Profile;