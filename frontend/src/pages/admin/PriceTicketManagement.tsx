import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import Close from "../../components/icon/close";
import { priceTicketService } from "../../services/priceTicket.service";
import { roomTypeService } from "../../services/roomType.service";
import { seatTypeService } from "../../services/seatType.service";
import type {
    PriceTicketCreationRequest,
    PriceTicketResponse,
    PriceTicketStatus,
    PriceTicketUpdateRequest,
} from "../../types/price-ticket";
import type { RoomTypeResponse } from "../../types/room-type";
import type { SeatTypeResponse } from "../../types/seat-type";

const defaultStatuses: PriceTicketStatus[] = ["ACTIVE", "INACTIVE"];

const createPriceTicketSchema = z.object({
    price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
    roomTypeId: z.coerce.number().int().min(1, "Loại phòng là bắt buộc"),
    seatTypeId: z.coerce.number().int().min(1, "Loại ghế là bắt buộc"),
    status: z.string().trim().min(1, "Trạng thái là bắt buộc"),
});

const updatePriceTicketSchema = z.object({
    price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
    roomTypeId: z.coerce.number().int().min(1, "Loại phòng là bắt buộc"),
    seatTypeId: z.coerce.number().int().min(1, "Loại ghế là bắt buộc"),
    status: z.string().trim().min(1, "Trạng thái là bắt buộc"),
});

type CreatePriceTicketFormValues = z.infer<typeof createPriceTicketSchema>;
type UpdatePriceTicketFormValues = z.infer<typeof updatePriceTicketSchema>;
type CreatePriceTicketFormInput = z.input<typeof createPriceTicketSchema>;
type UpdatePriceTicketFormInput = z.input<typeof updatePriceTicketSchema>;

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

