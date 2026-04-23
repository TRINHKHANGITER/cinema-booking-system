import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import Close from "../../components/icon/close";
import { seatTypeService } from "../../services/seatType.service";
import type {
    SeatTypeCreationRequest,
    SeatTypeResponse,
    SeatTypeStatus,
    SeatTypeUpdateRequest,
} from "../../types/seat-type";

const defaultStatuses: SeatTypeStatus[] = ["ACTIVE", "INACTIVE"];

const createSeatTypeSchema = z.object({
    seatTypeName: z.string().trim().min(1, "Seat type name is required"),
    description: z.string().trim().min(1, "Description is required"),
    status: z.string().trim().min(1, "Status is required"),
});

const updateSeatTypeSchema = z.object({
    seatTypeName: z.string().trim().min(1, "Seat type name is required"),
    description: z.string().trim().min(1, "Description is required"),
    status: z.string().trim().min(1, "Status is required"),
});

type CreateSeatTypeFormValues = z.infer<typeof createSeatTypeSchema>;
type UpdateSeatTypeFormValues = z.infer<typeof updateSeatTypeSchema>;

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

const ModalShell = ({ open, title, onClose, children }: ModalShellProps) => {
    return (
        <div
            className={`fixed inset-0 z-[1000] grid h-screen w-screen place-items-center bg-black/45 px-4 transition-opacity duration-300 ${
                open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
        >
            <div className="relative w-full max-w-[560px] rounded-md bg-white px-6 py-6 shadow-2xl">
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

const SeatTypeManagement = () => {
    const [seatTypes, setSeatTypes] = useState<SeatTypeResponse[]>([]);
    const [statuses, setStatuses] = useState<SeatTypeStatus[]>(defaultStatuses);
    const [isLoading, setIsLoading] = useState(false);

    const [nameInput, setNameInput] = useState("");
    const [statusInput, setStatusInput] = useState<SeatTypeStatus | "">("");

    const [filters, setFilters] = useState({
        name: "",
        status: "" as SeatTypeStatus | "",
        page: 1,
        size: 10,
    });

    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingSeatType, setEditingSeatType] = useState<SeatTypeResponse | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SeatTypeResponse | null>(null);

    const createForm = useForm<CreateSeatTypeFormValues>({
        resolver: zodResolver(createSeatTypeSchema),
        defaultValues: {
            seatTypeName: "",
            description: "",
            status: "ACTIVE",
        },
    });

    const editForm = useForm<UpdateSeatTypeFormValues>({
        resolver: zodResolver(updateSeatTypeSchema),
        defaultValues: {
            seatTypeName: "",
            description: "",
            status: "ACTIVE",
        },
    });

    const fetchStatuses = useCallback(async () => {
        try {
            const response = await seatTypeService.getAllSeatTypeStatuses();
            const nextStatuses = response.result?.items ?? defaultStatuses;
            setStatuses(nextStatuses.length > 0 ? nextStatuses : defaultStatuses);
        } catch {
            setStatuses(defaultStatuses);
        }
    }, []);

    const fetchSeatTypes = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await seatTypeService.filterSeatTypes({
                name: filters.name,
                status: filters.status,
                page: filters.page,
                size: filters.size,
            });

            const result = response.result;
            if (!result) {
                setSeatTypes([]);
                setTotalItems(0);
                setTotalPages(1);
                return;
            }

            setSeatTypes(result.items ?? []);
            setTotalItems(result.totalItems ?? 0);
            setTotalPages(Math.max(1, result.totalPages ?? 1));
        } catch (error) {
            toast.error(parseApiError(error, "Cannot load seat types"));
            setSeatTypes([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        void fetchStatuses();
    }, [fetchStatuses]);

    useEffect(() => {
        void fetchSeatTypes();
    }, [fetchSeatTypes]);

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
            status: statusInput,
            page: 1,
        }));
    };

    const openCreateModal = () => {
        createForm.reset({
            seatTypeName: "",
            description: "",
            status: "ACTIVE",
        });
        setOpenCreate(true);
    };

    const openEditModal = (seatType: SeatTypeResponse) => {
        setEditingSeatType(seatType);
        editForm.reset({
            seatTypeName: seatType.seatTypeName,
            description: seatType.description ?? "",
            status: seatType.status,
        });
        setOpenEdit(true);
    };

    const submitCreate = createForm.handleSubmit(async (values) => {
        const payload: SeatTypeCreationRequest = {
            seatTypeName: values.seatTypeName.trim(),
            description: values.description.trim(),
            status: values.status as SeatTypeStatus,
        };

        try {
            const response = await seatTypeService.createSeatType(payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Create seat type failed");
                return;
            }

            toast.success("Seat type created successfully");
            setOpenCreate(false);
            void fetchSeatTypes();
        } catch (error) {
            toast.error(parseApiError(error, "Create seat type failed"));
        }
    });

    const submitUpdate = editForm.handleSubmit(async (values) => {
        if (!editingSeatType) return;

        const payload: SeatTypeUpdateRequest = {
            seatTypeName: values.seatTypeName.trim(),
            description: values.description.trim(),
            status: values.status as SeatTypeStatus,
        };

        try {
            const response = await seatTypeService.updateSeatType(editingSeatType.seatTypeId, payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Update seat type failed");
                return;
            }

            toast.success("Seat type updated successfully");
            setOpenEdit(false);
            setEditingSeatType(null);
            void fetchSeatTypes();
        } catch (error) {
            toast.error(parseApiError(error, "Update seat type failed"));
        }
    });

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            const response = await seatTypeService.deleteSeatType(deleteTarget.seatTypeId);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Delete seat type failed");
                return;
            }

            toast.success("Seat type deleted successfully");
            setDeleteTarget(null);
            void fetchSeatTypes();
        } catch (error) {
            toast.error(parseApiError(error, "Delete seat type failed"));
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                            Seat Type Control
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-800">
                            Seat Type Management
                        </h2>
                        <p className="mt-2 text-sm text-[var(--glx-text-muted)]">
                            Filter, create and update seat types for the cinema system.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--glx-orange)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-orange-soft)]"
                    >
                        + Add Seat Type
                    </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1.6fr_1fr_auto]">
                    <input
                        value={nameInput}
                        onChange={(event) => setNameInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                applyFilters();
                            }
                        }}
                        type="text"
                        placeholder="Search by seat type name..."
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />

                    <select
                        value={statusInput}
                        onChange={(event) => setStatusInput(event.target.value as SeatTypeStatus | "")}
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
                    <h3 className="text-lg font-bold text-slate-800">Seat Type List</h3>
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
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Loading seat types...
                                    </td>
                                </tr>
                            ) : seatTypes.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        No seat types found
                                    </td>
                                </tr>
                            ) : (
                                seatTypes.map((seatType) => (
                                    <tr key={seatType.seatTypeId} className="bg-white hover:bg-slate-50/80">
                                        <td className="px-6 py-4 text-slate-600">{seatType.seatTypeId}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-700">
                                            {seatType.seatTypeName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {seatType.description || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                    seatType.status === "ACTIVE"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-200 text-slate-700"
                                                }`}
                                            >
                                                {seatType.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(seatType)}
                                                    className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-[var(--glx-blue)] hover:text-[var(--glx-blue)]"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(seatType)}
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

            <ModalShell open={openCreate} onClose={() => setOpenCreate(false)} title="Add Seat Type">
                <form className="space-y-3" onSubmit={submitCreate}>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Seat Type Name *
                        </label>
                        <input
                            type="text"
                            {...createForm.register("seatTypeName")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                        {createForm.formState.errors.seatTypeName && (
                            <p className="mt-1 text-xs text-rose-500">
                                {createForm.formState.errors.seatTypeName.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Description *
                        </label>
                        <textarea
                            rows={3}
                            {...createForm.register("description")}
                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                        {createForm.formState.errors.description && (
                            <p className="mt-1 text-xs text-rose-500">
                                {createForm.formState.errors.description.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">Status *</label>
                        <select
                            {...createForm.register("status")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        >
                            {statuses.map((status) => (
                                <option key={`create-${status}`} value={status}>
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

            <ModalShell open={openEdit} onClose={() => setOpenEdit(false)} title="Edit Seat Type">
                <form className="space-y-3" onSubmit={submitUpdate}>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Seat Type Name *
                        </label>
                        <input
                            type="text"
                            {...editForm.register("seatTypeName")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                        {editForm.formState.errors.seatTypeName && (
                            <p className="mt-1 text-xs text-rose-500">
                                {editForm.formState.errors.seatTypeName.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Description *
                        </label>
                        <textarea
                            rows={3}
                            {...editForm.register("description")}
                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                        {editForm.formState.errors.description && (
                            <p className="mt-1 text-xs text-rose-500">
                                {editForm.formState.errors.description.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">Status *</label>
                        <select
                            {...editForm.register("status")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        >
                            {statuses.map((status) => (
                                <option key={`edit-${status}`} value={status}>
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

            <ModalShell
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                title="Delete Seat Type"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Are you sure you want to delete seat type <strong>{deleteTarget?.seatTypeName}</strong>?
                    </p>
                    <p className="text-xs text-rose-500">
                        Delete will be blocked if any ACTIVE seat is using this type.
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

export default SeatTypeManagement;
