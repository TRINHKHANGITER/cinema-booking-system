export interface Showtime {
  showtimeId: number;
  movieId: number;
  roomId: number;

  releaseDate: string;
  startTime: string;
  endTime: string;

  status: number;

  room: {
    roomId: number;
    roomName: string;

    roomtype: {
      roomTypeId: number;
      roomTypeName: string;
    };

    cinema: {
      cinemaId: number;
      cinemaName: string;
      address: string;
    };
  };
}
