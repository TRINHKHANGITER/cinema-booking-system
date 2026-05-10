import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import Close from "../../components/icon/close";
import { seatService } from "../../services/seat.service";
import { seatTypeService } from "../../services/seatType.service";
import type { RoomResponse } from "../../types/room";
import type { SeatCreationRequest, SeatResponse, SeatStatus } from "../../types/seat";
import type { SeatTypeResponse } from "../../types/seat-type";

type RoomSeatManagerModalProps = {
    open: boolean;
    room: RoomResponse | null;
    onClose: () => void;
};

type ModalShellProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    maxWidthClass?: string;
    children: ReactNode;
};

type SeatVariant = "STANDARD" | "VIP" | "COUPLE";

const defaultSeatStatuses: SeatStatus[] = ["ACTIVE", "BLOCKED", "BROKEN"];

const seatSchema = z.object({
    seatRow: z
        .string()
        .trim()
        .min(1, "Hàng là bắt buộc")
        .max(1, "Hàng chỉ được 1 ký tự")
        .regex(/^[A-Za-z]$/, "Hàng phải là một chữ cái từ A-Z"),
    seatColumn: z.coerce.number().int().min(1, "Cột phải lớn hơn 0"),
    seatTypeId: z.coerce.number().int().min(1, "Loại ghế là bắt buộc"),
    status: z.string().trim().min(1, "Trạng thái là bắt buộc"),
});

type SeatFormValues = z.infer<typeof seatSchema>;
type SeatFormInput = z.input<typeof seatSchema>;

const parseApiError = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        const payload = error.response?.data as { message?: string } | undefined;
        return payload?.message || fallback;
    }
    return fallback;
};

const normalizeKeyword = (value?: string | null) => {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .trim();
};

const getSeatVariant = (seatTypeName?: string | null): SeatVariant => {
    const keyword = normalizeKeyword(seatTypeName);
    if (keyword.includes("vip")) return "VIP";
    if (keyword.includes("doi") || keyword.includes("couple") || keyword.includes("double")) {
        return "COUPLE";
    }
    return "STANDARD";
};

const isBookedStatus = (status: SeatStatus) => status !== "ACTIVE";

