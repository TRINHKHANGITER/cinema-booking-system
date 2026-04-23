const movieRows = [
    {
        name: "Thunder Legacy",
        genre: "Action",
        duration: "128 min",
        release: "2026-04-10",
        status: "SHOWING",
    },
    {
        name: "Moonline 2049",
        genre: "Sci-Fi",
        duration: "142 min",
        release: "2026-04-21",
        status: "UPCOMING",
    },
    {
        name: "The Quiet Frame",
        genre: "Drama",
        duration: "116 min",
        release: "2026-03-29",
        status: "SHOWING",
    },
    {
        name: "Shadow Ticket",
        genre: "Thriller",
        duration: "123 min",
        release: "2026-05-02",
        status: "DRAFT",
    },
];

const statusClassMap: Record<string, string> = {
    SHOWING: "bg-emerald-100 text-emerald-700",
    UPCOMING: "bg-sky-100 text-sky-700",
    DRAFT: "bg-amber-100 text-amber-700",
};

const MovieManagement = () => {
    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                            Movie Control
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-800">Movie Management</h2>
                        <p className="mt-2 text-sm text-[var(--glx-text-muted)]">
                            Search, filter and monitor movie lifecycle in one dashboard.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--glx-orange)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-orange-soft)]"
                    >
                        + Add New Movie
                    </button>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
                    <input
                        type="text"
                        placeholder="Search movie name..."
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />
                    <select className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15">
                        <option>All status</option>
                        <option>Showing</option>
                        <option>Upcoming</option>
                        <option>Draft</option>
                    </select>
                    <select className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15">
                        <option>All genres</option>
                        <option>Action</option>
                        <option>Drama</option>
                        <option>Sci-Fi</option>
                        <option>Thriller</option>
                    </select>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
                <article className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                    <p className="text-sm font-semibold text-slate-500">Total Movies</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--glx-blue)]">128</p>
                </article>
                <article className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                    <p className="text-sm font-semibold text-slate-500">Now Showing</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--glx-orange)]">43</p>
                </article>
                <article className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                    <p className="text-sm font-semibold text-slate-500">Upcoming</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">21</p>
                </article>
            </section>

            <section className="rounded-2xl border border-[var(--glx-border)] bg-white shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                <div className="flex items-center justify-between border-b border-[var(--glx-border)] px-5 py-4 sm:px-6">
                    <h3 className="text-lg font-bold text-slate-800">Movie List</h3>
                    <button
                        type="button"
                        className="rounded-lg border border-[var(--glx-blue)] px-3 py-1.5 text-sm font-semibold text-[var(--glx-blue)] transition-all duration-300 hover:bg-[var(--glx-blue)] hover:text-white"
                    >
                        Export CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--glx-border)] text-sm">
                        <thead className="bg-slate-50 text-left">
                            <tr>
                                <th className="px-6 py-3 font-bold text-slate-600">Movie</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Genre</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Duration</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Release</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Status</th>
                                <th className="px-6 py-3 font-bold text-slate-600 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glx-border)]">
                            {movieRows.map((movie) => (
                                <tr key={movie.name} className="bg-white hover:bg-slate-50/80">
                                    <td className="px-6 py-4 font-semibold text-slate-700">
                                        {movie.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{movie.genre}</td>
                                    <td className="px-6 py-4 text-slate-600">{movie.duration}</td>
                                    <td className="px-6 py-4 text-slate-600">{movie.release}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                statusClassMap[movie.status]
                                            }`}
                                        >
                                            {movie.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="inline-flex items-center gap-2">
                                            <button
                                                type="button"
                                                className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-[var(--glx-blue)] hover:text-[var(--glx-blue)]"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="rounded-md border border-[var(--glx-orange)] px-3 py-1.5 text-xs font-semibold text-[var(--glx-orange)] transition-all duration-300 hover:bg-[var(--glx-orange)] hover:text-white"
                                            >
                                                Schedule
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default MovieManagement;
