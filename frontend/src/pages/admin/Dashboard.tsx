const overviewCards = [
    {
        title: "Tickets Sold Today",
        value: "1,284",
        change: "+12.4%",
        description: "Compared to yesterday",
    },
    {
        title: "Total Revenue",
        value: "256.4M VND",
        change: "+8.1%",
        description: "Daily gross revenue",
    },
    {
        title: "Active Movies",
        value: "27",
        change: "+3",
        description: "Now showing and upcoming",
    },
    {
        title: "Seat Occupancy",
        value: "74%",
        change: "+5.7%",
        description: "Average for today",
    },
];

const recentActivities = [
    {
        title: "New movie schedule imported",
        meta: "Main branch - 8 minutes ago",
        status: "DONE",
    },
    {
        title: "2 showtimes paused for maintenance",
        meta: "District 1 Cinema - 26 minutes ago",
        status: "PENDING",
    },
    {
        title: "Price update applied to weekend slots",
        meta: "Business team - 1 hour ago",
        status: "DONE",
    },
    {
        title: "Banner campaign waiting approval",
        meta: "Marketing - 2 hours ago",
        status: "REVIEW",
    },
];

const quickActions = [
    "Create new movie",
    "Open seat map checker",
    "Sync today showtimes",
    "Review payment logs",
];

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.45)] sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                            System Overview
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-800">
                            Cinema Operation Dashboard
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-[var(--glx-text-muted)]">
                            Admin UI now follows the same visual tone as client pages: clean white
                            surfaces, deep-blue structure, and orange action highlights.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--glx-orange)] px-4 text-sm font-semibold text-[var(--glx-orange)] transition-all duration-300 hover:bg-[var(--glx-orange)] hover:text-white"
                    >
                        Export Daily Report
                    </button>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {overviewCards.map((card, index) => (
                    <article
                        key={card.title}
                        className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-32px_rgba(2,56,120,0.42)]"
                    >
                        <div
                            className={`h-1.5 w-12 rounded-full ${
                                index % 2 === 0
                                    ? "bg-[var(--glx-blue)]"
                                    : "bg-[var(--glx-orange)]"
                            }`}
                        />
                        <p className="mt-4 text-sm font-semibold text-slate-500">{card.title}</p>
                        <p className="mt-2 text-2xl font-bold text-slate-800">{card.value}</p>
                        <p className="mt-2 text-sm font-semibold text-[var(--glx-orange)]">
                            {card.change}
                        </p>
                        <p className="mt-1 text-xs text-[var(--glx-text-muted)]">
                            {card.description}
                        </p>
                    </article>
                ))}
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
                <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
                        <button
                            type="button"
                            className="text-sm font-semibold text-[var(--glx-blue)] transition-colors hover:text-[var(--glx-orange)]"
                        >
                            View all
                        </button>
                    </div>

                    <ul className="space-y-3">
                        {recentActivities.map((activity) => (
                            <li
                                key={activity.title}
                                className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors duration-300 hover:border-[var(--glx-border)] hover:bg-white"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-700">{activity.title}</p>
                                        <p className="text-xs text-[var(--glx-text-muted)]">
                                            {activity.meta}
                                        </p>
                                    </div>
                                    <span
                                        className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${
                                            activity.status === "DONE"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : activity.status === "REVIEW"
                                                  ? "bg-amber-100 text-amber-700"
                                                  : "bg-sky-100 text-sky-700"
                                        }`}
                                    >
                                        {activity.status}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-6">
                    <div className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                        <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
                        <div className="mt-4 grid gap-3">
                            {quickActions.map((action) => (
                                <button
                                    key={action}
                                    type="button"
                                    className="rounded-xl border border-[var(--glx-border)] bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-[var(--glx-orange)] hover:bg-[var(--glx-orange)]/5 hover:text-[var(--glx-orange)]"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                        <h3 className="text-lg font-bold text-slate-800">Health Snapshot</h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <div className="mb-1 flex items-center justify-between text-sm">
                                    <span className="text-slate-600">API uptime</span>
                                    <span className="font-bold text-[var(--glx-blue)]">99.91%</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100">
                                    <div className="h-2 w-[90%] rounded-full bg-[var(--glx-blue)]" />
                                </div>
                            </div>
                            <div>
                                <div className="mb-1 flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Payment success</span>
                                    <span className="font-bold text-[var(--glx-orange)]">97.80%</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100">
                                    <div className="h-2 w-[82%] rounded-full bg-[var(--glx-orange)]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
