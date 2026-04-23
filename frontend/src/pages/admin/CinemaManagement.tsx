import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import Close from "../../components/icon/close";
import { cinemaService } from "../../services/cinema.service";
import { provinceService } from "../../services/province.service";
import type {
    CinemaCreationRequest,
    CinemaResponse,
    CinemaStatus,
    CinemaUpdateRequest,
} from "../../types/cinema";
import type { ProvinceResponse } from "../../types/province";

const defaultStatuses: CinemaStatus[] = ["ACTIVE", "INACTIVE", "UNDER_MAINTENANCE"];

const createCinemaSchema = z.object({
    cinemaName: z.string().trim().min(1, "Cinema name is required"),
    provinceId: z.coerce.number().int().min(1, "Province is required"),
    addressText: z.string().trim().min(1, "Address is required"),
    description: z.string().optional(),
    status: z.string().trim().min(1, "Status is required"),
});

const updateCinemaSchema = z.object({
    cinemaName: z.string().trim().min(1, "Cinema name is required"),
    provinceId: z.coerce.number().int().min(1, "Province is required"),
    addressText: z.string().trim().min(1, "Address is required"),
    description: z.string().optional(),
    status: z.string().trim().min(1, "Status is required"),
});

type CreateCinemaFormValues = z.infer<typeof createCinemaSchema>;
type UpdateCinemaFormValues = z.infer<typeof updateCinemaSchema>;
type CreateCinemaFormInput = z.input<typeof createCinemaSchema>;
type UpdateCinemaFormInput = z.input<typeof updateCinemaSchema>;

type ModalShellProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
};

const parseApiError = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        const payload = error.response?.data as { message?: string } | undefined;
        return payload?.message || fallback;
    }
    return fallback;
};

const normalizeOptionalDescription = (value?: string | null) => {
    if (value == null) return null;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
};

