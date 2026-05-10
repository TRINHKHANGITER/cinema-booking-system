import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import Close from "../../components/icon/close";
import { roomService } from "../../services/room.service";
import { provinceService } from "../../services/province.service";
import { cinemaService } from "../../services/cinema.service";
import { roomTypeService } from "../../services/roomType.service";
import RoomSeatManagerModal from "./RoomSeatManagerModal";
import type {
    RoomCreationRequest,
    RoomResponse,
    RoomStatus,
    RoomUpdateRequest,
} from "../../types/room";
import type { ProvinceResponse } from "../../types/province";
import type { CinemaResponse } from "../../types/cinema";
import type { RoomTypeResponse } from "../../types/room-type";

const defaultStatuses: RoomStatus[] = ["ACTIVE", "INACTIVE", "UNDER_MAINTENANCE"];

const createRoomSchema = z.object({
    roomName: z.string().trim().min(1, "Tên phòng là bắt buộc"),
    capacity: z.coerce.number().int().min(1, "Sức chứa phải lớn hơn 0"),
    provinceId: z.coerce.number().int().min(1, "Tỉnh/thành là bắt buộc"),
    cinemaId: z.coerce.number().int().min(1, "Rạp là bắt buộc"),
    roomTypeId: z.coerce.number().int().min(1, "Loại phòng là bắt buộc"),
    status: z.string().trim().min(1, "Trạng thái là bắt buộc"),
});

const updateRoomSchema = z.object({
    roomName: z.string().trim().min(1, "Tên phòng là bắt buộc"),
    capacity: z.coerce.number().int().min(1, "Sức chứa phải lớn hơn 0"),
    provinceId: z.coerce.number().int().min(1, "Tỉnh/thành là bắt buộc"),
    cinemaId: z.coerce.number().int().min(1, "Rạp là bắt buộc"),
    roomTypeId: z.coerce.number().int().min(1, "Loại phòng là bắt buộc"),
    status: z.string().trim().min(1, "Trạng thái là bắt buộc"),
});

type CreateRoomFormValues = z.infer<typeof createRoomSchema>;
type UpdateRoomFormValues = z.infer<typeof updateRoomSchema>;
type CreateRoomFormInput = z.input<typeof createRoomSchema>;
type UpdateRoomFormInput = z.input<typeof updateRoomSchema>;

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

const badgeClassByStatus: Record<RoomStatus, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    UNDER_MAINTENANCE: "bg-amber-100 text-amber-700",
    INACTIVE: "bg-slate-200 text-slate-700",
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

const resolveProvinceIdFromRoom = (room: RoomResponse) => {
    return room.cinema?.provinceId ?? room.cinema?.province?.provinceId ?? 0;
};

const resolveCinemaIdFromRoom = (room: RoomResponse) => {
    return room.cinemaId ?? room.cinema?.cinemaId ?? 0;
};

const resolveRoomTypeIdFromRoom = (room: RoomResponse) => {
    return room.roomTypeId ?? room.roomType?.roomTypeId ?? 0;
};

