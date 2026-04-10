export interface ShowTimeSeat {
  showTimeSeatId: number;
  status: "AVAILABLE" | "HOLDING" | "BOOKED";
  heldUntil: string | null;
  price?: number;
  seat: {
    seatId: number;
    seatRow: string;
    seatColumn: number;
    seattype: { seatTypeName: string };
  };
}

export interface Combo {
  comboId: number;
  comboName: string;
  image: string;
  price: number;
}

export interface ShowDetail {
  showId: number;
  releaseDate: string;
  startTime: string;
  endTime: string;

  movie: {
    movieId: number;
    movieName: string;
    duration: number;
    imagePortrait: string;
    movietype: { movieTypeName: string };
    age: int;
  };
  room: {
    roomId: number;
    roomName: string;
    roomtype: { roomTypeName: string };
    cinema: { cinemaName: string; address: string };
  };
  showTimeSeats: ShowTimeSeat[];
}
