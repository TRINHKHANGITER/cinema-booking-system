const showtimeRows = [
    {
        movie: "Thunder Legacy",
        cinema: "Galaxy Nguyen Du",
        room: "Room 03 - 2D",
        time: "2026-04-23 09:15",
        occupancy: "82%",
        status: "OPEN",
    },
    {
        movie: "Moonline 2049",
        cinema: "Galaxy Tan Binh",
        room: "Room 05 - IMAX",
        time: "2026-04-23 10:40",
        occupancy: "68%",
        status: "OPEN",
    },
    {
        movie: "The Quiet Frame",
        cinema: "Galaxy Nguyen Du",
        room: "Room 01 - 2D",
        time: "2026-04-23 12:30",
        occupancy: "47%",
        status: "LIMITED",
    },
    {
        movie: "Shadow Ticket",
        cinema: "Galaxy Thu Duc",
        room: "Room 02 - 2D",
        time: "2026-04-23 14:50",
        occupancy: "0%",
        status: "DRAFT",
    },
];

const statusStyles: Record<string, string> = {
    OPEN: "bg-emerald-100 text-emerald-700",
    LIMITED: "bg-amber-100 text-amber-700",
    DRAFT: "bg-slate-200 text-slate-700",
};

const ShowtimeManagement = () => {
    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                            Schedule Control
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-800">
                            Showtime Management
                        </h2>
                        <p className="mt-2 text-sm text-[var(--glx-text-muted)]">
                            Manage showtimes, room allocation and seat occupancy by cinema.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--glx-orange)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-orange-soft)]"
                    >
                        + Create Showtime
                    </button>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                    <input
                        type="date"
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />
                    <select className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15">
                        <option>All cinemas</option>
                        <option>Galaxy Nguyen Du</option>
                        <option>Galaxy Tan Binh</option>
                        <option>Galaxy Thu Duc</option>
                    </select>
                    <select className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15">
                        <option>All room types</option>
                        <option>2D</option>
                        <option>3D</option>
                        <option>IMAX</option>
                    </select>
                    <button
                        type="button"
                        className="h-11 rounded-xl border border-[var(--glx-blue)] bg-[var(--glx-blue)] text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-blue-strong)]"
                    >
                        Apply Filters
                    </button>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
                <article className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                    <p className="text-sm font-semibold text-slate-500">Shows Today</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--glx-blue)]">186</p>
                </article>
                <article className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                    <p className="text-sm font-semibold text-slate-500">Average Occupancy</p>
                    <p className="mt-2 text-2xl font-bold text-[var(--glx-orange)]">71%</p>
                </article>
                <article className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                    <p className="text-sm font-semibold text-slate-500">Need Attention</p>
                    <p className="mt-2 text-2xl font-bold text-amber-600">9 slots</p>
                </article>
            </section>

            <section className="rounded-2xl border border-[var(--glx-border)] bg-white shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                <div className="flex items-center justify-between border-b border-[var(--glx-border)] px-5 py-4 sm:px-6">
                    <h3 className="text-lg font-bold text-slate-800">Today Showtime Slots</h3>
                    <button
                        type="button"
                        className="rounded-lg border border-[var(--glx-orange)] px-3 py-1.5 text-sm font-semibold text-[var(--glx-orange)] transition-all duration-300 hover:bg-[var(--glx-orange)] hover:text-white"
                    >
                        Publish Changes
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--glx-border)] text-sm">
                        <thead className="bg-slate-50 text-left">
                            <tr>
                                <th className="px-6 py-3 font-bold text-slate-600">Movie</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Cinema</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Room</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Start Time</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Occupancy</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Status</th>
                                <th className="px-6 py-3 font-bold text-slate-600 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glx-border)]">
                            {showtimeRows.map((row) => (
                                <tr key={`${row.movie}-${row.time}`} className="bg-white hover:bg-slate-50/80">
                                    <td className="px-6 py-4 font-semibold text-slate-700">{row.movie}</td>
                                    <td className="px-6 py-4 text-slate-600">{row.cinema}</td>
                                    <td className="px-6 py-4 text-slate-600">{row.room}</td>
                                    <td className="px-6 py-4 text-slate-600">{row.time}</td>
                                    <td className="px-6 py-4 text-slate-600">{row.occupancy}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                statusStyles[row.status]
                                            }`}
                                        >
                                            {row.status}
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
                                                className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all duration-300 hover:bg-rose-50"
                                            >
                                                Pause
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

export default ShowtimeManagement;
