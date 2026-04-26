import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import Close from "../../components/icon/close";
import { comboService } from "../../services/combo.service";
import type {
    ComboCreationRequest,
    ComboResponse,
    ComboStatus,
    ComboUpdateRequest,
} from "../../types/combo";

const defaultStatuses: ComboStatus[] = ["AVAILABLE", "UNAVAILABLE", "DISCONTINUED"];

const createComboSchema = z.object({
    comboName: z.string().trim().min(1, "Tên combo là bắt buộc"),
    description: z.string().trim().min(1, "Mô tả là bắt buộc"),
    price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
    status: z.string().trim().min(1, "Trạng thái là bắt buộc"),
});

const updateComboSchema = z.object({
    comboName: z.string().trim().min(1, "Tên combo là bắt buộc"),
    description: z.string().trim().min(1, "Mô tả là bắt buộc"),
    price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
    status: z.string().trim().min(1, "Trạng thái là bắt buộc"),
});

type CreateComboFormValues = z.infer<typeof createComboSchema>;
type UpdateComboFormValues = z.infer<typeof updateComboSchema>;
type CreateComboFormInput = z.input<typeof createComboSchema>;
type UpdateComboFormInput = z.input<typeof updateComboSchema>;

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

const resolveComboImageUrl = (image: string | null | undefined) => {
    if (!image) return null;
    if (image.startsWith("http://") || image.startsWith("https://")) return image;

    const normalizedImageName = image
        .split("/")
        .filter(Boolean)
        .at(-1) ?? image;

    const baseUrlRaw = String(import.meta.env.VITE_COMBO_IMAGE_API_URL ?? "");
    const normalizedBaseUrl = baseUrlRaw.replace(/\/+$/, "");

    if (!normalizedBaseUrl) return normalizedImageName;
    return `${normalizedBaseUrl}/${normalizedImageName}`;
};

const revokeIfBlob = (url: string | null) => {
    if (url && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
    }
};