const ModalShell = ({ open, title, onClose, maxWidthClass, children }: ModalShellProps) => {
    const widthClass = maxWidthClass ?? "max-w-[1080px]";

    return (
        <div
            className={`fixed inset-0 z-[1050] grid h-screen w-screen place-items-center bg-black/45 px-4 transition-opacity duration-300 ${
                open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
        >
            <div className={`relative w-full ${widthClass} rounded-md bg-white px-6 py-6 shadow-2xl`}>
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

const RoomSeatManagerModal = ({ open, room, onClose }: RoomSeatManagerModalProps) => {
    const [seats, setSeats] = useState<SeatResponse[]>([]);
    const [seatTypes, setSeatTypes] = useState<SeatTypeResponse[]>([]);
    const [seatStatuses, setSeatStatuses] = useState<SeatStatus[]>(defaultSeatStatuses);
    const [statusFilter, setStatusFilter] = useState<SeatStatus | "ALL">("ALL");
    const [isLoading, setIsLoading] = useState(false);

    const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingSeat, setEditingSeat] = useState<SeatResponse | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SeatResponse | null>(null);

    const createForm = useForm<SeatFormInput, unknown, SeatFormValues>({
        resolver: zodResolver(seatSchema),
        defaultValues: {
            seatRow: "",
            seatColumn: 1,
            seatTypeId: 0,
            status: "ACTIVE",
        },
    });

    const editForm = useForm<SeatFormInput, unknown, SeatFormValues>({
        resolver: zodResolver(seatSchema),
        defaultValues: {
            seatRow: "",
            seatColumn: 1,
            seatTypeId: 0,
            status: "ACTIVE",
        },
    });

    const fetchSeatStatuses = useCallback(async () => {
        try {
            const response = await seatService.getAllSeatStatuses();
            const nextStatuses = response.result?.items ?? defaultSeatStatuses;
            setSeatStatuses(nextStatuses.length > 0 ? nextStatuses : defaultSeatStatuses);
        } catch {
            setSeatStatuses(defaultSeatStatuses);
        }
    }, []);

    const fetchSeatTypes = useCallback(async () => {
        try {
            const response = await seatTypeService.filterSeatTypes({
                status: "ACTIVE",
                page: 1,
                size: 100,
            });
            setSeatTypes(response.result?.items ?? []);
        } catch {
            setSeatTypes([]);
        }
    }, []);

    const fetchSeats = useCallback(async () => {
        if (!room) {
            setSeats([]);
            return;
        }

        try {
            setIsLoading(true);
            const response = await seatService.getSeatsByRoom(
                room.roomId,
                statusFilter === "ALL" ? undefined : statusFilter
            );
            setSeats(response.result ?? []);
        } catch (error) {
            toast.error(parseApiError(error, "Không thể tải danh sách ghế"));
            setSeats([]);
        } finally {
            setIsLoading(false);
        }
    }, [room, statusFilter]);

    useEffect(() => {
        if (!open) return;
        void fetchSeatStatuses();
        void fetchSeatTypes();
    }, [fetchSeatStatuses, fetchSeatTypes, open]);

    useEffect(() => {
        if (!open) return;
        void fetchSeats();
    }, [fetchSeats, open]);

    useEffect(() => {
        if (!open) {
            setStatusFilter("ALL");
            setSelectedSeatId(null);
            setOpenCreate(false);
            setOpenEdit(false);
            setEditingSeat(null);
            setDeleteTarget(null);
            setSeats([]);
        }
    }, [open]);

    useEffect(() => {
        if (selectedSeatId == null) return;
        if (!seats.some((seat) => seat.seatId === selectedSeatId)) {
            setSelectedSeatId(null);
        }
    }, [seats, selectedSeatId]);

    const groupedSeats = useMemo(() => {
        const grouped = new Map<string, SeatResponse[]>();
        for (const seat of seats) {
            const row = seat.seatRow;
            if (!grouped.has(row)) grouped.set(row, []);
            grouped.get(row)?.push(seat);
        }

        return Array.from(grouped.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([row, rowSeats]) => ({
                row,
                seats: [...rowSeats].sort((a, b) => a.seatColumn - b.seatColumn),
            }));
    }, [seats]);

    const selectedSeat = useMemo(() => {
        if (selectedSeatId == null) return null;
        return seats.find((seat) => seat.seatId === selectedSeatId) ?? null;
    }, [seats, selectedSeatId]);

    const selectedSeatLabel = selectedSeat
        ? `${selectedSeat.seatRow}${selectedSeat.seatColumn}`
        : "Chưa chọn";

    const openCreateModal = () => {
        createForm.reset({
            seatRow: "",
            seatColumn: 1,
            seatTypeId: 0,
            status: "ACTIVE",
        });
        setOpenCreate(true);
    };

    const openEditModal = (seat: SeatResponse) => {
        setEditingSeat(seat);
        editForm.reset({
            seatRow: seat.seatRow,
            seatColumn: seat.seatColumn,
            seatTypeId: seat.seatTypeId ?? seat.seatType?.seatTypeId ?? 0,
            status: seat.status,
        });
        setOpenEdit(true);
    };

    const closeCreateModal = () => setOpenCreate(false);

    const closeEditModal = () => {
        setOpenEdit(false);
        setEditingSeat(null);
    };

    const handleOpenEditFromSelection = () => {
        if (!selectedSeat) {
            toast.error("Vui lòng chọn ghế để sửa");
            return;
        }
        openEditModal(selectedSeat);
    };

    const handleOpenDeleteFromSelection = () => {
        if (!selectedSeat) {
            toast.error("Vui lòng chọn ghế để xóa");
            return;
        }
        setDeleteTarget(selectedSeat);
    };

    const submitCreate = createForm.handleSubmit(async (values) => {
        if (!room) return;

        const payload: SeatCreationRequest = {
            seatRow: values.seatRow.trim().toUpperCase(),
            seatColumn: values.seatColumn,
            seatTypeId: values.seatTypeId,
            roomId: room.roomId,
            status: values.status as SeatStatus,
        };

        try {
            const response = await seatService.createSeat(payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Tạo ghế thất bại");
                return;
            }
            toast.success("Tạo ghế thành công");
            closeCreateModal();
            void fetchSeats();
        } catch (error) {
            toast.error(parseApiError(error, "Tạo ghế thất bại"));
        }
    });

    const submitUpdate = editForm.handleSubmit(async (values) => {
        if (!room || !editingSeat) return;

        const payload: SeatCreationRequest = {
            seatRow: values.seatRow.trim().toUpperCase(),
            seatColumn: values.seatColumn,
            seatTypeId: values.seatTypeId,
            roomId: room.roomId,
            status: values.status as SeatStatus,
        };

        try {
            const response = await seatService.updateSeat(editingSeat.seatId, payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Cập nhật ghế thất bại");
                return;
            }
            toast.success("Cập nhật ghế thành công");
            closeEditModal();
            void fetchSeats();
        } catch (error) {
            toast.error(parseApiError(error, "Cập nhật ghế thất bại"));
        }
    });

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const response = await seatService.deleteSeat(deleteTarget.seatId);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Xóa ghế thất bại");
                return;
            }
            toast.success("Xóa ghế thành công");
            setDeleteTarget(null);
            if (selectedSeatId === deleteTarget.seatId) {
                setSelectedSeatId(null);
            }
            void fetchSeats();
        } catch (error) {
            toast.error(parseApiError(error, "Xóa ghế thất bại"));
        }
    };

    const renderSeatButtons = (rowSeats: SeatResponse[]) => {
        const elements: ReactNode[] = [];

        for (let index = 0; index < rowSeats.length; index += 1) {
            const seat = rowSeats[index];
            const variant = getSeatVariant(seat.seatType?.seatTypeName);

            let buttonLabel = `${seat.seatRow}${seat.seatColumn}`;
            let widthClass = "w-7";
            let seatIds = [seat.seatId];
            let skipNext = false;

            if (variant === "COUPLE") {
                const nextSeat = rowSeats[index + 1];
                const isPair =
                    nextSeat != null &&
                    getSeatVariant(nextSeat.seatType?.seatTypeName) === "COUPLE" &&
                    nextSeat.seatColumn === seat.seatColumn + 1;

                if (isPair) {
                    buttonLabel = `${seat.seatRow}${seat.seatColumn}-${nextSeat.seatRow}${nextSeat.seatColumn}`;
                    widthClass = "w-16";
                    seatIds = [seat.seatId, nextSeat.seatId];
                    skipNext = true;
                } else {
                    widthClass = "w-10";
                }
            }

            const isSelected = seatIds.includes(selectedSeatId ?? -1);
            const isBooked = isBookedStatus(seat.status);

            const baseClass = "h-7 rounded-t-md rounded-b-sm border-[1.5px] text-[10px] font-medium transition-all duration-150";
            const visualClass = isBooked
                ? "bg-gray-100 border-gray-200 text-gray-300"
                : isSelected
                  ? variant === "VIP"
                    ? "bg-[#BA7517] border-[#854F0B] text-[#FAEEDA] scale-110"
                    : variant === "COUPLE"
                      ? "bg-[#D4537E] border-[#993556] text-[#FBEAF0] scale-105"
                      : "bg-[#034ea2] border-[#023a7a] text-white scale-110"
                  : variant === "VIP"
                    ? "bg-[#FAEEDA] border-[#EF9F27] text-[#854F0B] hover:bg-[#FAC775]"
                    : variant === "COUPLE"
                      ? "bg-[#FBEAF0] border-[#ED93B1] text-[#72243E] hover:bg-[#F4C0D1]"
                      : "bg-white border-gray-300 text-gray-600 hover:border-[#034ea2] hover:text-[#034ea2]";

            elements.push(
                <button
                    key={seat.seatId}
                    type="button"
                    onClick={() => setSelectedSeatId(seat.seatId)}
                    className={`${baseClass} ${widthClass} ${visualClass}`}
                    title={`${buttonLabel} - ${isBooked ? "Không khả dụng" : "Còn trống"}`}
                >
                    {buttonLabel}
                </button>
            );

            if (skipNext) index += 1;
        }

        return elements;
    };

    return (
        <>
            <ModalShell
                open={open}
                onClose={onClose}
                title={`Quản lý ghế - ${room?.roomName ?? ""}`}
                maxWidthClass="max-w-[1120px]"
            >
                <div className="space-y-5">
                    <div className="flex flex-col gap-3 border-b border-[var(--glx-border)] pb-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value as SeatStatus | "ALL")
                                }
                                className="h-9 rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                {seatStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => void fetchSeats()}
                                className="h-9 rounded-md border border-[var(--glx-blue)] bg-[var(--glx-blue)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--glx-blue-strong)]"
                            >
                                Làm mới
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="h-9 rounded-md bg-[var(--glx-orange)] px-3 text-xs font-semibold text-white transition hover:bg-[var(--glx-orange-soft)]"
                            >
                                + Thêm
                            </button>
                            <button
                                type="button"
                                onClick={handleOpenEditFromSelection}
                                disabled={!selectedSeat}
                                className="h-9 rounded-md border border-[var(--glx-border)] px-3 text-xs font-semibold text-slate-700 transition hover:border-[var(--glx-blue)] hover:text-[var(--glx-blue)] disabled:cursor-not-allowed disabled:opacity-50"
                            >Sửa</button>
                            <button
                                type="button"
                                onClick={handleOpenDeleteFromSelection}
                                disabled={!selectedSeat}
                                className="h-9 rounded-md border border-rose-200 px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >Xóa</button>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500">
                        Ghế đang chọn: <span className="font-semibold text-slate-700">{selectedSeatLabel}</span>
                    </div>

                    <div className="rounded-xl border border-[var(--glx-border)] bg-[#f6f6f7] p-4 md:p-6">
                        <div className="mb-6 flex flex-col items-center">
                            <div className="h-1 w-3/5 rounded-full bg-[#034ea2] opacity-50" />
                            <p className="mt-2 text-xs tracking-[0.2em] text-slate-400">Màn hình</p>
                        </div>

                        {isLoading ? (
                            <p className="py-8 text-center text-sm text-slate-500">Đang tải ghế...</p>
                        ) : groupedSeats.length === 0 ? (
                            <p className="py-8 text-center text-sm text-slate-500">
                                Không tìm thấy ghế cho phòng này
                            </p>
                        ) : (
                            <div className="flex flex-col items-center gap-1.5 overflow-auto">
                                {groupedSeats.map((rowGroup) => (
                                    <div key={rowGroup.row} className="flex items-center gap-2">
                                        <span className="w-4 text-center text-[11px] text-slate-400">
                                            {rowGroup.row}
                                        </span>

                                        <div className="flex items-center gap-1">
                                            {renderSeatButtons(rowGroup.seats)}
                                        </div>

                                        <span className="w-4 text-center text-[11px] text-slate-400">
                                            {rowGroup.row}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-7 flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-200 pt-4 md:flex-row">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block h-5 w-5 rounded border border-gray-200 bg-gray-100" />
                                    <span className="text-xs text-slate-500">Không khả dụng / Đang giữ</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block h-5 w-5 rounded bg-[#034ea2]" />
                                    <span className="text-xs text-slate-500">Đang chọn</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block h-5 w-5 rounded border border-gray-300 bg-white" />
                                    <span className="text-xs text-slate-500">Ghế đơn</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block h-5 w-5 rounded border border-[#EF9F27] bg-[#FAEEDA]" />
                                    <span className="text-xs text-slate-500">VIP</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block h-5 w-10 rounded border border-[#ED93B1] bg-[#FBEAF0]" />
                                    <span className="text-xs text-slate-500">Ghế đôi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalShell>

            <ModalShell open={openCreate} onClose={closeCreateModal} title="Thêm ghế" maxWidthClass="max-w-[560px]">
                <form className="space-y-3" onSubmit={submitCreate}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">Hàng *</label>
                            <input
                                type="text"
                                maxLength={1}
                                {...createForm.register("seatRow")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm uppercase outline-none transition focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {createForm.formState.errors.seatRow && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.seatRow.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">Cột *</label>
                            <input
                                type="number"
                                min={1}
                                {...createForm.register("seatColumn")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {createForm.formState.errors.seatColumn && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.seatColumn.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">Loại ghế *</label>
                            <select
                                {...createForm.register("seatTypeId")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value={0}>Chọn loại ghế</option>
                                {seatTypes.map((seatType) => (
                                    <option
                                        key={`create-seat-type-${seatType.seatTypeId}`}
                                        value={seatType.seatTypeId}
                                    >
                                        {seatType.seatTypeName}
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
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                {seatStatuses.map((status) => (
                                    <option key={`create-seat-status-${status}`} value={status}>
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

            <ModalShell open={openEdit} onClose={closeEditModal} title="Sửa ghế" maxWidthClass="max-w-[560px]">
                <form className="space-y-3" onSubmit={submitUpdate}>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">Hàng *</label>
                            <input
                                type="text"
                                maxLength={1}
                                {...editForm.register("seatRow")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm uppercase outline-none transition focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {editForm.formState.errors.seatRow && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.seatRow.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">Cột *</label>
                            <input
                                type="number"
                                min={1}
                                {...editForm.register("seatColumn")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {editForm.formState.errors.seatColumn && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.seatColumn.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">Loại ghế *</label>
                            <select
                                {...editForm.register("seatTypeId")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value={0}>Chọn loại ghế</option>
                                {seatTypes.map((seatType) => (
                                    <option
                                        key={`edit-seat-type-${seatType.seatTypeId}`}
                                        value={seatType.seatTypeId}
                                    >
                                        {seatType.seatTypeName}
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
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                {seatStatuses.map((status) => (
                                    <option key={`edit-seat-status-${status}`} value={status}>
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

            <ModalShell
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                title="Xóa ghế"
                maxWidthClass="max-w-[520px]"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Bạn có chắc muốn xóa ghế{" "}
                        <strong>
                            {deleteTarget?.seatRow}
                            {deleteTarget?.seatColumn}
                        </strong>
                        ?
                    </p>
                    <p className="text-xs text-rose-500">
                        Không thể xóa nếu ghế còn vé ACTIVE hoặc đang được HELD.
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
        </>
    );
};

export default RoomSeatManagerModal;




