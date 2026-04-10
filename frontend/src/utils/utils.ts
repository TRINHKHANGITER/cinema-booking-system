import type { SelectedCombo } from "../types/combo";
import type { Seat } from "../types/seat";
import type { Showtime } from "../types/showtime";

// utils/utils.ts
export const calculateTotalPrice = (
  selectedSeats: Seat[],
  selectedCombos: SelectedCombo[] = [],
) => {
  const seatTotal = selectedSeats
    .filter((s) => s.isPrimary !== false)
    .reduce((sum, s) => sum + Number(s.prices?.[0]?.price ?? 0), 0);

  const comboTotal = selectedCombos.reduce(
    (sum, c) => sum + Number(c.price) * c.quantity,
    0,
  );

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
    timeZone: "UTC",
  });
};
//chia loại ghế theo hàng Ghế thường D1,D2,D3 Vip H1,H2
export const groupSelectedSeats = (selectedSeats: Seat[]) => {
  const primary = selectedSeats.filter((s) => s.isPrimary !== false);

  const thuong = primary.filter((s) => s.seatTypeId === 1);
  const vip = primary.filter((s) => s.seatTypeId === 2);
  const doi = primary.filter((s) => s.seatTypeId === 3);

  const result = [];

  if (thuong.length) {
    result.push({
      label: "Ghế thường",
      seatLabel: thuong.map((s) => `${s.seatRow}${s.seatColumn}`).join(", "),
      price: thuong.reduce(
        (sum, s) => sum + Number(s.prices?.[0]?.price ?? 0),
        0,
      ),
      count: thuong.length,
    });
  }

  if (vip.length) {
    result.push({
      label: "Ghế VIP",
      seatLabel: vip.map((s) => `${s.seatRow}${s.seatColumn}`).join(", "),
      price: vip.reduce((sum, s) => sum + Number(s.prices?.[0]?.price ?? 0), 0),
      count: vip.length,
    });
  }

  if (doi.length) {
    result.push({
      label: "Ghế đôi",
      seatLabel: doi
        .map((s) => {
          const partnerColumn =
            s.seatColumn % 2 === 0 ? s.seatColumn - 1 : s.seatColumn + 1;
          const partner = selectedSeats.find(
            (p) =>
              p.isPrimary === false &&
              p.seatRow === s.seatRow &&
              p.seatColumn === partnerColumn,
          );
          return `${s.seatRow}${s.seatColumn}·${s.seatRow}${partner?.seatColumn ?? "?"}`;
        })
        .join(", "),
      price: doi.reduce((sum, s) => sum + Number(s.prices?.[0]?.price ?? 0), 0),
      count: doi.length,
    });
  }

  return result;
};

export const calculateTotalPriceOneRow = (selectedSeats: Seat[]) => {
  return selectedSeats
    .filter((s) => s.isPrimary !== false)
    .reduce((sum, s) => sum + Number(s.prices?.[0]?.price ?? 0), 0);
};

export const groupSeatsByRow = (seats: Seat[]): Record<string, Seat[]> => {
  return seats.reduce(
    (acc, s) => {
      if (!acc[s.seatRow]) acc[s.seatRow] = [];
      acc[s.seatRow].push(s);
      return acc;
    },
    {} as Record<string, Seat[]>,
  );
};

export const filterShowtimesByDate = (
  showtimes: Showtime[],
  selectedDate: string | null,
): Showtime[] => {
  if (!selectedDate) return showtimes;
  return showtimes.filter((show) => {
    const showDate = new Date(show.releaseDate).toISOString().slice(0, 10);
    return showDate === selectedDate;
  });
};

export const groupShowtimesByCinema = (
  showtimes: Showtime[],
): Record<string, Record<string, Showtime[]>> => {
  return showtimes.reduce(
    (acc, show) => {
      const cinemaName = show.room.cinema.cinemaName;
      const roomType = show.room.roomtype.roomTypeName;

      if (!acc[cinemaName]) acc[cinemaName] = {};
      if (!acc[cinemaName][roomType]) acc[cinemaName][roomType] = [];
      // Kiểm tra trùng giờ trước khi push
      const isDuplicate = acc[cinemaName][roomType].some(
        (s) => s.startTime === show.startTime,
      );

      if (!isDuplicate) {
        acc[cinemaName][roomType].push(show);
      }

      return acc;
    },
    {} as Record<string, Record<string, Showtime[]>>,
  );
};