const ModalShell = ({ open, title, onClose, children }: ModalShellProps) => {
    return (
        <div
            className={`fixed inset-0 z-[1000] grid h-screen w-screen place-items-center bg-black/45 px-4 transition-opacity duration-300 ${
                open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
        >
            <div className="relative w-full max-w-[640px] rounded-md bg-white px-6 py-6 shadow-2xl">
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

const ComboManagement = () => {
    const [combos, setCombos] = useState<ComboResponse[]>([]);
    const [statuses, setStatuses] = useState<ComboStatus[]>(defaultStatuses);
    const [isLoading, setIsLoading] = useState(false);

    const [nameInput, setNameInput] = useState("");
    const [statusInput, setStatusInput] = useState<ComboStatus | "">("");

    const [filters, setFilters] = useState({
        name: "",
        status: "" as ComboStatus | "",
        page: 1,
        size: 10,
    });

    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingCombo, setEditingCombo] = useState<ComboResponse | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ComboResponse | null>(null);

    const [createImageFile, setCreateImageFile] = useState<File | null>(null);
    const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

    const createForm = useForm<CreateComboFormInput, unknown, CreateComboFormValues>({
        resolver: zodResolver(createComboSchema),
        defaultValues: {
            comboName: "",
            description: "",
            price: 0,
            status: "AVAILABLE",
        },
    });

    const editForm = useForm<UpdateComboFormInput, unknown, UpdateComboFormValues>({
        resolver: zodResolver(updateComboSchema),
        defaultValues: {
            comboName: "",
            description: "",
            price: 0,
            status: "AVAILABLE",
        },
    });

    const fetchStatuses = useCallback(async () => {
        try {
            const response = await comboService.getAllComboStatuses();
            const nextStatuses = response.result?.items ?? defaultStatuses;
            setStatuses(nextStatuses.length > 0 ? nextStatuses : defaultStatuses);
        } catch {
            setStatuses(defaultStatuses);
        }
    }, []);

    const fetchCombos = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await comboService.filterCombos({
                name: filters.name,
                status: filters.status,
                page: filters.page,
                size: filters.size,
            });

            const result = response.result;
            if (!result) {
                setCombos([]);
                setTotalItems(0);
                setTotalPages(1);
                return;
            }

            setCombos(result.items ?? []);
            setTotalItems(result.totalItems ?? 0);
            setTotalPages(Math.max(1, result.totalPages ?? 1));
        } catch (error) {
            toast.error(parseApiError(error, "Không thể tải danh sách combo"));
            setCombos([]);
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
        void fetchCombos();
    }, [fetchCombos]);

    useEffect(() => {
        return () => {
            revokeIfBlob(createImagePreview);
            revokeIfBlob(editImagePreview);
        };
    }, [createImagePreview, editImagePreview]);

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

    const handleCreateImageChange = (file: File | null) => {
        revokeIfBlob(createImagePreview);
        setCreateImageFile(file);
        if (file) {
            setCreateImagePreview(URL.createObjectURL(file));
            return;
        }
        setCreateImagePreview(null);
    };

    const handleEditImageChange = (file: File | null) => {
        revokeIfBlob(editImagePreview);
        setEditImageFile(file);
        if (file) {
            setEditImagePreview(URL.createObjectURL(file));
            return;
        }
        setEditImagePreview(editingCombo?.image ? resolveComboImageUrl(editingCombo.image) : null);
    };

    const openCreateModal = () => {
        createForm.reset({
            comboName: "",
            description: "",
            price: 0,
            status: "AVAILABLE",
        });
        handleCreateImageChange(null);
        setOpenCreate(true);
    };

    const openEditModal = (combo: ComboResponse) => {
        setEditingCombo(combo);
        editForm.reset({
            comboName: combo.comboName,
            description: combo.description ?? "",
            price: Number(combo.price ?? 0),
            status: combo.status,
        });

        setEditImageFile(null);
        revokeIfBlob(editImagePreview);
        setEditImagePreview(resolveComboImageUrl(combo.image));
        setOpenEdit(true);
    };

    const closeCreateModal = () => {
        handleCreateImageChange(null);
        setOpenCreate(false);
    };

    const closeEditModal = () => {
        handleEditImageChange(null);
        setEditingCombo(null);
        setOpenEdit(false);
    };

    const submitCreate = createForm.handleSubmit(async (values) => {
        if (!createImageFile) {
            toast.error("Hình ảnh là bắt buộc");
            return;
        }

        const payload: ComboCreationRequest = {
            comboName: values.comboName.trim(),
            description: values.description.trim(),
            price: values.price,
            status: values.status as ComboStatus,
            image: createImageFile,
        };

        try {
            const response = await comboService.createCombo(payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Tạo combo thất bại");
                return;
            }

            toast.success("Tạo combo thành công");
            closeCreateModal();
            void fetchCombos();
        } catch (error) {
            toast.error(parseApiError(error, "Tạo combo thất bại"));
        }
    });

    const submitUpdate = editForm.handleSubmit(async (values) => {
        if (!editingCombo) return;

        const payload: ComboUpdateRequest = {
            comboName: values.comboName.trim(),
            description: values.description.trim(),
            price: values.price,
            status: values.status as ComboStatus,
            image: editImageFile,
        };

        try {
            const response = await comboService.updateCombo(editingCombo.comboId, payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Cập nhật combo thất bại");
                return;
            }

            toast.success("Cập nhật combo thành công");
            closeEditModal();
            void fetchCombos();
        } catch (error) {
            toast.error(parseApiError(error, "Cập nhật combo thất bại"));
        }
    });

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            const response = await comboService.deleteCombo(deleteTarget.comboId);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Xóa combo thất bại");
                return;
            }

            toast.success("Xóa combo thành công");
            setDeleteTarget(null);
            void fetchCombos();
        } catch (error) {
            toast.error(parseApiError(error, "Xóa combo thất bại"));
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                            Quản trị combo
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-800">
                            Quản lý combo
                        </h2>
                        <p className="mt-2 text-sm text-[var(--glx-text-muted)]">
                            Lọc, tạo và cập nhật combo kèm tải ảnh lên.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--glx-orange)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-orange-soft)]"
                    >
                        + Thêm combo
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
                        placeholder="Tìm theo tên combo..."
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />

                    <select
                        value={statusInput}
                        onChange={(event) => setStatusInput(event.target.value as ComboStatus | "")}
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">Tất cả trạng thái</option>
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
                        Áp dụng
                    </button>
                </div>
            </section>

            <section className="rounded-2xl border border-[var(--glx-border)] bg-white shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                <div className="flex flex-col gap-3 border-b border-[var(--glx-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <h3 className="text-lg font-bold text-slate-800">Danh sách combo</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>Tổng: {totalItems}</span>
                        <label className="flex items-center gap-2">
                            <span>Kích thước</span>
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
                                <th className="px-6 py-3 font-bold text-slate-600">Mã</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Hình ảnh</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Tên</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Mô tả</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Giá</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Trạng thái</th>
                                <th className="px-6 py-3 font-bold text-right text-slate-600">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glx-border)]">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Đang tải combo...
                                    </td>
                                </tr>
                            ) : combos.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Không tìm thấy combo
                                    </td>
                                </tr>
                            ) : (
                                combos.map((combo) => {
                                    const imageUrl = resolveComboImageUrl(combo.image);
                                    return (
                                        <tr key={combo.comboId} className="bg-white hover:bg-slate-50/80">
                                            <td className="px-6 py-4 text-slate-600">{combo.comboId}</td>
                                            <td className="px-6 py-4">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={combo.comboName}
                                                        className="h-12 w-16 rounded-md border border-slate-200 object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-slate-400">Không có ảnh</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-700">
                                                {combo.comboName}
                                            </td>
                                            <td className="max-w-[300px] px-6 py-4 text-slate-600">
                                                <p className="line-clamp-2">{combo.description || "-"}</p>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-700">
                                                {Number(combo.price ?? 0).toLocaleString("vi-VN")} d
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                        combo.status === "AVAILABLE"
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : combo.status === "UNAVAILABLE"
                                                              ? "bg-amber-100 text-amber-700"
                                                              : "bg-slate-200 text-slate-700"
                                                    }`}
                                                >
                                                    {combo.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(combo)}
                                                        className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-[var(--glx-blue)] hover:text-[var(--glx-blue)]"
                                                    >Sửa</button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteTarget(combo)}
                                                        className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all duration-300 hover:bg-rose-50"
                                                    >Xóa</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
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
                        Trước
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
                        Tiếp
                    </button>
                </div>
            </section>

            <ModalShell open={openCreate} onClose={closeCreateModal} title="Thêm combo">
                <form className="space-y-3" onSubmit={submitCreate}>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Tên combo *
                        </label>
                        <input
                            type="text"
                            {...createForm.register("comboName")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                        {createForm.formState.errors.comboName && (
                            <p className="mt-1 text-xs text-rose-500">
                                {createForm.formState.errors.comboName.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Mô tả *
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

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Giá *
                            </label>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                {...createForm.register("price")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {createForm.formState.errors.price && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.price.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Trạng thái *
                            </label>
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
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Hình ảnh *
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                handleCreateImageChange(file);
                            }}
                            className="block w-full cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
                        />
                        {!createImageFile && (
                            <p className="mt-1 text-xs text-slate-500">
                                Ảnh tải lên sẽ được tự động đổi tên theo mã combo.
                            </p>
                        )}
                        {createImagePreview && (
                            <img
                                src={createImagePreview}
                                alt="Xem trước combo"
                                className="mt-2 h-28 w-40 rounded-md border border-slate-200 object-cover"
                            />
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >Hủy</button>
                        <button
                            type="submit"
                            disabled={createForm.formState.isSubmitting}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >Tạo mới</button>
                    </div>
                </form>
            </ModalShell>

            <ModalShell open={openEdit} onClose={closeEditModal} title="Sửa combo">
                <form className="space-y-3" onSubmit={submitUpdate}>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Tên combo *
                        </label>
                        <input
                            type="text"
                            {...editForm.register("comboName")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                        {editForm.formState.errors.comboName && (
                            <p className="mt-1 text-xs text-rose-500">
                                {editForm.formState.errors.comboName.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Mô tả *
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

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Giá *
                            </label>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                {...editForm.register("price")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {editForm.formState.errors.price && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.price.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Trạng thái *
                            </label>
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
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">Hình ảnh</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                handleEditImageChange(file);
                            }}
                            className="block w-full cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            Tải ảnh mới sẽ ghi đè ảnh cũ và giữ tên tệp theo mã combo.
                        </p>
                        {editImagePreview && (
                            <img
                                src={editImagePreview}
                                alt="Xem trước combo"
                                className="mt-2 h-28 w-40 rounded-md border border-slate-200 object-cover"
                            />
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={closeEditModal}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >Hủy</button>
                        <button
                            type="submit"
                            disabled={editForm.formState.isSubmitting}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >Lưu</button>
                    </div>
                </form>
            </ModalShell>

            <ModalShell open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Xóa combo">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Bạn có chắc muốn xóa combo{" "}
                        <strong>{deleteTarget?.comboName ?? ""}</strong>?
                    </p>
                    <p className="text-xs text-rose-500">
                        Không thể xóa nếu còn order combo ACTIVE đang dùng combo này.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >Hủy</button>
                        <button
                            type="button"
                            onClick={() => void handleDelete()}
                            className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                        >Xóa</button>
                    </div>
                </div>
            </ModalShell>
        </div>
    );
};

export default ComboManagement;



