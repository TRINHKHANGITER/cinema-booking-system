import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import axios from "axios";
import { toast } from "sonner";
import Close from "../../components/icon/close";
import ChoiceSeat from "../../components/ui/ChoiceSeat";
import { bookingService } from "../../services/booking.service";
import { checkoutService } from "../../services/checkout.service";
import { cinemaService } from "../../services/cinema.service";
import { comboService } from "../../services/combo.service";
import { movieService } from "../../services/movie.service";
import { orderService } from "../../services/order.service";
import { provinceService } from "../../services/province.service";
import { showTimeService } from "../../services/showtimeService";
import { userService } from "../../services/user.service";
import type { CinemaResponse } from "../../types/cinema";
import type { SelectedCombo } from "../../types/combo";
import type { Order, OrderDetail, OrderStatus } from "../../types/order";
import type { ProvinceResponse } from "../../types/province";
import type { Seat } from "../../types/seat";
import type { ShowTimeResponse } from "../../types/showtime";
import type { UserResponse } from "../../types/user";
import type { Movie } from "../../types/movie";
import {
    calculateTotalPrice,
    formatTime,
    groupSelectedSeats,
    resolveApiErrorMessage,
    resolveComboImage,
} from "../../utils/utils";

type ModalShellProps = {
    open: boolean;
    title: string;
    onClose: () => void;
    panelClassName?: string;
    children: ReactNode;
};

type WizardStep = 1 | 2 | 3 | 4 | 5;

const wizardLabels: Record<WizardStep, string> = {
    1: "Chọn khách hàng",
    2: "Chọn suất chiếu",
    3: "Chọn ghế",
    4: "Chọn combo",
    5: "Thanh toán",
};

const wizardOrder: WizardStep[] = [1, 2, 3, 4, 5];

const statusClassByOrderStatus: Record<OrderStatus, string> = {
    PAYING: "bg-amber-100 text-amber-700",
    PAID: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-slate-200 text-slate-700",
    REFUNDED: "bg-violet-100 text-violet-700",
    EXPIRED: "bg-rose-100 text-rose-700",
};

const defaultOrderStatuses: OrderStatus[] = ["PAYING", "PAID", "CANCELLED", "REFUNDED", "EXPIRED"];

const formatCountdown = (totalSeconds: number | null) => {
    if (totalSeconds === null) return "--:--:--";
    const safeSeconds = Math.max(0, totalSeconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;
    return [hours, minutes, seconds].map((unit) => String(unit).padStart(2, "0")).join(":");
};

const formatDateTime = (value?: string | null, fallback = "-") => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleString("vi-VN");
};

const formatCurrency = (value: number | null | undefined) => {
    const numeric = Number(value ?? 0);
    return `${numeric.toLocaleString("vi-VN")} đ`;
};

const parseApiErrorCode = (error: unknown) => {
    if (!axios.isAxiosError(error)) return undefined;
    const payload = error.response?.data as { code?: string } | undefined;
    return payload?.code;
};

const buildTemporaryPassword = () => {
    const randomPart = Math.random().toString(36).slice(2, 8);
    return `Temp@${randomPart}9`;
};

const mapOrderDetailToShowtime = (detail: OrderDetail): ShowTimeResponse => {
    const showTime = detail.showTime;
    return {
        showTimeId: showTime.showTimeId,
        releaseDate: showTime.releaseDate,
        startTime: showTime.startTime,
        endTime: showTime.endTime,
        status: "SELLING",
        roomId: showTime.roomId,
        movieId: showTime.movieId,
        movie: {
            movieId: showTime.movieId,
            movieName: showTime.movieName,
        } as ShowTimeResponse["movie"],
        room: {
            roomId: showTime.roomId,
            roomName: showTime.roomName,
            cinema: {
                cinemaId: showTime.cinemaId,
                cinemaName: showTime.cinemaName,
                province: {
                    provinceId: showTime.provinceId,
                    provinceName: showTime.provinceName,
                },
            },
        } as ShowTimeResponse["room"],
    } as ShowTimeResponse;
};

const mapOrderDetailToSeats = (detail: OrderDetail): Seat[] => {
    return [...detail.seats]
        .sort((first, second) => {
            if (first.seatRow === second.seatRow) {
                return first.seatColumn - second.seatColumn;
            }
            return first.seatRow.localeCompare(second.seatRow);
        })
        .map(
            (seat) =>
                ({
                    seatId: seat.seatId,
                    seatRow: seat.seatRow,
                    seatColumn: seat.seatColumn,
                    seatTypeId: seat.seatTypeId,
                    status: "ACTIVE",
                }) as Seat
        );
};

const mapOrderDetailToCombos = (detail: OrderDetail): SelectedCombo[] => {
    return detail.combos
        .filter((combo) => combo.status === "ACTIVE" && combo.quantity > 0)
        .map((combo) => ({
            comboId: combo.comboId,
            comboName: combo.comboName,
            image: combo.comboImage,
            description: null,
            price: combo.unitPrice,
            quantity: combo.quantity,
            status: "AVAILABLE",
        }));
};

