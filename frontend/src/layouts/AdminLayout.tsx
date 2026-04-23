import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/slices/authSlice";

type AdminNavItem = {
    path: string;
    label: string;
    end?: boolean;
};

const adminNavItems: AdminNavItem[] = [
    { path: "/admin", label: "Dashboard", end: true },
    { path: "/admin/users", label: "User Management" },
    { path: "/admin/movie-types", label: "Movie Type Management" },
    { path: "/admin/room-types", label: "Room Type Management" },
    { path: "/admin/seat-types", label: "Seat Type Management" },
    { path: "/admin/movies", label: "Movie Management" },
    { path: "/admin/showtimes", label: "Showtime Management" },
];

const resolveCurrentSection = (pathname: string) => {
    return (
        adminNavItems.find(
            (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
        ) ?? adminNavItems[0]
    );
};

const AdminLayout = () => {
    const location = useLocation();
    const currentSection = resolveCurrentSection(location.pathname);
    const { user, signOut } = useAuthStore();

    return (
        <div className="min-h-screen overflow-x-hidden bg-[var(--glx-bg-soft)] text-[var(--glx-text-primary)] lg:grid lg:grid-cols-[270px_minmax(0,1fr)]">
            <aside className="hidden border-r border-[var(--glx-border)] bg-gradient-to-b from-[var(--glx-blue)] to-[var(--glx-blue-strong)] text-white lg:flex lg:flex-col">
                <div className="border-b border-white/15 px-6 py-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                        Galaxy Cinema
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">Admin Panel</h2>
                    <p className="mt-3 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white/85">
                        {user?.fullName ?? user?.email ?? "Administrator"}
                    </p>
                </div>

                <nav className="flex-1 space-y-2 p-4">
                    {adminNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                [
                                    "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-300",
                                    isActive
                                        ? "border-[var(--glx-orange)] bg-[var(--glx-orange)] text-white shadow-[0_10px_24px_rgba(245,128,32,0.35)]"
                                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10 hover:text-white",
                                ].join(" ")
                            }
                        >
                            <span className="h-2 w-2 rounded-full bg-current opacity-85" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4">
                    <button
                        type="button"
                        onClick={() => {
                            void signOut();
                        }}
                        className="w-full rounded-xl border border-white/30 px-3 py-2 text-sm font-semibold text-white transition-all duration-300 hover:border-[var(--glx-orange)] hover:bg-[var(--glx-orange)]"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            <div className="flex min-h-screen min-w-0 flex-col">
                <header className="sticky top-0 z-20 border-b border-[var(--glx-border)] bg-[var(--glx-surface)]/95 backdrop-blur">
                    <div className="mx-auto flex w-full min-w-0 max-w-[1480px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                                    Admin Workspace
                                </p>
                                <h1 className="mt-1 truncate text-2xl font-bold text-slate-800">
                                    {currentSection.label}
                                </h1>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    void signOut();
                                }}
                                className="shrink-0 rounded-lg border border-[var(--glx-orange)] px-3 py-2 text-sm font-semibold text-[var(--glx-orange)] transition-all duration-300 hover:bg-[var(--glx-orange)] hover:text-white lg:hidden"
                            >
                                Sign Out
                            </button>
                        </div>

                        <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                            {adminNavItems.map((item) => (
                                <NavLink
                                    key={`mobile-${item.path}`}
                                    to={item.path}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        [
                                            "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-semibold transition-all duration-300",
                                            isActive
                                                ? "border-[var(--glx-orange)] bg-[var(--glx-orange)] text-white"
                                                : "border-[var(--glx-border)] bg-white text-slate-600 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]",
                                        ].join(" ")
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </header>

                <main className="mx-auto w-full min-w-0 max-w-[1480px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
                    <div className="min-w-0">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
