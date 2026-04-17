import type { QuickAction } from "./types";

export const CHATBOT_QUICK_ACTIONS: QuickAction[] = [
    {
        id: "movies_today",
        label: "Phim hom nay",
        query: "Cac phim chieu hom nay",
    },
    {
        id: "genres",
        label: "The loai phim",
        query: "Cac the loai phim",
    },
    {
        id: "action_movies",
        label: "Phim hanh dong",
        query: "Phim hanh dong",
    },
    {
        id: "conan_showtime",
        label: "Lich chieu Cú Nhảy Kỳ Diệu",
        query: "Phim Cú Nhảy Kỳ Diệu chieu luc may gio",
    },
];

export const FALLBACK_MESSAGE =
    "Minh chua hieu ro cau hoi nay. Ban thu hoi minh theo mau nhu: 'Cac phim chieu hom nay' hoac 'Thong tin phim Conan' nhe.";

export const GENRE_ALIASES: Record<string, string[]> = {
    action: ["hanh dong", "action"],
    romance: ["tinh cam", "lang man", "romance", "romantic"],
    comedy: ["hai", "comedy"],
    family: ["gia dinh", "family"],
    animation: ["hoat hinh", "anime", "animation"],
    horror: ["kinh di", "horror"],
    thriller: ["giat gan", "thriller"],
    detective: ["trinh tham", "detective", "mystery"],
    sci_fi: ["vien tuong", "sci fi", "scifi", "science fiction"],
    drama: ["tam ly", "drama"],
};

export const ROMANTIC_GENRE_PRIORITY = ["romance", "comedy", "family"];