const ModalShell = ({ open, title, onClose, children }: ModalShellProps) => {
    return (
        <div
            className={`fixed inset-0 z-[1000] grid h-screen w-screen place-items-center bg-black/45 px-4 transition-opacity duration-300 ${
                open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
        >
            <div className="relative w-full max-w-[680px] rounded-md bg-white px-6 py-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-slate-100"
                    >
                        <Close />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

const CinemaManagement = () => {
    const [cinemas, setCinemas] = useState<CinemaResponse[]>([]);
    const [statuses, setStatuses] = useState<CinemaStatus[]>(defaultStatuses);
    const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [nameInput, setNameInput] = useState("");
    const [provinceInput, setProvinceInput] = useState<number | "">("");
    const [statusInput, setStatusInput] = useState<CinemaStatus | "">("");

    const [filters, setFilters] = useState({
        name: "",
        provinceId: undefined as number | undefined,
        status: "" as CinemaStatus | "",
        page: 1,
        size: 10,
    });

    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingCinema, setEditingCinema] = useState<CinemaResponse | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CinemaResponse | null>(null);

    const createForm = useForm<CreateCinemaFormInput, unknown, CreateCinemaFormValues>({
        resolver: zodResolver(createCinemaSchema),
        defaultValues: {
            cinemaName: "",
            provinceId: 0,
            addressText: "",
            description: "",
            status: "ACTIVE",
        },
    });

    const editForm = useForm<UpdateCinemaFormInput, unknown, UpdateCinemaFormValues>({
        resolver: zodResolver(updateCinemaSchema),
        defaultValues: {
            cinemaName: "",
            provinceId: 0,
            addressText: "",
            description: "",
            status: "ACTIVE",
        },
    });

    const provinceNameMap = useMemo(
        () => new Map(provinces.map((province) => [province.provinceId, province.provinceName])),
        [provinces]
    );

    const fetchStatuses = useCallback(async () => {
        try {
            const response = await cinemaService.getAllCinemaStatuses();
            const nextStatuses = response.result?.items ?? defaultStatuses;
            setStatuses(nextStatuses.length > 0 ? nextStatuses : defaultStatuses);
        } catch {
            setStatuses(defaultStatuses);
        }
    }, []);

    const fetchProvinces = useCallback(async () => {
        try {
            const response = await provinceService.filterProvinces({
                page: 1,
                size: 100,
            });
            setProvinces(response.result?.items ?? []);
        } catch {
            setProvinces([]);
        }
    }, []);

    const fetchCinemas = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await cinemaService.filterCinemas({
                name: filters.name,
                provinceId: filters.provinceId,
                status: filters.status,
                page: filters.page,
                size: filters.size,
            });

            const result = response.result;
            if (!result) {
                setCinemas([]);
                setTotalItems(0);
                setTotalPages(1);
                return;
            }

            setCinemas(result.items ?? []);
            setTotalItems(result.totalItems ?? 0);
            setTotalPages(Math.max(1, result.totalPages ?? 1));
        } catch (error) {
            toast.error(parseApiError(error, "Cannot load cinemas"));
            setCinemas([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        void fetchStatuses();
        void fetchProvinces();
    }, [fetchStatuses, fetchProvinces]);

    useEffect(() => {
        void fetchCinemas();
    }, [fetchCinemas]);

    const visiblePages = useMemo(() => {
        const maxButtons = 5;
        if (totalPages <= maxButtons) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        let start = Math.max(1, filters.page - 2);
        const end = Math.min(totalPages, start + maxButtons - 1);
        if (end - start + 1 < maxButtons) {
            start = Math.max(1, end - maxButtons + 1);
        }

        const pages: number[] = [];
        for (let page = start; page <= end; page += 1) {
            pages.push(page);
        }
        return pages;
    }, [filters.page, totalPages]);

    const applyFilters = () => {
        setFilters((prev) => ({
            ...prev,
            name: nameInput.trim(),
            provinceId: provinceInput === "" ? undefined : provinceInput,
            status: statusInput,
            page: 1,
        }));
    };

    const openCreateModal = () => {
        createForm.reset({
            cinemaName: "",
            provinceId: 0,
            addressText: "",
            description: "",
            status: "ACTIVE",
        });
        setOpenCreate(true);
    };

    const openEditModal = (cinema: CinemaResponse) => {
        setEditingCinema(cinema);
        editForm.reset({
            cinemaName: cinema.cinemaName,
            provinceId: cinema.provinceId ?? cinema.province?.provinceId ?? 0,
            addressText: cinema.addressText,
            description: cinema.description ?? "",
            status: cinema.status,
        });
        setOpenEdit(true);
    };

    const submitCreate = createForm.handleSubmit(async (values) => {
        const payload: CinemaCreationRequest = {
            cinemaName: values.cinemaName.trim(),
            provinceId: values.provinceId,
            addressText: values.addressText.trim(),
            description: normalizeOptionalDescription(values.description),
            status: values.status as CinemaStatus,
        };

        try {
            const response = await cinemaService.createCinema(payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Create cinema failed");
                return;
            }

            toast.success("Cinema created successfully");
            setOpenCreate(false);
            void fetchCinemas();
        } catch (error) {
            toast.error(parseApiError(error, "Create cinema failed"));
        }
    });

    const submitUpdate = editForm.handleSubmit(async (values) => {
        if (!editingCinema) return;

        const payload: CinemaUpdateRequest = {
            cinemaName: values.cinemaName.trim(),
            provinceId: values.provinceId,
            addressText: values.addressText.trim(),
            description: normalizeOptionalDescription(values.description),
            status: values.status as CinemaStatus,
        };

        try {
            const response = await cinemaService.updateCinema(editingCinema.cinemaId, payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Update cinema failed");
                return;
            }

            toast.success("Cinema updated successfully");
            setOpenEdit(false);
            setEditingCinema(null);
            void fetchCinemas();
        } catch (error) {
            toast.error(parseApiError(error, "Update cinema failed"));
        }
    });

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            const response = await cinemaService.deleteCinema(deleteTarget.cinemaId);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Delete cinema failed");
                return;
            }

            toast.success("Cinema deleted successfully");
            setDeleteTarget(null);
            void fetchCinemas();
        } catch (error) {
            toast.error(parseApiError(error, "Delete cinema failed"));
        }
    };

    const renderProvinceName = (cinema: CinemaResponse) => {
        return (
            cinema.provinceName ??
            cinema.province?.provinceName ??
            (cinema.provinceId ? provinceNameMap.get(cinema.provinceId) : null) ??
            "-"
        );
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                            Cinema Control
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-800">
                            Cinema Management
                        </h2>
                        <p className="mt-2 text-sm text-[var(--glx-text-muted)]">
                            Filter, create and update cinemas for each province.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--glx-orange)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-orange-soft)]"
                    >
                        + Add Cinema
                    </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1.3fr_1fr_1fr_auto]">
                    <input
                        value={nameInput}
                        onChange={(event) => setNameInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                applyFilters();
                            }
                        }}
                        type="text"
                        placeholder="Search by cinema name..."
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />

                    <select
                        value={provinceInput}
                        onChange={(event) => {
                            const value = event.target.value;
                            setProvinceInput(value ? Number(value) : "");
                        }}
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">All provinces</option>
                        {provinces.map((province) => (
                            <option key={province.provinceId} value={province.provinceId}>
                                {province.provinceName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusInput}
                        onChange={(event) => setStatusInput(event.target.value as CinemaStatus | "")}
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">All statuses</option>
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={applyFilters}
                        className="h-11 rounded-xl border border-[var(--glx-blue)] bg-[var(--glx-blue)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-blue-strong)]"
                    >
                        Apply
                    </button>
                </div>
            </section>

            <section className="rounded-2xl border border-[var(--glx-border)] bg-white shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                <div className="flex flex-col gap-3 border-b border-[var(--glx-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <h3 className="text-lg font-bold text-slate-800">Cinema List</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>Total: {totalItems}</span>
                        <label className="flex items-center gap-2">
                            <span>Size</span>
                            <select
                                value={filters.size}
                                onChange={(event) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        size: Number(event.target.value),
                                        page: 1,
                                    }))
                                }
                                className="rounded-md border border-[var(--glx-border)] px-2 py-1 text-sm text-slate-700 outline-none focus:border-[var(--glx-blue)]"
                            >
                                {[5, 10, 20, 50].map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--glx-border)] text-sm">
                        <thead className="bg-slate-50 text-left">
                            <tr>
                                <th className="px-6 py-3 font-bold text-slate-600">ID</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Name</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Province</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Address</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Description</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Status</th>
                                <th className="px-6 py-3 font-bold text-right text-slate-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glx-border)]">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Loading cinemas...
                                    </td>
                                </tr>
                            ) : cinemas.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        No cinemas found
                                    </td>
                                </tr>
                            ) : (
                                cinemas.map((cinema) => (
                                    <tr key={cinema.cinemaId} className="bg-white hover:bg-slate-50/80">
                                        <td className="px-6 py-4 text-slate-600">{cinema.cinemaId}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-700">
                                            {cinema.cinemaName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {renderProvinceName(cinema)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {cinema.addressText || "-"}
                                        </td>
                                        <td className="max-w-[280px] px-6 py-4 text-slate-600">
                                            <p className="line-clamp-2">{cinema.description || "-"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                    cinema.status === "ACTIVE"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : cinema.status === "UNDER_MAINTENANCE"
                                                          ? "bg-amber-100 text-amber-700"
                                                          : "bg-slate-200 text-slate-700"
                                                }`}
                                            >
                                                {cinema.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(cinema)}
                                                    className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-[var(--glx-blue)] hover:text-[var(--glx-blue)]"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(cinema)}
                                                    className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all duration-300 hover:bg-rose-50"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-center gap-2 border-t border-[var(--glx-border)] px-5 py-4">
                    <button
                        type="button"
                        onClick={() =>
                            setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                        }
                        disabled={filters.page === 1 || isLoading}
                        className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-sm text-slate-600 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                    >
                        Prev
                    </button>

                    {visiblePages.map((page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() => setFilters((prev) => ({ ...prev, page }))}
                            className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-all duration-300 ${
                                filters.page === page
                                    ? "border-[var(--glx-blue)] bg-[var(--glx-blue)] text-white"
                                    : "border-[var(--glx-border)] text-slate-600 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() =>
                            setFilters((prev) => ({
                                ...prev,
                                page: Math.min(totalPages, prev.page + 1),
                            }))
                        }
                        disabled={filters.page >= totalPages || isLoading}
                        className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-sm text-slate-600 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                    >
                        Next
                    </button>
                </div>
            </section>

            <ModalShell open={openCreate} onClose={() => setOpenCreate(false)} title="Add Cinema">
                <form className="space-y-3" onSubmit={submitCreate}>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Cinema Name *
                        </label>
                        <input
                            type="text"
                            {...createForm.register("cinemaName")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                        {createForm.formState.errors.cinemaName && (
                            <p className="mt-1 text-xs text-rose-500">
                                {createForm.formState.errors.cinemaName.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Province *
                            </label>
                            <select
                                {...createForm.register("provinceId")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value={0}>Select province</option>
                                {provinces.map((province) => (
                                    <option
                                        key={`create-${province.provinceId}`}
                                        value={province.provinceId}
                                    >
                                        {province.provinceName}
                                    </option>
                                ))}
                            </select>
                            {createForm.formState.errors.provinceId && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.provinceId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Status *
                            </label>
                            <select
                                {...createForm.register("status")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                {statuses.map((status) => (
                                    <option key={`create-status-${status}`} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            {createForm.formState.errors.status && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.status.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Address *
                        </label>
                        <input
                            type="text"
                            {...createForm.register("addressText")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                        {createForm.formState.errors.addressText && (
                            <p className="mt-1 text-xs text-rose-500">
                                {createForm.formState.errors.addressText.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            {...createForm.register("description")}
                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setOpenCreate(false)}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createForm.formState.isSubmitting}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </ModalShell>

            <ModalShell open={openEdit} onClose={() => setOpenEdit(false)} title="Edit Cinema">
                <form className="space-y-3" onSubmit={submitUpdate}>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Cinema Name *
                        </label>
                        <input
                            type="text"
                            {...editForm.register("cinemaName")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                        {editForm.formState.errors.cinemaName && (
                            <p className="mt-1 text-xs text-rose-500">
                                {editForm.formState.errors.cinemaName.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Province *
                            </label>
                            <select
                                {...editForm.register("provinceId")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value={0}>Select province</option>
                                {provinces.map((province) => (
                                    <option
                                        key={`edit-${province.provinceId}`}
                                        value={province.provinceId}
                                    >
                                        {province.provinceName}
                                    </option>
                                ))}
                            </select>
                            {editForm.formState.errors.provinceId && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.provinceId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Status *
                            </label>
                            <select
                                {...editForm.register("status")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                {statuses.map((status) => (
                                    <option key={`edit-status-${status}`} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            {editForm.formState.errors.status && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.status.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Address *
                        </label>
                        <input
                            type="text"
                            {...editForm.register("addressText")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                        {editForm.formState.errors.addressText && (
                            <p className="mt-1 text-xs text-rose-500">
                                {editForm.formState.errors.addressText.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            {...editForm.register("description")}
                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setOpenEdit(false)}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.formState.isSubmitting}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </ModalShell>

            <ModalShell open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete Cinema">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Are you sure you want to delete cinema{" "}
                        <strong>{deleteTarget?.cinemaName ?? ""}</strong>?
                    </p>
                    <p className="text-xs text-rose-500">
                        Delete will be blocked if any ACTIVE room is using this cinema.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleDelete()}
                            className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </ModalShell>
        </div>
    );
};

export default CinemaManagement;