const PriceTicketManagement = () => {
    const [priceTickets, setPriceTickets] = useState<PriceTicketResponse[]>([]);
    const [statuses, setStatuses] = useState<PriceTicketStatus[]>(defaultStatuses);
    const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
    const [seatTypes, setSeatTypes] = useState<SeatTypeResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [roomTypeInput, setRoomTypeInput] = useState<number | "">("");
    const [seatTypeInput, setSeatTypeInput] = useState<number | "">("");
    const [statusInput, setStatusInput] = useState<PriceTicketStatus | "">("");

    const [filters, setFilters] = useState({
        roomTypeId: undefined as number | undefined,
        seatTypeId: undefined as number | undefined,
        status: "" as PriceTicketStatus | "",
        page: 1,
        size: 10,
    });

    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingPriceTicket, setEditingPriceTicket] = useState<PriceTicketResponse | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PriceTicketResponse | null>(null);

    const createForm = useForm<
        CreatePriceTicketFormInput,
        unknown,
        CreatePriceTicketFormValues
    >({
        resolver: zodResolver(createPriceTicketSchema),
        defaultValues: {
            price: 0,
            roomTypeId: 0,
            seatTypeId: 0,
            status: "ACTIVE",
        },
    });

    const editForm = useForm<
        UpdatePriceTicketFormInput,
        unknown,
        UpdatePriceTicketFormValues
    >({
        resolver: zodResolver(updatePriceTicketSchema),
        defaultValues: {
            price: 0,
            roomTypeId: 0,
            seatTypeId: 0,
            status: "ACTIVE",
        },
    });

    const roomTypeNameMap = useMemo(
        () => new Map(roomTypes.map((item) => [item.roomTypeId, item.roomTypeName])),
        [roomTypes]
    );

    const seatTypeNameMap = useMemo(
        () => new Map(seatTypes.map((item) => [item.seatTypeId, item.seatTypeName])),
        [seatTypes]
    );

    const fetchStatuses = useCallback(async () => {
        try {
            const response = await priceTicketService.getAllPriceTicketStatuses();
            const nextStatuses = response.result?.items ?? defaultStatuses;
            setStatuses(nextStatuses.length > 0 ? nextStatuses : defaultStatuses);
        } catch {
            setStatuses(defaultStatuses);
        }
    }, []);

    const fetchTypeOptions = useCallback(async () => {
        try {
            const [roomTypeResponse, seatTypeResponse] = await Promise.all([
                roomTypeService.filterRoomTypes({ page: 1, size: 100 }),
                seatTypeService.filterSeatTypes({ page: 1, size: 100 }),
            ]);

            setRoomTypes(roomTypeResponse.result?.items ?? []);
            setSeatTypes(seatTypeResponse.result?.items ?? []);
        } catch {
            setRoomTypes([]);
            setSeatTypes([]);
        }
    }, []);

    const fetchPriceTickets = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await priceTicketService.filterPriceTickets({
                roomTypeId: filters.roomTypeId,
                seatTypeId: filters.seatTypeId,
                status: filters.status,
                page: filters.page,
                size: filters.size,
            });

            const result = response.result;
            if (!result) {
                setPriceTickets([]);
                setTotalItems(0);
                setTotalPages(1);
                return;
            }

            setPriceTickets(result.items ?? []);
            setTotalItems(result.totalItems ?? 0);
            setTotalPages(Math.max(1, result.totalPages ?? 1));
        } catch (error) {
            toast.error(parseApiError(error, "Không thể tải danh sách giá vé"));
            setPriceTickets([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        void fetchStatuses();
        void fetchTypeOptions();
    }, [fetchStatuses, fetchTypeOptions]);

    useEffect(() => {
        void fetchPriceTickets();
    }, [fetchPriceTickets]);

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
            roomTypeId: roomTypeInput === "" ? undefined : roomTypeInput,
            seatTypeId: seatTypeInput === "" ? undefined : seatTypeInput,
            status: statusInput,
            page: 1,
        }));
    };

    const openCreateModal = () => {
        createForm.reset({
            price: 0,
            roomTypeId: 0,
            seatTypeId: 0,
            status: "ACTIVE",
        });
        setOpenCreate(true);
    };

    const openEditModal = (priceTicket: PriceTicketResponse) => {
        setEditingPriceTicket(priceTicket);
        editForm.reset({
            price: Number(priceTicket.price ?? 0),
            roomTypeId: priceTicket.roomTypeId ?? priceTicket.roomType?.roomTypeId ?? 0,
            seatTypeId: priceTicket.seatTypeId ?? priceTicket.seatType?.seatTypeId ?? 0,
            status: priceTicket.status,
        });
        setOpenEdit(true);
    };

    const submitCreate = createForm.handleSubmit(async (values) => {
        const payload: PriceTicketCreationRequest = {
            price: values.price,
            roomTypeId: values.roomTypeId,
            seatTypeId: values.seatTypeId,
            status: values.status as PriceTicketStatus,
        };

        try {
            const response = await priceTicketService.createPriceTicket(payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Tạo giá vé thất bại");
                return;
            }

            toast.success("Tạo giá vé thành công");
            setOpenCreate(false);
            void fetchPriceTickets();
        } catch (error) {
            toast.error(parseApiError(error, "Tạo giá vé thất bại"));
        }
    });

    const submitUpdate = editForm.handleSubmit(async (values) => {
        if (!editingPriceTicket) return;

        const payload: PriceTicketUpdateRequest = {
            price: values.price,
            roomTypeId: values.roomTypeId,
            seatTypeId: values.seatTypeId,
            status: values.status as PriceTicketStatus,
        };

        try {
            const response = await priceTicketService.updatePriceTicket(
                editingPriceTicket.priceTicketId,
                payload
            );
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Cập nhật giá vé thất bại");
                return;
            }

            toast.success("Cập nhật giá vé thành công");
            setOpenEdit(false);
            setEditingPriceTicket(null);
            void fetchPriceTickets();
        } catch (error) {
            toast.error(parseApiError(error, "Cập nhật giá vé thất bại"));
        }
    });

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            const response = await priceTicketService.deletePriceTicket(deleteTarget.priceTicketId);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Xóa giá vé thất bại");
                return;
            }

            toast.success("Xóa giá vé thành công");
            setDeleteTarget(null);
            void fetchPriceTickets();
        } catch (error) {
            toast.error(parseApiError(error, "Xóa giá vé thất bại"));
        }
    };

    const renderRoomTypeName = (item: PriceTicketResponse) => {
        const id = item.roomTypeId ?? item.roomType?.roomTypeId;
        return item.roomType?.roomTypeName || (id ? roomTypeNameMap.get(id) : "-") || "-";
    };

    const renderSeatTypeName = (item: PriceTicketResponse) => {
        const id = item.seatTypeId ?? item.seatType?.seatTypeId;
        return item.seatType?.seatTypeName || (id ? seatTypeNameMap.get(id) : "-") || "-";
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                            Quản trị giá vé
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-800">
                            Quản lý giá vé
                        </h2>
                        <p className="mt-2 text-sm text-[var(--glx-text-muted)]">
                            Lọc, tạo và cập nhật giá vé theo loại phòng và loại ghế.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--glx-orange)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-orange-soft)]"
                    >
                        + Thêm giá vé
                    </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                    <select
                        value={roomTypeInput}
                        onChange={(event) => {
                            const value = event.target.value;
                            setRoomTypeInput(value ? Number(value) : "");
                        }}
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">Tất cả loại phòng</option>
                        {roomTypes.map((item) => (
                            <option key={item.roomTypeId} value={item.roomTypeId}>
                                {item.roomTypeName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={seatTypeInput}
                        onChange={(event) => {
                            const value = event.target.value;
                            setSeatTypeInput(value ? Number(value) : "");
                        }}
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">Tất cả loại ghế</option>
                        {seatTypes.map((item) => (
                            <option key={item.seatTypeId} value={item.seatTypeId}>
                                {item.seatTypeName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusInput}
                        onChange={(event) => setStatusInput(event.target.value as PriceTicketStatus | "")}
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
                    <h3 className="text-lg font-bold text-slate-800">Danh sách giá vé</h3>
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
                                <th className="px-6 py-3 font-bold text-slate-600">Giá</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Loại phòng</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Loại ghế</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Trạng thái</th>
                                <th className="px-6 py-3 font-bold text-right text-slate-600">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glx-border)]">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Đang tải giá vé...
                                    </td>
                                </tr>
                            ) : priceTickets.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Không tìm thấy giá vé
                                    </td>
                                </tr>
                            ) : (
                                priceTickets.map((item) => (
                                    <tr key={item.priceTicketId} className="bg-white hover:bg-slate-50/80">
                                        <td className="px-6 py-4 text-slate-600">{item.priceTicketId}</td>
                                        <td className="px-6 py-4 text-slate-700 font-semibold">
                                            {Number(item.price ?? 0).toLocaleString("vi-VN")} đ
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {renderRoomTypeName(item)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {renderSeatTypeName(item)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                    item.status === "ACTIVE"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-200 text-slate-700"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(item)}
                                                    className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-[var(--glx-blue)] hover:text-[var(--glx-blue)]"
                                                >Sửa</button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(item)}
                                                    className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all duration-300 hover:bg-rose-50"
                                                >Xóa</button>
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

            <ModalShell open={openCreate} onClose={() => setOpenCreate(false)} title="Thêm giá vé">
                <form className="space-y-3" onSubmit={submitCreate}>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">Giá *</label>
                        <input
                            type="number"
                            step="0.01"
                            min={0}
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
                        <label className="mb-1 block text-xs font-bold text-slate-500">Loại phòng *</label>
                        <select
                            {...createForm.register("roomTypeId")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        >
                            <option value={0}>Chọn loại phòng</option>
                            {roomTypes.map((item) => (
                                <option key={`create-room-${item.roomTypeId}`} value={item.roomTypeId}>
                                    {item.roomTypeName}
                                </option>
                            ))}
                        </select>
                        {createForm.formState.errors.roomTypeId && (
                            <p className="mt-1 text-xs text-rose-500">
                                {createForm.formState.errors.roomTypeId.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">Loại ghế *</label>
                        <select
                            {...createForm.register("seatTypeId")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        >
                            <option value={0}>Chọn loại ghế</option>
                            {seatTypes.map((item) => (
                                <option key={`create-seat-${item.seatTypeId}`} value={item.seatTypeId}>
                                    {item.seatTypeName}
                                </option>
                            ))}
                        </select>
                        {createForm.formState.errors.seatTypeId && (
                            <p className="mt-1 text-xs text-rose-500">
                                {createForm.formState.errors.seatTypeId.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">Trạng thái *</label>
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
                        >Hủy</button>
                        <button
                            type="submit"
                            disabled={createForm.formState.isSubmitting}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >Tạo mới</button>
                    </div>
                </form>
            </ModalShell>

            <ModalShell open={openEdit} onClose={() => setOpenEdit(false)} title="Sửa giá vé">
                <form className="space-y-3" onSubmit={submitUpdate}>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">Giá *</label>
                        <input
                            type="number"
                            step="0.01"
                            min={0}
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
                        <label className="mb-1 block text-xs font-bold text-slate-500">Loại phòng *</label>
                        <select
                            {...editForm.register("roomTypeId")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        >
                            <option value={0}>Chọn loại phòng</option>
                            {roomTypes.map((item) => (
                                <option key={`edit-room-${item.roomTypeId}`} value={item.roomTypeId}>
                                    {item.roomTypeName}
                                </option>
                            ))}
                        </select>
                        {editForm.formState.errors.roomTypeId && (
                            <p className="mt-1 text-xs text-rose-500">
                                {editForm.formState.errors.roomTypeId.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">Loại ghế *</label>
                        <select
                            {...editForm.register("seatTypeId")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        >
                            <option value={0}>Chọn loại ghế</option>
                            {seatTypes.map((item) => (
                                <option key={`edit-seat-${item.seatTypeId}`} value={item.seatTypeId}>
                                    {item.seatTypeName}
                                </option>
                            ))}
                        </select>
                        {editForm.formState.errors.seatTypeId && (
                            <p className="mt-1 text-xs text-rose-500">
                                {editForm.formState.errors.seatTypeId.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">Trạng thái *</label>
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
                        >Hủy</button>
                        <button
                            type="submit"
                            disabled={editForm.formState.isSubmitting}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >Lưu</button>
                    </div>
                </form>
            </ModalShell>

            <ModalShell
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                title="Xóa giá vé"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Bạn có chắc muốn xóa giá vé này?
                    </p>
                    <p className="text-xs text-rose-500">
                        Không thể xóa nếu còn vé ACTIVE đang dùng giá vé này.
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

export default PriceTicketManagement;