const ModalShell = ({ open, title, onClose, panelClassName, children }: ModalShellProps) => {
    return (
        <div
            className={`fixed inset-0 z-[1000] grid h-screen w-screen place-items-center bg-black/45 px-4 transition-opacity duration-300 ${
                open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
        >
            <div
                className={`relative max-h-[94vh] w-full overflow-y-auto rounded-md bg-white px-6 py-6 shadow-2xl ${
                    panelClassName ?? "max-w-[1080px]"
                }`}
            >
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

const OrderManagement = () => {
    const [statuses, setStatuses] = useState<OrderStatus[]>(defaultOrderStatuses);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [customerNameInput, setCustomerNameInput] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [phoneInput, setPhoneInput] = useState("");
    const [showTimeIdInput, setShowTimeIdInput] = useState("");
    const [statusInput, setStatusInput] = useState<OrderStatus | "">("");

    const [filters, setFilters] = useState({
        customerName: "",
        email: "",
        phone: "",
        showTimeId: undefined as number | undefined,
        status: "" as OrderStatus | "",
        page: 1,
        size: 10,
    });

    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState<WizardStep>(1);
    const [selectedCustomer, setSelectedCustomer] = useState<UserResponse | null>(null);
    const [selectedShowtime, setSelectedShowtime] = useState<ShowTimeResponse | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [selectedCombos, setSelectedCombos] = useState<SelectedCombo[]>([]);
    const [orderId, setOrderId] = useState<number | null>(null);
    const [orderExpiredAt, setOrderExpiredAt] = useState<string | null>(null);
    const [holdRemainingSeconds, setHoldRemainingSeconds] = useState<number | null>(null);
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    const [customerKeyword, setCustomerKeyword] = useState("");
    const [customerPage, setCustomerPage] = useState(1);
    const [customerSize, setCustomerSize] = useState(8);
    const [customerResults, setCustomerResults] = useState<UserResponse[]>([]);
    const [customerTotalItems, setCustomerTotalItems] = useState(0);
    const [customerTotalPages, setCustomerTotalPages] = useState(1);
    const [isCustomerLoading, setIsCustomerLoading] = useState(false);
    const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
    });

    const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
    const [cinemas, setCinemas] = useState<CinemaResponse[]>([]);
    const [showtimeKeyword, setShowtimeKeyword] = useState("");
    const [showtimeProvinceId, setShowtimeProvinceId] = useState<number | "">("");
    const [showtimeCinemaId, setShowtimeCinemaId] = useState<number | "">("");
    const [showtimeDate, setShowtimeDate] = useState("");
    const [showtimeTime, setShowtimeTime] = useState("");
    const [showtimePage, setShowtimePage] = useState(1);
    const [showtimeSize, setShowtimeSize] = useState(8);
    const [showtimeResults, setShowtimeResults] = useState<ShowTimeResponse[]>([]);
    const [showtimeTotalItems, setShowtimeTotalItems] = useState(0);
    const [showtimeTotalPages, setShowtimeTotalPages] = useState(1);
    const [isShowtimeLoading, setIsShowtimeLoading] = useState(false);

    const [comboKeyword, setComboKeyword] = useState("");
    const [comboPage, setComboPage] = useState(1);
    const [comboSize, setComboSize] = useState(8);
    const [comboResults, setComboResults] = useState<SelectedCombo[]>([]);
    const [comboTotalItems, setComboTotalItems] = useState(0);
    const [comboTotalPages, setComboTotalPages] = useState(1);
    const [isComboLoading, setIsComboLoading] = useState(false);

    const [detailOrder, setDetailOrder] = useState<OrderDetail | null>(null);
    const [detailTargetId, setDetailTargetId] = useState<number | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const [statusTargetOrder, setStatusTargetOrder] = useState<Order | null>(null);
    const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [resumingOrderId, setResumingOrderId] = useState<number | null>(null);

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

    const selectedSeatGroups = useMemo(() => groupSelectedSeats(selectedSeats), [selectedSeats]);

    const availableStatusTransitions = useMemo<OrderStatus[]>(() => {
        if (!statusTargetOrder) return [];
        if (statusTargetOrder.status === "PAID") {
            return ["CANCELLED", "REFUNDED"];
        }
        if (statusTargetOrder.status === "CANCELLED") {
            return ["REFUNDED"];
        }
        return [];
    }, [statusTargetOrder]);

    const selectedComboCount = useMemo(
        () => selectedCombos.reduce((sum, combo) => sum + combo.quantity, 0),
        [selectedCombos]
    );

    const loadStatuses = useCallback(async () => {
        try {
            const response = await orderService.getAllOrderStatuses();
            const items = response.result?.items ?? defaultOrderStatuses;
            setStatuses(items.length > 0 ? items : defaultOrderStatuses);
        } catch {
            setStatuses(defaultOrderStatuses);
        }
    }, []);

    const loadProvinces = useCallback(async () => {
        try {
            const response = await provinceService.getProvinceItemList("ACTIVE");
            setProvinces(response.result?.items ?? []);
        } catch {
            setProvinces([]);
        }
    }, []);

    const loadCinemas = useCallback(async (provinceId?: number) => {
        try {
            const response = await cinemaService.getCinemaItemList({
                provinceId,
                status: "ACTIVE",
            });
            setCinemas(response.result?.items ?? []);
        } catch {
            setCinemas([]);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            setIsLoadingOrders(true);
            const response = await orderService.filterOrders({
                customerName: filters.customerName,
                email: filters.email,
                phone: filters.phone,
                showTimeId: filters.showTimeId,
                status: filters.status,
                page: filters.page,
                size: filters.size,
            });

            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Không thể tải danh sách đơn hàng");
                setOrders([]);
                setTotalItems(0);
                setTotalPages(1);
                return;
            }

            const result = response.result;
            if (!result) {
                setOrders([]);
                setTotalItems(0);
                setTotalPages(1);
                return;
            }

            setOrders(result.items ?? []);
            setTotalItems(result.totalItems ?? 0);
            setTotalPages(Math.max(1, result.totalPages ?? 1));
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tải danh sách đơn hàng"));
            setOrders([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setIsLoadingOrders(false);
        }
    }, [filters]);

    const fetchCustomers = useCallback(async () => {
        try {
            setIsCustomerLoading(true);
            const response = await userService.filterUsers({
                name: customerKeyword.trim() || undefined,
                role: "USER",
                status: "ACTIVE",
                page: customerPage,
                size: customerSize,
            });

            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Không thể tìm khách hàng");
                setCustomerResults([]);
                setCustomerTotalItems(0);
                setCustomerTotalPages(1);
                return;
            }

            const result = response.result;
            if (!result) {
                setCustomerResults([]);
                setCustomerTotalItems(0);
                setCustomerTotalPages(1);
                return;
            }

            setCustomerResults(result.items ?? []);
            setCustomerTotalItems(result.totalItems ?? 0);
            setCustomerTotalPages(Math.max(1, result.totalPages ?? 1));
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tìm khách hàng"));
            setCustomerResults([]);
            setCustomerTotalItems(0);
            setCustomerTotalPages(1);
        } finally {
            setIsCustomerLoading(false);
        }
    }, [customerKeyword, customerPage, customerSize]);

    const fetchShowtimes = useCallback(async () => {
        try {
            setIsShowtimeLoading(true);
            const response = await showTimeService.getShowTimesByFilters({
                movieName: showtimeKeyword.trim() || undefined,
                provinceId: showtimeProvinceId === "" ? undefined : Number(showtimeProvinceId),
                cinemaId: showtimeCinemaId === "" ? undefined : Number(showtimeCinemaId),
                releaseDate: showtimeDate || undefined,
                status: "SELLING",
                page: showtimePage,
                size: showtimeSize,
                sortBy: "showtime",
                direction: "ASC",
            });

            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Không thể tìm suất chiếu");
                setShowtimeResults([]);
                setShowtimeTotalItems(0);
                setShowtimeTotalPages(1);
                return;
            }

            const result = response.result;
            if (!result) {
                setShowtimeResults([]);
                setShowtimeTotalItems(0);
                setShowtimeTotalPages(1);
                return;
            }

            const mappedItems = (result.items ?? []).filter((showtime) => {
                if (!showtimeTime) return true;
                return formatTime(showtime.startTime).startsWith(showtimeTime);
            });

            const uniqueMovieIds = Array.from(
                new Set(
                    mappedItems
                        .map((item) => item.movieId)
                        .filter((movieId): movieId is number => Number.isInteger(movieId))
                )
            );

            const movieById = new Map<number, Movie>();
            if (uniqueMovieIds.length > 0) {
                const movieResponses = await Promise.all(
                    uniqueMovieIds.map(async (movieId) => {
                        try {
                            return await movieService.getMovieByIdAndStatus(movieId);
                        } catch {
                            return null;
                        }
                    })
                );

                movieResponses.forEach((movieResponse, index) => {
                    if (movieResponse?.code === "SUCCESS" && movieResponse.result) {
                        movieById.set(uniqueMovieIds[index], movieResponse.result);
                    }
                });
            }

            const hydratedShowtimes = mappedItems.map((item) => ({
                ...item,
                movie: movieById.get(item.movieId) ?? item.movie,
            }));

            setShowtimeResults(hydratedShowtimes);
            setShowtimeTotalItems(result.totalItems ?? 0);
            setShowtimeTotalPages(Math.max(1, result.totalPages ?? 1));
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tìm suất chiếu"));
            setShowtimeResults([]);
            setShowtimeTotalItems(0);
            setShowtimeTotalPages(1);
        } finally {
            setIsShowtimeLoading(false);
        }
    }, [
        showtimeKeyword,
        showtimeProvinceId,
        showtimeCinemaId,
        showtimeDate,
        showtimeTime,
        showtimePage,
        showtimeSize,
    ]);

    const fetchCombos = useCallback(async () => {
        try {
            setIsComboLoading(true);
            const response = await comboService.filterCombos({
                name: comboKeyword.trim() || undefined,
                status: "AVAILABLE",
                page: comboPage,
                size: comboSize,
            });

            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Không thể tải danh sách combo");
                setComboResults([]);
                setComboTotalItems(0);
                setComboTotalPages(1);
                return;
            }

            const result = response.result;
            if (!result) {
                setComboResults([]);
                setComboTotalItems(0);
                setComboTotalPages(1);
                return;
            }

            setComboResults(
                (result.items ?? []).map((combo) => ({
                    ...combo,
                    quantity: 0,
                }))
            );
            setComboTotalItems(result.totalItems ?? 0);
            setComboTotalPages(Math.max(1, result.totalPages ?? 1));
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tải danh sách combo"));
            setComboResults([]);
            setComboTotalItems(0);
            setComboTotalPages(1);
        } finally {
            setIsComboLoading(false);
        }
    }, [comboKeyword, comboPage, comboSize]);

    useEffect(() => {
        void loadStatuses();
        void loadProvinces();
        void loadCinemas(undefined);
    }, [loadCinemas, loadProvinces, loadStatuses]);

    useEffect(() => {
        void fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        if (!isWizardOpen || wizardStep !== 1) return;
        void fetchCustomers();
    }, [fetchCustomers, isWizardOpen, wizardStep]);

    useEffect(() => {
        if (!isWizardOpen || wizardStep !== 2) return;
        void fetchShowtimes();
    }, [fetchShowtimes, isWizardOpen, wizardStep]);

    useEffect(() => {
        if (!isWizardOpen || wizardStep !== 4) return;
        void fetchCombos();
    }, [fetchCombos, isWizardOpen, wizardStep]);

    useEffect(() => {
        if (!orderExpiredAt) {
            setHoldRemainingSeconds(null);
            return;
        }

        const expiredAtMs = new Date(orderExpiredAt).getTime();
        if (Number.isNaN(expiredAtMs)) {
            setHoldRemainingSeconds(null);
            return;
        }

        const updateRemaining = () => {
            const remainingSeconds = Math.max(0, Math.ceil((expiredAtMs - Date.now()) / 1000));
            setHoldRemainingSeconds(remainingSeconds);
        };

        updateRemaining();
        const timer = setInterval(updateRemaining, 1000);
        return () => clearInterval(timer);
    }, [orderExpiredAt]);

    useEffect(() => {
        if (!orderExpiredAt) return;

        const expiredAtMs = new Date(orderExpiredAt).getTime();
        if (Number.isNaN(expiredAtMs)) return;

        const timer = setInterval(() => {
            if (Date.now() < expiredAtMs) return;

            toast.error("Đơn giữ ghế đã hết hạn, vui lòng chọn lại ghế.");
            setOrderId(null);
            setOrderExpiredAt(null);
            setSelectedSeats([]);
            setSelectedCombos([]);
            setWizardStep(3);
        }, 1000);

        return () => clearInterval(timer);
    }, [orderExpiredAt]);

    const resetWizardState = useCallback(() => {
        setWizardStep(1);
        setSelectedCustomer(null);
        setSelectedShowtime(null);
        setSelectedSeats([]);
        setSelectedCombos([]);
        setOrderId(null);
        setOrderExpiredAt(null);
        setHoldRemainingSeconds(null);

        setCustomerKeyword("");
        setCustomerPage(1);
        setIsCreateCustomerOpen(false);
        setNewCustomer({
            fullName: "",
            email: "",
            phoneNumber: "",
        });

        setShowtimeKeyword("");
        setShowtimeProvinceId("");
        setShowtimeCinemaId("");
        setShowtimeDate("");
        setShowtimeTime("");
        setShowtimePage(1);

        setComboKeyword("");
        setComboPage(1);
    }, []);

    const releaseCurrentPayingOrder = useCallback(async () => {
        if (!orderId) return;
        try {
            await bookingService.cancelOrder(orderId);
        } catch {
            // Ignore, order may already be expired/paid/cancelled.
        }
    }, [orderId]);

    const closeWizard = useCallback(async () => {
        await releaseCurrentPayingOrder();
        resetWizardState();
        setIsWizardOpen(false);
    }, [releaseCurrentPayingOrder, resetWizardState]);

    const closeWizardWithConfirm = useCallback(async () => {
        const shouldClose = window.confirm("Bạn có chắc muốn hủy đặt chỗ và đóng tạo đơn không?");
        if (!shouldClose) return;
        await closeWizard();
    }, [closeWizard]);

    const applyFilters = () => {
        setFilters((prev) => ({
            ...prev,
            customerName: customerNameInput.trim(),
            email: emailInput.trim(),
            phone: phoneInput.trim(),
            showTimeId: showTimeIdInput.trim() ? Number(showTimeIdInput.trim()) : undefined,
            status: statusInput,
            page: 1,
        }));
    };

    const resetFilters = () => {
        setCustomerNameInput("");
        setEmailInput("");
        setPhoneInput("");
        setShowTimeIdInput("");
        setStatusInput("");
        setFilters((prev) => ({
            ...prev,
            customerName: "",
            email: "",
            phone: "",
            showTimeId: undefined,
            status: "",
            page: 1,
        }));
    };

    const openWizard = () => {
        resetWizardState();
        setIsWizardOpen(true);
    };

    const continuePayingOrder = async (targetOrder: Order) => {
        if (targetOrder.status !== "PAYING") {
            toast.error("Chỉ có thể tiếp tục với đơn đang ở trạng thái PAYING.");
            return;
        }

        try {
            setResumingOrderId(targetOrder.orderId);
            const response = await orderService.getOrderDetailByOrderId(targetOrder.orderId);
            if (response.code !== "SUCCESS" || !response.result) {
                toast.error(response.message || "Không thể tải thông tin đơn để tiếp tục.");
                return;
            }

            const detail = response.result;
            if (detail.status !== "PAYING") {
                toast.error("Đơn hàng không còn ở trạng thái PAYING.");
                await fetchOrders();
                return;
            }

            if (!detail.user) {
                toast.error("Không tìm thấy thông tin khách hàng của đơn này.");
                return;
            }

            resetWizardState();
            setSelectedCustomer(detail.user);
            setSelectedShowtime(mapOrderDetailToShowtime(detail));
            setSelectedSeats(mapOrderDetailToSeats(detail));
            setSelectedCombos(mapOrderDetailToCombos(detail));
            setOrderId(detail.orderId);
            setOrderExpiredAt(detail.expiredAt ?? null);
            setWizardStep(3);
            setIsWizardOpen(true);
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tiếp tục đơn hàng này"));
        } finally {
            setResumingOrderId(null);
        }
    };

    const selectCustomer = async (customer: UserResponse) => {
        if (orderId) {
            await releaseCurrentPayingOrder();
            setOrderId(null);
            setOrderExpiredAt(null);
            setSelectedSeats([]);
            setSelectedCombos([]);
        }
        setSelectedCustomer(customer);
    };

    const createCustomer = async () => {
        if (
            !newCustomer.fullName.trim() ||
            !newCustomer.email.trim() ||
            !newCustomer.phoneNumber.trim()
        ) {
            toast.error("Vui lòng nhập đủ họ tên, email, số điện thoại.");
            return;
        }

        try {
            setIsCreatingCustomer(true);
            const response = await userService.createUserByAdmin({
                fullName: newCustomer.fullName.trim(),
                email: newCustomer.email.trim(),
                phoneNumber: newCustomer.phoneNumber.trim(),
                password: buildTemporaryPassword(),
                role: "USER",
                status: "ACTIVE",
                dateOfBirth: null,
                sex: null,
            });

            if (response.code !== "SUCCESS" || !response.result) {
                toast.error(response.message || "Không thể tạo khách hàng");
                return;
            }

            toast.success("Tạo khách hàng thành công");
            setSelectedCustomer(response.result);
            setIsCreateCustomerOpen(false);
            setNewCustomer({
                fullName: "",
                email: "",
                phoneNumber: "",
            });
            setCustomerPage(1);
            await fetchCustomers();
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tạo khách hàng"));
        } finally {
            setIsCreatingCustomer(false);
        }
    };

    const changeShowtimeProvince = async (value: string) => {
        const nextProvinceId = value ? Number(value) : "";
        setShowtimeProvinceId(nextProvinceId);
        setShowtimeCinemaId("");
        await loadCinemas(nextProvinceId === "" ? undefined : Number(nextProvinceId));
    };

    const selectShowtime = async (showtime: ShowTimeResponse) => {
        if (orderId) {
            await releaseCurrentPayingOrder();
            setOrderId(null);
            setOrderExpiredAt(null);
            setSelectedSeats([]);
            setSelectedCombos([]);
        }
        setSelectedShowtime(showtime);
    };

    const adjustComboQuantity = (combo: SelectedCombo, delta: number) => {
        const currentItem = selectedCombos.find((item) => item.comboId === combo.comboId);
        const currentQuantity = currentItem?.quantity ?? 0;
        const nextQuantity = Math.max(0, currentQuantity + delta);

        if (nextQuantity === 0) {
            setSelectedCombos((prev) => prev.filter((item) => item.comboId !== combo.comboId));
            return;
        }

        if (currentItem) {
            setSelectedCombos((prev) =>
                prev.map((item) =>
                    item.comboId === combo.comboId ? { ...item, quantity: nextQuantity } : item
                )
            );
            return;
        }

        setSelectedCombos((prev) => [
            ...prev,
            {
                comboId: combo.comboId,
                comboName: combo.comboName,
                image: combo.image,
                description: combo.description,
                price: combo.price,
                status: combo.status,
                quantity: nextQuantity,
            },
        ]);
    };

    const handleOrderExpired = useCallback(() => {
        setOrderId(null);
        setOrderExpiredAt(null);
        setSelectedSeats([]);
        setSelectedCombos([]);
        setWizardStep(3);
    }, []);

    const syncCombosToOrder = useCallback(async () => {
        if (!orderId) return false;

        try {
            await bookingService.updateOrderCombos(orderId, {
                combos: selectedCombos
                    .filter((combo) => combo.quantity > 0)
                    .map((combo) => ({
                        comboId: combo.comboId,
                        quantity: combo.quantity,
                    })),
            });
            return true;
        } catch (error) {
            const errorCode = parseApiErrorCode(error);
            if (
                errorCode === "ORDER_EXPIRED" ||
                errorCode === "ORDER_STATUS_INVALID" ||
                errorCode === "ORDER_NOT_FOUND"
            ) {
                toast.error("Đơn giữ ghế đã hết hạn, vui lòng chọn lại ghế.");
                handleOrderExpired();
                return false;
            }

            toast.error(resolveApiErrorMessage(error, "Không thể cập nhật combo cho đơn hàng"));
            return false;
        }
    }, [handleOrderExpired, orderId, selectedCombos]);

    const createCheckout = useCallback(async () => {
        if (!orderId) return null;

        try {
            const response = await checkoutService.createCheckout({ orderId });
            return response.result ?? null;
        } catch (error) {
            const errorCode = parseApiErrorCode(error);
            if (
                errorCode === "ORDER_EXPIRED" ||
                errorCode === "ORDER_STATUS_INVALID" ||
                errorCode === "ORDER_NOT_FOUND"
            ) {
                toast.error("Đơn giữ ghế đã hết hạn, vui lòng chọn lại ghế.");
                handleOrderExpired();
                return null;
            }

            toast.error(resolveApiErrorMessage(error, "Không thể tạo giao dịch thanh toán"));
            return null;
        }
    }, [handleOrderExpired, orderId]);

    const startCheckout = async () => {
        if (!orderId) return;
        if (orderExpiredAt && new Date(orderExpiredAt).getTime() <= Date.now()) {
            toast.error("Đơn giữ ghế đã hết hạn, vui lòng chọn lại ghế.");
            handleOrderExpired();
            return;
        }

        try {
            setIsCheckoutLoading(true);
            const synced = await syncCombosToOrder();
            if (!synced) return;

            const paymentUrl = await createCheckout();
            if (!paymentUrl) return;

            sessionStorage.setItem(
                "ORDER_CHECKOUT_CONTEXT",
                JSON.stringify({ source: "ADMIN", orderId })
            );
            window.location.href = paymentUrl;
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    const goNextWizardStep = async () => {
        if (wizardStep === 1) {
            if (!selectedCustomer) {
                toast.error("Vui lòng chọn khách hàng.");
                return;
            }
            setWizardStep(2);
            return;
        }

        if (wizardStep === 2) {
            if (!selectedShowtime) {
                toast.error("Vui lòng chọn suất chiếu.");
                return;
            }
            setWizardStep(3);
            return;
        }

        if (wizardStep === 3) {
            if (!orderId || selectedSeats.length === 0) {
                toast.error("Vui lòng chọn ghế để tiếp tục.");
                return;
            }
            setWizardStep(4);
            return;
        }

        if (wizardStep === 4) {
            const synced = await syncCombosToOrder();
            if (!synced) return;
            setWizardStep(5);
            return;
        }

        await startCheckout();
    };

    const goBackWizardStep = () => {
        if (wizardStep === 1) return;
        setWizardStep((prev) => Math.max(1, prev - 1) as WizardStep);
    };

    const openOrderDetail = async (targetOrderId: number) => {
        try {
            setDetailTargetId(targetOrderId);
            setIsDetailLoading(true);
            const response = await orderService.getOrderDetailByOrderId(targetOrderId);
            if (response.code !== "SUCCESS" || !response.result) {
                toast.error(response.message || "Không thể tải chi tiết đơn hàng");
                setDetailOrder(null);
                return;
            }
            setDetailOrder(response.result);
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể tải chi tiết đơn hàng"));
            setDetailOrder(null);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const closeOrderDetail = () => {
        setDetailTargetId(null);
        setDetailOrder(null);
        setIsDetailLoading(false);
    };

    const openStatusModal = (order: Order) => {
        setStatusTargetOrder(order);
        if (order.status === "PAID") {
            setNextStatus("CANCELLED");
            return;
        }
        if (order.status === "CANCELLED") {
            setNextStatus("REFUNDED");
            return;
        }
        setNextStatus("");
    };

    const closeStatusModal = () => {
        setStatusTargetOrder(null);
        setNextStatus("");
        setIsUpdatingStatus(false);
    };

    const updateOrderStatus = async () => {
        if (!statusTargetOrder || !nextStatus) return;

        try {
            setIsUpdatingStatus(true);
            const response = await orderService.updateOrderStatus(statusTargetOrder.orderId, {
                status: nextStatus,
            });

            if (response.code !== "SUCCESS") {
                toast.error(response.message || "Không thể cập nhật trạng thái đơn");
                return;
            }

            toast.success("Cập nhật trạng thái đơn thành công");
            closeStatusModal();
            await fetchOrders();
            if (detailTargetId && detailTargetId === statusTargetOrder.orderId) {
                await openOrderDetail(detailTargetId);
            }
        } catch (error) {
            toast.error(resolveApiErrorMessage(error, "Không thể cập nhật trạng thái đơn"));
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--glx-border)] bg-white p-5 shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)] sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[var(--glx-blue)]">
                            Quản trị đơn hàng
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-800">Quản lý đơn hàng</h2>
                        <p className="mt-2 text-sm text-[var(--glx-text-muted)]">
                            Tìm kiếm đơn theo khách hàng, suất chiếu, trạng thái và tạo đơn mới theo
                            luồng đặt vé.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={openWizard}
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--glx-orange)] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--glx-orange-soft)]"
                    >
                        + Tạo đơn hàng
                    </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[1.1fr_1fr_1fr_0.8fr_0.9fr_auto_auto]">
                    <input
                        value={customerNameInput}
                        onChange={(event) => setCustomerNameInput(event.target.value)}
                        type="text"
                        placeholder="Tên khách hàng"
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />
                    <input
                        value={emailInput}
                        onChange={(event) => setEmailInput(event.target.value)}
                        type="text"
                        placeholder="Email"
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />
                    <input
                        value={phoneInput}
                        onChange={(event) => setPhoneInput(event.target.value)}
                        type="text"
                        placeholder="Số điện thoại"
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />
                    <input
                        value={showTimeIdInput}
                        onChange={(event) => setShowTimeIdInput(event.target.value)}
                        type="text"
                        placeholder="Showtime ID"
                        className="h-11 rounded-xl border border-[var(--glx-border)] bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/15"
                    />
                    <select
                        value={statusInput}
                        onChange={(event) => setStatusInput(event.target.value as OrderStatus | "")}
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
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-all duration-300 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                    >
                        Đặt lại
                    </button>
                </div>
            </section>

            <section className="rounded-2xl border border-[var(--glx-border)] bg-white shadow-[0_18px_42px_-35px_rgba(15,23,42,0.5)]">
                <div className="flex flex-col gap-3 border-b border-[var(--glx-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <h3 className="text-lg font-bold text-slate-800">Danh sách đơn hàng</h3>
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
                                <th className="px-6 py-3 font-bold text-slate-600">Mã đơn</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Khách hàng</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Liên hệ</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Suất chiếu</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Tổng tiền</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Trạng thái</th>
                                <th className="px-6 py-3 font-bold text-slate-600">Tạo lúc</th>
                                <th className="px-6 py-3 text-right font-bold text-slate-600">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glx-border)]">
                            {isLoadingOrders ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-10 text-center text-slate-500"
                                    >
                                        Đang tải đơn hàng...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-10 text-center text-slate-500"
                                    >
                                        Không tìm thấy đơn hàng
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr
                                        key={order.orderId}
                                        className="bg-white hover:bg-slate-50/80"
                                    >
                                        <td className="px-6 py-4 font-semibold text-slate-700">
                                            #{order.orderId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-700">
                                                {order.user?.fullName ?? "Khách vãng lai"}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                User ID: {order.userId ?? "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div>{order.user?.email ?? "-"}</div>
                                            <div>{order.user?.phoneNumber ?? "-"}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            ShowTime #{order.showTimeId}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-700">
                                            {formatCurrency(order.netAmount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                    statusClassByOrderStatus[order.status]
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {formatDateTime(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void openOrderDetail(order.orderId)
                                                    }
                                                    className="rounded-md border border-[var(--glx-blue)] px-3 py-1.5 text-xs font-semibold text-[var(--glx-blue)] transition hover:bg-[var(--glx-blue)] hover:text-white"
                                                >
                                                    Chi tiết
                                                </button>
                                                {(order.status === "PAID" ||
                                                    order.status === "CANCELLED") && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openStatusModal(order)}
                                                        className="rounded-md border border-[var(--glx-orange)] px-3 py-1.5 text-xs font-semibold text-[var(--glx-orange)] transition hover:bg-[var(--glx-orange)] hover:text-white"
                                                    >
                                                        Đổi trạng thái
                                                    </button>
                                                )}
                                                {order.status === "PAYING" && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            void continuePayingOrder(order)
                                                        }
                                                        disabled={resumingOrderId === order.orderId}
                                                        className="rounded-md border border-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {resumingOrderId === order.orderId
                                                            ? "Đang mở..."
                                                            : "Tiếp tục"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-center gap-2 border-t border-[var(--glx-border)] px-6 py-4">
                    <button
                        type="button"
                        onClick={() =>
                            setFilters((prev) => ({
                                ...prev,
                                page: Math.max(1, prev.page - 1),
                            }))
                        }
                        disabled={filters.page === 1 || isLoadingOrders}
                        className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-sm text-slate-600 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                    >
                        Trước
                    </button>

                    {visiblePages.map((page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() =>
                                setFilters((prev) => ({
                                    ...prev,
                                    page,
                                }))
                            }
                            className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-all duration-300 ${
                                page === filters.page
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
                        disabled={filters.page >= totalPages || isLoadingOrders}
                        className="rounded-md border border-[var(--glx-border)] px-3 py-1.5 text-sm text-slate-600 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                    >
                        Tiếp
                    </button>
                </div>
            </section>

            <ModalShell
                open={isWizardOpen}
                onClose={() => {
                    void closeWizardWithConfirm();
                }}
                title="Tạo đơn hàng mới"
                panelClassName="max-w-[1300px]"
            >
                <div className="space-y-4">
                    <div className="overflow-x-auto">
                        <div className="flex min-w-[760px] items-center gap-3">
                            {wizardOrder.map((step) => {
                                const isActive = step === wizardStep;
                                const isDone = step < wizardStep;
                                return (
                                    <div key={step} className="flex flex-1 items-center gap-2">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                                isDone || isActive
                                                    ? "bg-[var(--glx-blue)] text-white"
                                                    : "bg-slate-200 text-slate-500"
                                            }`}
                                        >
                                            {step}
                                        </div>
                                        <div className="text-sm font-semibold text-slate-700">
                                            {wizardLabels[step]}
                                        </div>
                                        {step !== wizardOrder[wizardOrder.length - 1] && (
                                            <div className="h-[2px] flex-1 bg-slate-200" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {orderExpiredAt && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-700">
                            Thời gian giữ chỗ còn lại: {formatCountdown(holdRemainingSeconds)}
                        </div>
                    )}

                    {wizardStep === 1 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.8fr_auto_auto]">
                                <input
                                    value={customerKeyword}
                                    onChange={(event) => setCustomerKeyword(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            setCustomerPage(1);
                                            void fetchCustomers();
                                        }
                                    }}
                                    type="text"
                                    placeholder="Tìm khách theo tên / email / số điện thoại"
                                    className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomerPage(1);
                                        void fetchCustomers();
                                    }}
                                    className="h-10 rounded-md bg-[var(--glx-blue)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--glx-blue-strong)]"
                                >
                                    Tìm
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreateCustomerOpen((prev) => !prev)}
                                    className="h-10 rounded-md border border-[var(--glx-orange)] px-4 text-sm font-semibold text-[var(--glx-orange)] transition hover:bg-[var(--glx-orange)] hover:text-white"
                                >
                                    {isCreateCustomerOpen ? "Đóng thêm mới" : "Thêm khách mới"}
                                </button>
                            </div>

                            {isCreateCustomerOpen && (
                                <div className="grid grid-cols-1 gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
                                    <input
                                        value={newCustomer.fullName}
                                        onChange={(event) =>
                                            setNewCustomer((prev) => ({
                                                ...prev,
                                                fullName: event.target.value,
                                            }))
                                        }
                                        placeholder="Họ tên"
                                        type="text"
                                        className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[var(--glx-blue)]"
                                    />
                                    <input
                                        value={newCustomer.email}
                                        onChange={(event) =>
                                            setNewCustomer((prev) => ({
                                                ...prev,
                                                email: event.target.value,
                                            }))
                                        }
                                        placeholder="Email"
                                        type="email"
                                        className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[var(--glx-blue)]"
                                    />
                                    <input
                                        value={newCustomer.phoneNumber}
                                        onChange={(event) =>
                                            setNewCustomer((prev) => ({
                                                ...prev,
                                                phoneNumber: event.target.value,
                                            }))
                                        }
                                        placeholder="Số điện thoại"
                                        type="text"
                                        className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-[var(--glx-blue)]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => void createCustomer()}
                                        disabled={isCreatingCustomer}
                                        className="h-10 rounded-md bg-[var(--glx-orange)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Tạo khách
                                    </button>
                                </div>
                            )}

                            <div className="overflow-x-auto rounded-md border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-4 py-2 font-semibold text-slate-600">
                                                Họ tên
                                            </th>
                                            <th className="px-4 py-2 font-semibold text-slate-600">
                                                Email
                                            </th>
                                            <th className="px-4 py-2 font-semibold text-slate-600">
                                                SĐT
                                            </th>
                                            <th className="px-4 py-2 text-right font-semibold text-slate-600">
                                                Chọn
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {isCustomerLoading ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-6 text-center text-slate-500"
                                                >
                                                    Đang tải khách hàng...
                                                </td>
                                            </tr>
                                        ) : customerResults.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-4 py-6 text-center text-slate-500"
                                                >
                                                    Không tìm thấy khách hàng
                                                </td>
                                            </tr>
                                        ) : (
                                            customerResults.map((customer) => (
                                                <tr
                                                    key={customer.userId}
                                                    className={
                                                        selectedCustomer?.userId === customer.userId
                                                            ? "bg-blue-50"
                                                            : "hover:bg-slate-50"
                                                    }
                                                >
                                                    <td className="px-4 py-3 text-slate-700">
                                                        {customer.fullName}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {customer.email}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {customer.phoneNumber}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void selectCustomer(customer)
                                                            }
                                                            className="rounded-md border border-[var(--glx-blue)] px-3 py-1 text-xs font-semibold text-[var(--glx-blue)] transition hover:bg-[var(--glx-blue)] hover:text-white"
                                                        >
                                                            {selectedCustomer?.userId ===
                                                            customer.userId
                                                                ? "Đã chọn"
                                                                : "Chọn"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Tổng khách: {customerTotalItems}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCustomerPage((prev) => Math.max(1, prev - 1))
                                        }
                                        disabled={customerPage === 1 || isCustomerLoading}
                                        className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40"
                                    >
                                        Trước
                                    </button>
                                    <span>
                                        Trang {customerPage}/{customerTotalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCustomerPage((prev) =>
                                                Math.min(customerTotalPages, prev + 1)
                                            )
                                        }
                                        disabled={
                                            customerPage >= customerTotalPages || isCustomerLoading
                                        }
                                        className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40"
                                    >
                                        Tiếp
                                    </button>
                                    <select
                                        value={customerSize}
                                        onChange={(event) => {
                                            setCustomerSize(Number(event.target.value));
                                            setCustomerPage(1);
                                        }}
                                        className="rounded-md border border-slate-200 px-2 py-1"
                                    >
                                        {[5, 8, 10, 20].map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {wizardStep === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_auto]">
                                <input
                                    value={showtimeKeyword}
                                    onChange={(event) => setShowtimeKeyword(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            setShowtimePage(1);
                                            void fetchShowtimes();
                                        }
                                    }}
                                    type="text"
                                    placeholder="Tên phim"
                                    className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                                />
                                <select
                                    value={showtimeProvinceId}
                                    onChange={(event) => {
                                        void changeShowtimeProvince(event.target.value);
                                    }}
                                    className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                                >
                                    <option value="">Tất cả tỉnh/thành</option>
                                    {provinces.map((province) => (
                                        <option
                                            key={province.provinceId}
                                            value={province.provinceId}
                                        >
                                            {province.provinceName}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={showtimeCinemaId}
                                    onChange={(event) =>
                                        setShowtimeCinemaId(
                                            event.target.value ? Number(event.target.value) : ""
                                        )
                                    }
                                    className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                                >
                                    <option value="">Tất cả rạp</option>
                                    {cinemas.map((cinema) => (
                                        <option key={cinema.cinemaId} value={cinema.cinemaId}>
                                            {cinema.cinemaName}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    value={showtimeDate}
                                    onChange={(event) => setShowtimeDate(event.target.value)}
                                    type="date"
                                    className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                                />
                                <input
                                    value={showtimeTime}
                                    onChange={(event) => setShowtimeTime(event.target.value)}
                                    type="time"
                                    className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowtimePage(1);
                                        void fetchShowtimes();
                                    }}
                                    className="h-10 rounded-md bg-[var(--glx-blue)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--glx-blue-strong)]"
                                >
                                    Tìm
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-md border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead className="bg-slate-50 text-left">
                                        <tr>
                                            <th className="px-4 py-2 font-semibold text-slate-600">
                                                Phim
                                            </th>
                                            <th className="px-4 py-2 font-semibold text-slate-600">
                                                Rạp
                                            </th>
                                            <th className="px-4 py-2 font-semibold text-slate-600">
                                                Tỉnh/thành
                                            </th>
                                            <th className="px-4 py-2 font-semibold text-slate-600">
                                                Ngày
                                            </th>
                                            <th className="px-4 py-2 font-semibold text-slate-600">
                                                Giờ
                                            </th>
                                            <th className="px-4 py-2 font-semibold text-slate-600">
                                                Phòng
                                            </th>
                                            <th className="px-4 py-2 text-right font-semibold text-slate-600">
                                                Chọn
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {isShowtimeLoading ? (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-4 py-6 text-center text-slate-500"
                                                >
                                                    Đang tải suất chiếu...
                                                </td>
                                            </tr>
                                        ) : showtimeResults.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-4 py-6 text-center text-slate-500"
                                                >
                                                    Không tìm thấy suất chiếu
                                                </td>
                                            </tr>
                                        ) : (
                                            showtimeResults.map((showtime) => (
                                                <tr
                                                    key={showtime.showTimeId}
                                                    className={
                                                        selectedShowtime?.showTimeId ===
                                                        showtime.showTimeId
                                                            ? "bg-blue-50"
                                                            : "hover:bg-slate-50"
                                                    }
                                                >
                                                    <td className="px-4 py-3 text-slate-700">
                                                        {showtime.movie?.movieName ?? "-"}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {showtime.room?.cinema?.cinemaName ?? "-"}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {showtime.room?.cinema?.province
                                                            ?.provinceName ??
                                                            showtime.room?.cinema?.provinceName ??
                                                            "-"}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {showtime.releaseDate}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {formatTime(showtime.startTime)}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {showtime.room?.roomName ?? "-"}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void selectShowtime(showtime)
                                                            }
                                                            className="rounded-md border border-[var(--glx-blue)] px-3 py-1 text-xs font-semibold text-[var(--glx-blue)] transition hover:bg-[var(--glx-blue)] hover:text-white"
                                                        >
                                                            {selectedShowtime?.showTimeId ===
                                                            showtime.showTimeId
                                                                ? "Đã chọn"
                                                                : "Chọn"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Tổng suất chiếu: {showtimeTotalItems}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowtimePage((prev) => Math.max(1, prev - 1))
                                        }
                                        disabled={showtimePage === 1 || isShowtimeLoading}
                                        className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40"
                                    >
                                        Trước
                                    </button>
                                    <span>
                                        Trang {showtimePage}/{showtimeTotalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowtimePage((prev) =>
                                                Math.min(showtimeTotalPages, prev + 1)
                                            )
                                        }
                                        disabled={
                                            showtimePage >= showtimeTotalPages || isShowtimeLoading
                                        }
                                        className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40"
                                    >
                                        Tiếp
                                    </button>
                                    <select
                                        value={showtimeSize}
                                        onChange={(event) => {
                                            setShowtimeSize(Number(event.target.value));
                                            setShowtimePage(1);
                                        }}
                                        className="rounded-md border border-slate-200 px-2 py-1"
                                    >
                                        {[5, 8, 10, 20].map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {wizardStep === 3 && (
                        <div>
                            {!selectedCustomer || !selectedShowtime ? (
                                <div className="rounded-md border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                    Vui lòng chọn khách hàng và suất chiếu trước khi chọn ghế.
                                </div>
                            ) : (
                                <ChoiceSeat
                                    startTime={selectedShowtime.startTime}
                                    showTimeId={selectedShowtime.showTimeId}
                                    userId={selectedCustomer.userId}
                                    orderId={orderId}
                                    orderExpiredAt={orderExpiredAt}
                                    selectedSeats={selectedSeats}
                                    onSelectedSeatsChange={setSelectedSeats}
                                    onOrderChange={(nextOrderId, expiredAt) => {
                                        setOrderId(nextOrderId);
                                        setOrderExpiredAt(expiredAt ?? null);
                                    }}
                                    onOrderExpired={handleOrderExpired}
                                />
                            )}
                        </div>
                    )}

                    {wizardStep === 4 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                                <input
                                    value={comboKeyword}
                                    onChange={(event) => setComboKeyword(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            setComboPage(1);
                                            void fetchCombos();
                                        }
                                    }}
                                    type="text"
                                    placeholder="Tìm combo theo tên..."
                                    className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setComboPage(1);
                                        void fetchCombos();
                                    }}
                                    className="h-10 rounded-md bg-[var(--glx-blue)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--glx-blue-strong)]"
                                >
                                    Tìm
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
                                <div className="space-y-3">
                                    {isComboLoading ? (
                                        <div className="rounded-md border border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                            Đang tải danh sách combo...
                                        </div>
                                    ) : comboResults.length === 0 ? (
                                        <div className="rounded-md border border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                            Không tìm thấy combo phù hợp.
                                        </div>
                                    ) : (
                                        comboResults.map((combo) => {
                                            const selected =
                                                selectedCombos.find(
                                                    (item) => item.comboId === combo.comboId
                                                )?.quantity ?? 0;

                                            return (
                                                <div
                                                    key={combo.comboId}
                                                    className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-3"
                                                >
                                                    <img
                                                        src={resolveComboImage(combo.image)}
                                                        alt={combo.comboName}
                                                        className="h-16 w-24 rounded-md object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-sm font-bold text-slate-700">
                                                            {combo.comboName}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {combo.description}
                                                        </div>
                                                        <div className="mt-1 text-sm font-semibold text-[var(--glx-orange)]">
                                                            {formatCurrency(combo.price)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                adjustComboQuantity(combo, -1)
                                                            }
                                                            className="h-7 w-7 rounded border border-slate-200 text-slate-600 transition hover:border-[var(--glx-blue)] hover:text-[var(--glx-blue)]"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="min-w-6 text-center text-sm font-semibold text-slate-700">
                                                            {selected}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                adjustComboQuantity(combo, 1)
                                                            }
                                                            className="h-7 w-7 rounded border border-slate-200 text-slate-600 transition hover:border-[var(--glx-blue)] hover:text-[var(--glx-blue)]"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                                    <h4 className="text-sm font-bold text-slate-700">
                                        Combo đã chọn ({selectedComboCount})
                                    </h4>
                                    <div className="mt-3 space-y-2">
                                        {selectedCombos.length === 0 ? (
                                            <p className="text-xs text-slate-500">
                                                Chưa chọn combo nào.
                                            </p>
                                        ) : (
                                            selectedCombos.map((combo) => (
                                                <div
                                                    key={`selected-${combo.comboId}`}
                                                    className="flex items-start justify-between gap-2 text-xs"
                                                >
                                                    <div>
                                                        <div className="font-semibold text-slate-700">
                                                            {combo.quantity}x {combo.comboName}
                                                        </div>
                                                        <div className="text-slate-500">
                                                            {formatCurrency(combo.price)} / combo
                                                        </div>
                                                    </div>
                                                    <div className="font-semibold text-slate-700">
                                                        {formatCurrency(
                                                            combo.price * combo.quantity
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="mt-4 border-t border-dashed border-slate-300 pt-3 text-sm font-bold text-slate-700">
                                        Tổng combo:{" "}
                                        {formatCurrency(
                                            selectedCombos.reduce(
                                                (sum, combo) =>
                                                    sum + Number(combo.price) * combo.quantity,
                                                0
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>Tổng combo: {comboTotalItems}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setComboPage((prev) => Math.max(1, prev - 1))
                                        }
                                        disabled={comboPage === 1 || isComboLoading}
                                        className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40"
                                    >
                                        Trước
                                    </button>
                                    <span>
                                        Trang {comboPage}/{comboTotalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setComboPage((prev) =>
                                                Math.min(comboTotalPages, prev + 1)
                                            )
                                        }
                                        disabled={comboPage >= comboTotalPages || isComboLoading}
                                        className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40"
                                    >
                                        Tiếp
                                    </button>
                                    <select
                                        value={comboSize}
                                        onChange={(event) => {
                                            setComboSize(Number(event.target.value));
                                            setComboPage(1);
                                        }}
                                        className="rounded-md border border-slate-200 px-2 py-1"
                                    >
                                        {[5, 8, 10, 20].map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {wizardStep === 5 && (
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
                            <div className="rounded-md border border-slate-200 p-4">
                                <h4 className="text-base font-bold text-slate-800">
                                    Thông tin đơn hàng
                                </h4>
                                <div className="mt-3 space-y-2 text-sm">
                                    <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">Khách hàng</span>
                                        <span className="font-semibold text-slate-700">
                                            {selectedCustomer?.fullName ?? "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">Email</span>
                                        <span className="font-semibold text-slate-700">
                                            {selectedCustomer?.email ?? "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">Số điện thoại</span>
                                        <span className="font-semibold text-slate-700">
                                            {selectedCustomer?.phoneNumber ?? "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">Phim</span>
                                        <span className="font-semibold text-slate-700">
                                            {selectedShowtime?.movie?.movieName ?? "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">Rạp / Phòng</span>
                                        <span className="font-semibold text-slate-700">
                                            {selectedShowtime?.room?.cinema?.cinemaName ?? "-"} /{" "}
                                            {selectedShowtime?.room?.roomName ?? "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">Suất chiếu</span>
                                        <span className="font-semibold text-slate-700">
                                            {selectedShowtime?.releaseDate ?? "-"}{" "}
                                            {selectedShowtime
                                                ? formatTime(selectedShowtime.startTime)
                                                : "-"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-slate-500">Mã đơn giữ chỗ</span>
                                        <span className="font-semibold text-slate-700">
                                            {orderId ? `#${orderId}` : "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                                <h4 className="text-base font-bold text-slate-800">
                                    Chi tiết thanh toán
                                </h4>

                                <div className="mt-3 space-y-2 text-sm">
                                    {selectedSeatGroups.map((group) => (
                                        <div
                                            key={group.label}
                                            className="flex justify-between gap-2"
                                        >
                                            <div>
                                                <div className="font-semibold text-slate-700">
                                                    {group.count}x {group.label}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {group.seatLabel}
                                                </div>
                                            </div>
                                            <div className="font-semibold text-slate-700">
                                                {formatCurrency(group.price)}
                                            </div>
                                        </div>
                                    ))}

                                    {selectedCombos.map((combo) => (
                                        <div
                                            key={`payment-combo-${combo.comboId}`}
                                            className="flex justify-between gap-2"
                                        >
                                            <div className="font-semibold text-slate-700">
                                                {combo.quantity}x {combo.comboName}
                                            </div>
                                            <div className="font-semibold text-slate-700">
                                                {formatCurrency(combo.price * combo.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 border-t border-dashed border-slate-300 pt-3">
                                    <div className="flex justify-between text-base font-bold text-slate-800">
                                        <span>Tổng cộng</span>
                                        <span>
                                            {formatCurrency(
                                                calculateTotalPrice(selectedSeats, selectedCombos)
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                    Bấm "Thanh toán VNPAY" để chuyển tới cổng thanh toán. Sau khi
                                    thanh toán xong hệ thống sẽ tự cập nhật trạng thái đơn hàng.
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                void closeWizard();
                            }}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Đóng
                        </button>
                        <button
                            type="button"
                            onClick={goBackWizardStep}
                            disabled={wizardStep === 1}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                        >
                            Quay lại
                        </button>
                        <button
                            type="button"
                            onClick={() => void goNextWizardStep()}
                            disabled={isCheckoutLoading}
                            className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {wizardStep === 5
                                ? isCheckoutLoading
                                    ? "Đang tạo thanh toán..."
                                    : "Thanh toán VNPAY"
                                : "Tiếp tục"}
                        </button>
                    </div>
                </div>
            </ModalShell>

            <ModalShell
                open={detailTargetId !== null}
                onClose={closeOrderDetail}
                title={`Chi tiết đơn hàng ${detailTargetId ? `#${detailTargetId}` : ""}`}
                panelClassName="max-w-[1180px]"
            >
                {isDetailLoading ? (
                    <div className="py-16 text-center text-sm text-slate-500">
                        Đang tải chi tiết đơn hàng...
                    </div>
                ) : !detailOrder ? (
                    <div className="py-16 text-center text-sm text-slate-500">
                        Không có dữ liệu chi tiết.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
                            <div className="rounded-md border border-slate-200 p-4">
                                <h4 className="text-base font-bold text-slate-800">
                                    Thông tin đơn hàng
                                </h4>
                                <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                                    <div>
                                        <span className="text-slate-500">Khách hàng:</span>{" "}
                                        <span className="font-semibold text-slate-700">
                                            {detailOrder.user?.fullName ?? "Khách vãng lai"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Email:</span>{" "}
                                        <span className="font-semibold text-slate-700">
                                            {detailOrder.user?.email ?? "-"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Số điện thoại:</span>{" "}
                                        <span className="font-semibold text-slate-700">
                                            {detailOrder.user?.phoneNumber ?? "-"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Trạng thái:</span>{" "}
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                statusClassByOrderStatus[detailOrder.status]
                                            }`}
                                        >
                                            {detailOrder.status}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Thời gian đặt:</span>{" "}
                                        <span className="font-semibold text-slate-700">
                                            {formatDateTime(detailOrder.createdAt)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">
                                            Thời gian thanh toán:
                                        </span>{" "}
                                        <span className="font-semibold text-slate-700">
                                            {formatDateTime(detailOrder.paidAt)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Mã giao dịch VNPAY:</span>{" "}
                                        <span className="font-semibold text-slate-700">
                                            {detailOrder.vnpayTransactionId ?? "-"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Bank Txn No:</span>{" "}
                                        <span className="font-semibold text-slate-700">
                                            {detailOrder.bankTransactionNo ?? "-"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Bank code:</span>{" "}
                                        <span className="font-semibold text-slate-700">
                                            {detailOrder.bankCode ?? "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                                <h4 className="text-base font-bold text-slate-800">
                                    Suất chiếu và tổng tiền
                                </h4>
                                <div className="mt-3 space-y-2 text-sm">
                                    <div>
                                        <span className="text-slate-500">Phim:</span>{" "}
                                        <span className="font-semibold text-slate-700">
                                            {detailOrder.showTime.movieName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Rạp:</span>{" "}
                                        <span className="font-semibold text-slate-700">
                                            {detailOrder.showTime.cinemaName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Tỉnh/thành:</span>{" "}
                                        <span className="font-semibold text-slate-700">
                                            {detailOrder.showTime.provinceName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Phòng:</span>{" "}
                                        <span className="font-semibold text-slate-700">
                                            {detailOrder.showTime.roomName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Suất:</span>{" "}
                                        <span className="font-semibold text-slate-700">
                                            {detailOrder.showTime.releaseDate}{" "}
                                            {formatTime(detailOrder.showTime.startTime)}
                                        </span>
                                    </div>
                                    <div className="mt-4 border-t border-dashed border-slate-300 pt-3">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Tiền vé</span>
                                            <span className="font-semibold text-slate-700">
                                                {formatCurrency(detailOrder.ticketTotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Tiền combo</span>
                                            <span className="font-semibold text-slate-700">
                                                {formatCurrency(detailOrder.comboTotal)}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex justify-between text-base font-bold text-slate-800">
                                            <span>Tổng thanh toán</span>
                                            <span>{formatCurrency(detailOrder.netAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <div className="rounded-md border border-slate-200 p-4">
                                <h4 className="text-base font-bold text-slate-800">
                                    Danh sách ghế đã đặt
                                </h4>
                                {detailOrder.seats.length === 0 ? (
                                    <p className="mt-3 text-sm text-slate-500">Không có ghế.</p>
                                ) : (
                                    <div className="mt-3 space-y-2">
                                        {detailOrder.seats.map((seat) => (
                                            <div
                                                key={`seat-${seat.seatId}`}
                                                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                                            >
                                                <div>
                                                    <div className="font-semibold text-slate-700">
                                                        {seat.seatLabel} - {seat.seatTypeName}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        Ticket: {seat.ticketStatus ?? "-"} | Seat
                                                        map: {seat.showTimeSeatStatus ?? "-"}
                                                    </div>
                                                </div>
                                                <div className="font-semibold text-slate-700">
                                                    {formatCurrency(seat.unitPrice)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-md border border-slate-200 p-4">
                                <h4 className="text-base font-bold text-slate-800">
                                    Combo đã chọn
                                </h4>
                                {detailOrder.combos.length === 0 ? (
                                    <p className="mt-3 text-sm text-slate-500">Không có combo.</p>
                                ) : (
                                    <div className="mt-3 space-y-2">
                                        {detailOrder.combos.map((combo) => (
                                            <div
                                                key={`combo-${combo.orderComboId}`}
                                                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                                            >
                                                <div>
                                                    <div className="font-semibold text-slate-700">
                                                        {combo.quantity}x {combo.comboName}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        Trạng thái: {combo.status}
                                                    </div>
                                                </div>
                                                <div className="font-semibold text-slate-700">
                                                    {formatCurrency(combo.lineTotal)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-md border border-slate-200 p-4">
                            <h4 className="text-base font-bold text-slate-800">
                                Lịch sử thanh toán
                            </h4>
                            {detailOrder.payments.length === 0 ? (
                                <p className="mt-3 text-sm text-slate-500">Không có giao dịch.</p>
                            ) : (
                                <div className="mt-3 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                                        <thead className="bg-slate-50 text-left">
                                            <tr>
                                                <th className="px-3 py-2 font-semibold text-slate-600">
                                                    Payment ID
                                                </th>
                                                <th className="px-3 py-2 font-semibold text-slate-600">
                                                    Trạng thái
                                                </th>
                                                <th className="px-3 py-2 font-semibold text-slate-600">
                                                    Số tiền
                                                </th>
                                                <th className="px-3 py-2 font-semibold text-slate-600">
                                                    Phương thức
                                                </th>
                                                <th className="px-3 py-2 font-semibold text-slate-600">
                                                    Txn ID
                                                </th>
                                                <th className="px-3 py-2 font-semibold text-slate-600">
                                                    Paid at
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {detailOrder.payments.map((payment) => (
                                                <tr key={payment.paymentId}>
                                                    <td className="px-3 py-2 text-slate-700">
                                                        #{payment.paymentId}
                                                    </td>
                                                    <td className="px-3 py-2 text-slate-700">
                                                        {payment.status}
                                                    </td>
                                                    <td className="px-3 py-2 text-slate-700">
                                                        {formatCurrency(payment.amount)}
                                                    </td>
                                                    <td className="px-3 py-2 text-slate-700">
                                                        {payment.method ?? "-"}
                                                    </td>
                                                    <td className="px-3 py-2 text-slate-700">
                                                        {payment.transactionId ?? "-"}
                                                    </td>
                                                    <td className="px-3 py-2 text-slate-700">
                                                        {formatDateTime(payment.paidAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ModalShell>

            <ModalShell
                open={Boolean(statusTargetOrder)}
                onClose={closeStatusModal}
                title={`Cập nhật trạng thái đơn ${
                    statusTargetOrder ? `#${statusTargetOrder.orderId}` : ""
                }`}
                panelClassName="max-w-[560px]"
            >
                {statusTargetOrder && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Trạng thái hiện tại:{" "}
                            <strong className="text-slate-800">{statusTargetOrder.status}</strong>
                        </p>
                        {availableStatusTransitions.length === 0 ? (
                            <p className="text-sm text-rose-500">
                                Đơn hàng này không thể cập nhật trạng thái thủ công.
                            </p>
                        ) : (
                            <>
                                <select
                                    value={nextStatus}
                                    onChange={(event) =>
                                        setNextStatus(event.target.value as OrderStatus | "")
                                    }
                                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-all focus:border-[var(--glx-blue)] focus:ring-2 focus:ring-[var(--glx-blue)]/20"
                                >
                                    {availableStatusTransitions.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500">
                                    Khi chuyển sang CANCELLED hoặc REFUNDED, hệ thống sẽ nhả ghế và
                                    hủy ticket ACTIVE của đơn.
                                </p>
                            </>
                        )}
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeStatusModal}
                                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--glx-orange)] hover:text-[var(--glx-orange)]"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={() => void updateOrderStatus()}
                                disabled={
                                    !nextStatus ||
                                    availableStatusTransitions.length === 0 ||
                                    isUpdatingStatus
                                }
                                className="rounded-md bg-[var(--glx-orange)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--glx-orange-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isUpdatingStatus ? "Đang cập nhật..." : "Xác nhận"}
                            </button>
                        </div>
                    </div>
                )}
            </ModalShell>
        </div>
    );
};

export default OrderManagement;
