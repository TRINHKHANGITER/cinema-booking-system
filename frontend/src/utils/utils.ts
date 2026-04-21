import type { SelectedCombo } from "../types/combo";
import type { Seat } from "../types/seat";
import type { Showtime } from "../types/showtime";

const DEFAULT_SEAT_PRICE = 75000;
const VIP_SEAT_PRICE = 90000;
const COUPLE_SEAT_PRICE = 160000;

export const seatUnitPrice = (seat: Seat): number => {
    const typeId = seat.seatTypeId ?? seat.seatType?.seatTypeId;

    if (typeId === 3) return COUPLE_SEAT_PRICE;
    if (typeId === 2) return VIP_SEAT_PRICE;
    return DEFAULT_SEAT_PRICE;
};

export const calculateTotalPrice = (
    selectedSeats: Seat[],
    selectedCombos: SelectedCombo[] = []
) => {
    const seatTotal = selectedSeats
        .filter((s) => s.isPrimary !== false)
        .reduce((sum, s) => sum + seatUnitPrice(s), 0);

    const comboTotal = selectedCombos.reduce((sum, c) => sum + Number(c.price) * c.quantity, 0);

    return seatTotal + comboTotal;
};

export const formatTime = (timeStr: string) => {
    if (!timeStr) return "";

    if (timeStr.includes(":") && timeStr.length <= 8) {
        return timeStr.slice(0, 5);
    }

    return new Date(timeStr).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

export const parseActors = (actors: string | null | undefined): string[] => {
    if (!actors) return [];

    try {
        const parsed = JSON.parse(actors);
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item)).filter(Boolean);
        }
    } catch {
        // Ignore parse errors and fallback to comma split.
    }

    return actors
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

export const groupSelectedSeats = (selectedSeats: Seat[]) => {
    const primary = selectedSeats.filter((s) => s.isPrimary !== false);

    const thuong = primary.filter((s) => s.seatTypeId === 1);
    const vip = primary.filter((s) => s.seatTypeId === 2);
    const doi = primary.filter((s) => s.seatTypeId === 3);

    const result = [];

    if (thuong.length) {
        result.push({
            label: "Gh? thu?ng",
            seatLabel: thuong.map((s) => `${s.seatRow}${s.seatColumn}`).join(", "),
            price: thuong.reduce((sum, s) => sum + seatUnitPrice(s), 0),
            count: thuong.length,
        });
    }

    if (vip.length) {
        result.push({
            label: "Gh? VIP",
            seatLabel: vip.map((s) => `${s.seatRow}${s.seatColumn}`).join(", "),
            price: vip.reduce((sum, s) => sum + seatUnitPrice(s), 0),
            count: vip.length,
        });
    }

    if (doi.length) {
        result.push({
            label: "Gh? d�i",
            seatLabel: doi
                .map((s) => {
                    const partnerColumn =
                        s.seatColumn % 2 === 0 ? s.seatColumn - 1 : s.seatColumn + 1;
                    const partner = selectedSeats.find(
                        (p) =>
                            p.isPrimary === false &&
                            p.seatRow === s.seatRow &&
                            p.seatColumn === partnerColumn
                    );
                    return `${s.seatRow}${s.seatColumn}�${s.seatRow}${partner?.seatColumn ?? "?"}`;
                })
                .join(", "),
            price: doi.reduce((sum, s) => sum + seatUnitPrice(s), 0),
            count: doi.length,
        });
    }

    return result;
};

export const calculateTotalPriceOneRow = (selectedSeats: Seat[]) => {
    return selectedSeats
        .filter((s) => s.isPrimary !== false)
        .reduce((sum, s) => sum + seatUnitPrice(s), 0);
};

export const groupSeatsByRow = (seats: Seat[]): Record<string, Seat[]> => {
    return seats.reduce(
        (acc, s) => {
            if (!acc[s.seatRow]) acc[s.seatRow] = [];
            acc[s.seatRow].push(s);
            return acc;
        },
        {} as Record<string, Seat[]>
    );
};

export const filterShowtimesByDate = (
    showtimes: Showtime[],
    selectedDate: string | null
): Showtime[] => {
    if (!selectedDate) return showtimes;

    return showtimes.filter((show) => {
        const showDate = new Date(show.startTime).toISOString().slice(0, 10);
        return showDate === selectedDate;
    });
};

export const groupShowtimesByCinema = (
    showtimes: Showtime[]
): Record<string, Record<string, Showtime[]>> => {
    return showtimes.reduce(
        (acc, show) => {
            const cinemaName = show.cinemaName;
            const roomType = show.roomTypeName;

            if (!acc[cinemaName]) acc[cinemaName] = {};
            if (!acc[cinemaName][roomType]) acc[cinemaName][roomType] = [];

            const isDuplicate = acc[cinemaName][roomType].some(
                (s) => s.startTime === show.startTime
            );

            if (!isDuplicate) {
                acc[cinemaName][roomType].push(show);
            }

            return acc;
        },
        {} as Record<string, Record<string, Showtime[]>>
    );
};

export const calculateAgeFromDate = (dateStr: string | null) => {
    if (!dateStr) return null;

    const birthDate = new Date(dateStr);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || today.getDate() < birthDate.getDate()) {
        age--;
    }

    return age;
}