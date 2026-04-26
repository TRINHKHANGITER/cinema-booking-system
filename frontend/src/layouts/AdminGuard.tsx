import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/slices/authSlice";

const AdminGuard = () => {
    const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
    const [starting, setStarting] = useState(true);

    const init = async () => {
        if (!accessToken) {
            await refresh();
        }

        if (accessToken && !user) {
            await fetchMe();
        }

        setStarting(false);
    };

    useEffect(() => {
        init().catch(console.error);
    }, []);

    if (starting || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--glx-bg-soft)] px-4">
                <div className="rounded-2xl border border-[var(--glx-border)] bg-white px-8 py-6 text-center shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                        Quản trị
                    </p>
                    <span className="mt-2 block animate-pulse text-sm font-semibold text-slate-600">
                        Đang tải không gian quản trị...
                    </span>
                </div>
            </div>
        );
    }

    if (!accessToken) {
        return <Navigate to="/" replace />;
    }

    if (user?.role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminGuard;