const RoomManagement = () => {
    const [rooms, setRooms] = useState<RoomResponse[]>([]);
    const [statuses, setStatuses] = useState<RoomStatus[]>(defaultStatuses);
    const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [filterCinemas, setFilterCinemas] = useState<CinemaResponse[]>([]);
    const [filterRoomTypes, setFilterRoomTypes] = useState<RoomTypeResponse[]>([]);

    const [nameInput, setNameInput] = useState("");
    const [roomIdInput, setRoomIdInput] = useState<number | "">("");
    const [provinceInput, setProvinceInput] = useState<number | "">("");
    const [cinemaInput, setCinemaInput] = useState<number | "">("");
    const [roomTypeInput, setRoomTypeInput] = useState<number | "">("");
    const [statusInput, setStatusInput] = useState<RoomStatus | "">("");

    const [filters, setFilters] = useState({
        roomId: undefined as number | undefined,
        provinceId: undefined as number | undefined,
        cinemaId: undefined as number | undefined,
        roomTypeId: undefined as number | undefined,
        name: "",
        status: "" as RoomStatus | "",
        page: 1,
        size: 10,
    });

    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomResponse | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<RoomResponse | null>(null);
    const [seatManagingRoom, setSeatManagingRoom] = useState<RoomResponse | null>(null);

    const [createCinemas, setCreateCinemas] = useState<CinemaResponse[]>([]);
    const [createRoomTypes, setCreateRoomTypes] = useState<RoomTypeResponse[]>([]);
    const [editCinemas, setEditCinemas] = useState<CinemaResponse[]>([]);
    const [editRoomTypes, setEditRoomTypes] = useState<RoomTypeResponse[]>([]);

    const createForm = useForm<CreateRoomFormInput, unknown, CreateRoomFormValues>({
        resolver: zodResolver(createRoomSchema),
        defaultValues: {
            roomName: "",
            capacity: 1,
            provinceId: 0,
            cinemaId: 0,
            roomTypeId: 0,
            status: "ACTIVE",
        },
    });

    const editForm = useForm<UpdateRoomFormInput, unknown, UpdateRoomFormValues>({
        resolver: zodResolver(updateRoomSchema),
        defaultValues: {
            roomName: "",
            capacity: 1,
            provinceId: 0,
            cinemaId: 0,
            roomTypeId: 0,
            status: "ACTIVE",
        },
    });

    const provinceNameMap = useMemo(
        () => new Map(provinces.map((province) => [province.provinceId, province.provinceName])),
        [provinces]
    );

    const fetchStatuses = useCallback(async () => {
        try {
            const response = await roomService.getAllRoomStatuses();
            const nextStatuses = response.result?.items ?? defaultStatuses;
            setStatuses(nextStatuses.length > 0 ? nextStatuses : defaultStatuses);
        } catch {
            setStatuses(defaultStatuses);
        }
    }, []);

    const fetchProvinces = useCallback(async () => {
        try {
            const response = await provinceService.getProvinceItemList("ACTIVE");
            setProvinces(response.result?.items ?? []);
        } catch {
            setProvinces([]);
        }
    }, []);

    const fetchCinemaOptions = useCallback(async (provinceId?: number) => {
        const response = await cinemaService.getCinemaItemList({
            provinceId,
            status: "ACTIVE",
        });
        return response.result?.items ?? [];
    }, []);

    const fetchRoomTypeOptions = useCallback(async (provinceId?: number, cinemaId?: number) => {
        const response = await roomTypeService.getRoomTypeItemList({
            provinceId,
            cinemaId,
            status: "ACTIVE",
        });
        return response.result?.items ?? [];
    }, []);

    const fetchRooms = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await roomService.filterRooms({
                roomId: filters.roomId,
                provinceId: filters.provinceId,
                cinemaId: filters.cinemaId,
                roomTypeId: filters.roomTypeId,
                name: filters.name,
                status: filters.status,
                page: filters.page,
                size: filters.size,
            });

            const result = response.result;
            if (!result) {
                setRooms([]);
                setTotalItems(0);
                setTotalPages(1);
                return;
            }

            setRooms(result.items ?? []);
            setTotalItems(result.totalItems ?? 0);
            setTotalPages(Math.max(1, result.totalPages ?? 1));
        } catch (error) {
            toast.error(parseApiError(error, "Không thể tải danh sách phòng"));
            setRooms([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const syncFilterOptions = useCallback(async () => {
        try {
            const [cinemas, roomTypes] = await Promise.all([
                fetchCinemaOptions(undefined),
                fetchRoomTypeOptions(undefined, undefined),
            ]);

            setFilterCinemas(cinemas);
            setFilterRoomTypes(roomTypes);
        } catch {
            setFilterCinemas([]);
            setFilterRoomTypes([]);
        }
    }, [fetchCinemaOptions, fetchRoomTypeOptions]);

    useEffect(() => {
        void fetchStatuses();
        void fetchProvinces();
        void syncFilterOptions();
    }, [fetchProvinces, fetchStatuses, syncFilterOptions]);

    useEffect(() => {
        void fetchRooms();
    }, [fetchRooms]);

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
            roomId: roomIdInput === "" ? undefined : roomIdInput,
            provinceId: provinceInput === "" ? undefined : provinceInput,
            cinemaId: cinemaInput === "" ? undefined : cinemaInput,
            roomTypeId: roomTypeInput === "" ? undefined : roomTypeInput,
            name: nameInput.trim(),
            status: statusInput,
            page: 1,
        }));
    };

    const handleFilterProvinceChange = async (value: string) => {
        const nextProvinceId = value ? Number(value) : "";
        setProvinceInput(nextProvinceId);
        setCinemaInput("");
        setRoomTypeInput("");

        try {
            const [cinemas, roomTypes] = await Promise.all([
                fetchCinemaOptions(nextProvinceId === "" ? undefined : nextProvinceId),
                fetchRoomTypeOptions(nextProvinceId === "" ? undefined : nextProvinceId, undefined),
            ]);
            setFilterCinemas(cinemas);
            setFilterRoomTypes(roomTypes);
        } catch {
            setFilterCinemas([]);
            setFilterRoomTypes([]);
        }
    };

    const handleFilterCinemaChange = async (value: string) => {
        const nextCinemaId = value ? Number(value) : "";
        setCinemaInput(nextCinemaId);
        setRoomTypeInput("");

        try {
            const roomTypes = await fetchRoomTypeOptions(
                provinceInput === "" ? undefined : provinceInput,
                nextCinemaId === "" ? undefined : nextCinemaId
            );
            setFilterRoomTypes(roomTypes);
        } catch {
            setFilterRoomTypes([]);
        }
    };

    const openCreateModal = async () => {
        createForm.reset({
            roomName: "",
            capacity: 1,
            provinceId: 0,
            cinemaId: 0,
            roomTypeId: 0,
            status: "ACTIVE",
        });
        setCreateCinemas([]);
        setCreateRoomTypes([]);
        setOpenCreate(true);
    };

    const openEditModal = (room: RoomResponse) => {
        const provinceId = resolveProvinceIdFromRoom(room);
        const cinemaId = resolveCinemaIdFromRoom(room);
        const roomTypeId = resolveRoomTypeIdFromRoom(room);

        setEditingRoom(room);
        editForm.reset({
            roomName: room.roomName,
            capacity: Number(room.capacity ?? 1),
            provinceId,
            cinemaId,
            roomTypeId,
            status: room.status,
        });
        setOpenEdit(true);

        void (async () => {
            try {
                const [cinemas, roomTypes] = await Promise.all([
                    fetchCinemaOptions(provinceId > 0 ? provinceId : undefined),
                    fetchRoomTypeOptions(
                        provinceId > 0 ? provinceId : undefined,
                        cinemaId > 0 ? cinemaId : undefined
                    ),
                ]);

                setEditCinemas(cinemas);
                setEditRoomTypes(roomTypes);
            } catch {
                setEditCinemas([]);
                setEditRoomTypes([]);
            }
        })();
    };

    const closeCreateModal = () => {
        setOpenCreate(false);
        setCreateCinemas([]);
        setCreateRoomTypes([]);
    };

    const closeEditModal = () => {
        setOpenEdit(false);
        setEditingRoom(null);
        setEditCinemas([]);
        setEditRoomTypes([]);
    };

    const handleCreateProvinceChange = async (value: string) => {
        const provinceId = value ? Number(value) : 0;
        createForm.setValue("provinceId", provinceId, { shouldValidate: true });
        createForm.setValue("cinemaId", 0, { shouldValidate: true });
        createForm.setValue("roomTypeId", 0, { shouldValidate: true });

        if (!provinceId) {
            setCreateCinemas([]);
            setCreateRoomTypes([]);
            return;
        }

        try {
            const [cinemas, roomTypes] = await Promise.all([
                fetchCinemaOptions(provinceId),
                fetchRoomTypeOptions(provinceId, undefined),
            ]);
            setCreateCinemas(cinemas);
            setCreateRoomTypes(roomTypes);
        } catch {
            setCreateCinemas([]);
            setCreateRoomTypes([]);
        }
    };

    const handleCreateCinemaChange = async (value: string) => {
        const cinemaId = value ? Number(value) : 0;
        createForm.setValue("cinemaId", cinemaId, { shouldValidate: true });
        createForm.setValue("roomTypeId", 0, { shouldValidate: true });

        if (!cinemaId) {
            setCreateRoomTypes([]);
            return;
        }

        try {
            const selectedProvinceId = Number(createForm.getValues("provinceId"));
            const roomTypes = await fetchRoomTypeOptions(
                selectedProvinceId > 0 ? selectedProvinceId : undefined,
                cinemaId
            );
            setCreateRoomTypes(roomTypes);
        } catch {
            setCreateRoomTypes([]);
        }
    };

    const handleEditProvinceChange = async (value: string) => {
        const provinceId = value ? Number(value) : 0;
        editForm.setValue("provinceId", provinceId, { shouldValidate: true });
        editForm.setValue("cinemaId", 0, { shouldValidate: true });
        editForm.setValue("roomTypeId", 0, { shouldValidate: true });

        if (!provinceId) {
            setEditCinemas([]);
            setEditRoomTypes([]);
            return;
        }

        try {
            const [cinemas, roomTypes] = await Promise.all([
                fetchCinemaOptions(provinceId),
                fetchRoomTypeOptions(provinceId, undefined),
            ]);
            setEditCinemas(cinemas);
            setEditRoomTypes(roomTypes);
        } catch {
            setEditCinemas([]);
            setEditRoomTypes([]);
        }
    };

    const handleEditCinemaChange = async (value: string) => {
        const cinemaId = value ? Number(value) : 0;
        editForm.setValue("cinemaId", cinemaId, { shouldValidate: true });
        editForm.setValue("roomTypeId", 0, { shouldValidate: true });

        if (!cinemaId) {
            setEditRoomTypes([]);
            return;
        }

        try {
            const selectedProvinceId = Number(editForm.getValues("provinceId"));
            const roomTypes = await fetchRoomTypeOptions(
                selectedProvinceId > 0 ? selectedProvinceId : undefined,
                cinemaId
            );
            setEditRoomTypes(roomTypes);
        } catch {
            setEditRoomTypes([]);
        }
    };

    const submitCreate = createForm.handleSubmit(async (values) => {
        const payload: RoomCreationRequest = {
            roomName: values.roomName.trim(),
            capacity: values.capacity,
            cinemaId: values.cinemaId,
            roomTypeId: values.roomTypeId,
            status: values.status as RoomStatus,
        };

        try {
            const response = await roomService.createRoom(payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Tạo phòng thất bại");
                return;
            }

            toast.success("Tạo phòng thành công");
            closeCreateModal();
            void fetchRooms();
        } catch (error) {
            toast.error(parseApiError(error, "Tạo phòng thất bại"));
        }
    });

    const submitUpdate = editForm.handleSubmit(async (values) => {
        if (!editingRoom) return;

        const payload: RoomUpdateRequest = {
            roomName: values.roomName.trim(),
            capacity: values.capacity,
            cinemaId: values.cinemaId,
            roomTypeId: values.roomTypeId,
            status: values.status as RoomStatus,
        };

        try {
            const response = await roomService.updateRoom(editingRoom.roomId, payload);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Cập nhật phòng thất bại");
                return;
            }

            toast.success("Cập nhật phòng thành công");
            closeEditModal();
            void fetchRooms();
        } catch (error) {
            toast.error(parseApiError(error, "Cập nhật phòng thất bại"));
        }
    });

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            const response = await roomService.deleteRoom(deleteTarget.roomId);
            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Xóa phòng thất bại");
                return;
            }

            toast.success("Xóa phòng thành công");
            setDeleteTarget(null);
            void fetchRooms();
        } catch (error) {
            toast.error(parseApiError(error, "Xóa phòng thất bại"));
        }
    };

    const renderProvinceName = (room: RoomResponse) => {
        const provinceId = room.cinema?.provinceId ?? room.cinema?.province?.provinceId;
        return (
            room.cinema?.provinceName ??
            room.cinema?.province?.provinceName ??
            (provinceId ? provinceNameMap.get(provinceId) : null) ??
            "-"
        );
    };

    const renderCinemaName = (room: RoomResponse) => {
        return room.cinema?.cinemaName || "-";
    };

    const renderRoomTypeName = (room: RoomResponse) => {
        return room.roomType?.roomTypeName || "-";
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                            Quản trị phòng
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-800">Quản lý phòng</h2>
                        <p className="mt-2 text-sm text-[var(--glx-text-muted)]">
                            Lọc, tạo và cập nhật phòng theo tỉnh/thành, rạp và loại phòng.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void openCreateModal()}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--glx-orange)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-orange-soft)]"
                    >
                        + Thêm phòng
                    </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[0.8fr_1.2fr_1fr_1fr_1fr_1fr_auto]">
                    <input
                        value={roomIdInput}
                        onChange={(event) => {
                            const value = event.target.value;
                            setRoomIdInput(value ? Number(value) : "");
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                applyFilters();
                            }
                        }}
                        type="number"
                        min={1}
                        placeholder="Tìm theo ID phòng..."
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />
                    <input
                        value={nameInput}
                        onChange={(event) => setNameInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                applyFilters();
                            }
                        }}
                        type="text"
                        placeholder="Tìm theo tên phòng..."
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />

                    <select
                        value={provinceInput}
                        onChange={(event) => void handleFilterProvinceChange(event.target.value)}
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">Tất cả tỉnh/thành</option>
                        {provinces.map((province) => (
                            <option key={province.provinceId} value={province.provinceId}>
                                {province.provinceName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={cinemaInput}
                        onChange={(event) => void handleFilterCinemaChange(event.target.value)}
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">Tất cả rạp</option>
                        {filterCinemas.map((cinema) => (
                            <option key={cinema.cinemaId} value={cinema.cinemaId}>
                                {cinema.cinemaName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={roomTypeInput}
                        onChange={(event) => {
                            const value = event.target.value;
                            setRoomTypeInput(value ? Number(value) : "");
                        }}
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    >
                        <option value="">Tất cả loại phòng</option>
                        {filterRoomTypes.map((roomType) => (
                            <option key={roomType.roomTypeId} value={roomType.roomTypeId}>
                                {roomType.roomTypeName}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusInput}
                        onChange={(event) => setStatusInput(event.target.value as RoomStatus | "")}
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
                    <h3 className="text-lg font-bold text-slate-800">Danh sách phòng</h3>
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
                                <th className="px-6 py-3 font-bold text-slate-600">Tên phòng</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Tỉnh/Thành</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Rạp</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Loại phòng</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Sức chứa</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Trạng thái</th>
                                <th className="px-6 py-3 font-bold text-right text-slate-600">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glx-border)]">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Đang tải phòng...
                                    </td>
                                </tr>
                            ) : rooms.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-10 text-center text-sm text-slate-500"
                                    >
                                        Không tìm thấy phòng
                                    </td>
                                </tr>
                            ) : (
                                rooms.map((room) => (
                                    <tr key={room.roomId} className="bg-white hover:bg-slate-50/80">
                                        <td className="px-6 py-4 text-slate-600">{room.roomId}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-700">
                                            {room.roomName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {renderProvinceName(room)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {renderCinemaName(room)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {renderRoomTypeName(room)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {room.capacity}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                    badgeClassByStatus[room.status] ??
                                                    "bg-slate-200 text-slate-700"
                                                }`}
                                            >
                                                {room.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setSeatManagingRoom(room)}
                                                    className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                                                >
                                                    Seats
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(room)}
                                                    className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-[var(--glx-blue)] hover:text-[var(--glx-blue)]"
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(room)}
                                                    className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-all duration-300 hover:bg-rose-50"
                                                >
                                                    Xóa
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

            <ModalShell open={openCreate} onClose={closeCreateModal} title="Thêm phòng">
                <form className="space-y-3" onSubmit={submitCreate}>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Tên phòng *
                        </label>
                        <input
                            type="text"
                            {...createForm.register("roomName")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                        {createForm.formState.errors.roomName && (
                            <p className="mt-1 text-xs text-rose-500">
                                {createForm.formState.errors.roomName.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Capacity *
                            </label>
                            <input
                                type="number"
                                min={1}
                                {...createForm.register("capacity")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {createForm.formState.errors.capacity && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.capacity.message}
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

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Tỉnh/Thành *
                            </label>
                            <select
                                value={Number(createForm.watch("provinceId") ?? 0)}
                                onChange={(event) =>
                                    void handleCreateProvinceChange(event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value={0}>Chọn tỉnh/thành</option>
                                {provinces.map((province) => (
                                    <option
                                        key={`create-province-${province.provinceId}`}
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
                                Rạp *
                            </label>
                            <select
                                value={Number(createForm.watch("cinemaId") ?? 0)}
                                onChange={(event) =>
                                    void handleCreateCinemaChange(event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value={0}>Chọn rạp</option>
                                {createCinemas.map((cinema) => (
                                    <option
                                        key={`create-cinema-${cinema.cinemaId}`}
                                        value={cinema.cinemaId}
                                    >
                                        {cinema.cinemaName}
                                    </option>
                                ))}
                            </select>
                            {createForm.formState.errors.cinemaId && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.cinemaId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Loại phòng *
                            </label>
                            <select
                                value={Number(createForm.watch("roomTypeId") ?? 0)}
                                onChange={(event) =>
                                    createForm.setValue("roomTypeId", Number(event.target.value), {
                                        shouldValidate: true,
                                    })
                                }
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value={0}>Chọn loại phòng</option>
                                {createRoomTypes.map((roomType) => (
                                    <option
                                        key={`create-room-type-${roomType.roomTypeId}`}
                                        value={roomType.roomTypeId}
                                    >
                                        {roomType.roomTypeName}
                                    </option>
                                ))}
                            </select>
                            {createForm.formState.errors.roomTypeId && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {createForm.formState.errors.roomTypeId.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={createForm.formState.isSubmitting}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Tạo mới
                        </button>
                    </div>
                </form>
            </ModalShell>

            <ModalShell open={openEdit} onClose={closeEditModal} title="Sửa phòng">
                <form className="space-y-3" onSubmit={submitUpdate}>
                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-500">
                            Tên phòng *
                        </label>
                        <input
                            type="text"
                            {...editForm.register("roomName")}
                            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                        />
                        {editForm.formState.errors.roomName && (
                            <p className="mt-1 text-xs text-rose-500">
                                {editForm.formState.errors.roomName.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Capacity *
                            </label>
                            <input
                                type="number"
                                min={1}
                                {...editForm.register("capacity")}
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            />
                            {editForm.formState.errors.capacity && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.capacity.message}
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

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Tỉnh/Thành *
                            </label>
                            <select
                                value={Number(editForm.watch("provinceId") ?? 0)}
                                onChange={(event) =>
                                    void handleEditProvinceChange(event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value={0}>Chọn tỉnh/thành</option>
                                {provinces.map((province) => (
                                    <option
                                        key={`edit-province-${province.provinceId}`}
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
                                Rạp *
                            </label>
                            <select
                                value={Number(editForm.watch("cinemaId") ?? 0)}
                                onChange={(event) =>
                                    void handleEditCinemaChange(event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value={0}>Chọn rạp</option>
                                {editCinemas.map((cinema) => (
                                    <option
                                        key={`edit-cinema-${cinema.cinemaId}`}
                                        value={cinema.cinemaId}
                                    >
                                        {cinema.cinemaName}
                                    </option>
                                ))}
                            </select>
                            {editForm.formState.errors.cinemaId && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.cinemaId.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-500">
                                Loại phòng *
                            </label>
                            <select
                                value={Number(editForm.watch("roomTypeId") ?? 0)}
                                onChange={(event) =>
                                    editForm.setValue("roomTypeId", Number(event.target.value), {
                                        shouldValidate: true,
                                    })
                                }
                                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                            >
                                <option value={0}>Chọn loại phòng</option>
                                {editRoomTypes.map((roomType) => (
                                    <option
                                        key={`edit-room-type-${roomType.roomTypeId}`}
                                        value={roomType.roomTypeId}
                                    >
                                        {roomType.roomTypeName}
                                    </option>
                                ))}
                            </select>
                            {editForm.formState.errors.roomTypeId && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {editForm.formState.errors.roomTypeId.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={closeEditModal}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.formState.isSubmitting}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Lưu
                        </button>
                    </div>
                </form>
            </ModalShell>

            <ModalShell
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                title="Xóa phòng"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Bạn có chắc muốn xóa phòng <strong>{deleteTarget?.roomName ?? ""}</strong>?
                    </p>
                    <p className="text-xs text-rose-500">
                        Không thể xóa nếu còn ghế ACTIVE đang dùng phòng này.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={() => void handleDelete()}
                            className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </ModalShell>

            <RoomSeatManagerModal
                open={Boolean(seatManagingRoom)}
                room={seatManagingRoom}
                onClose={() => setSeatManagingRoom(null)}
            />
        </div>
    );
};

export default RoomManagement;
