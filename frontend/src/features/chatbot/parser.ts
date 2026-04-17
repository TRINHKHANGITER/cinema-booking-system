import { GENRE_ALIASES } from "./constants";
import { includesAny, normalizeHourTo24, normalizeText, pad2, sanitizeEntity } from "./text";
import type { DateTarget, ParsedIntent } from "./types";

const TODAY_KEYWORDS = ["hom nay", "toi nay", "chieu nay"];
const TOMORROW_KEYWORDS = ["ngay mai", "mai"];

const extractMovieNameForShowtime = (normalizedInput: string): string | undefined => {
    const fullPattern =
        /(?:phim|lich chieu)\s+(.+?)(?:\s+chieu\s+luc\s+may\s+gio|\s+chieu\s+luc\s+\d{1,2}(?::\d{1,2})?|$)/;
    const fullMatch = normalizedInput.match(fullPattern);

    if (fullMatch?.[1]) {
        return sanitizeEntity(fullMatch[1]);
    }

    if (normalizedInput.startsWith("lich chieu ")) {
        return sanitizeEntity(normalizedInput.replace("lich chieu ", ""));
    }

    return undefined;
};

const extractMovieNameForInfo = (normalizedInput: string): string | undefined => {
    const infoMatch = normalizedInput.match(/thong\s+tin\s+phim\s+(.+)$/);
    if (!infoMatch?.[1]) return undefined;
    return sanitizeEntity(infoMatch[1]);
};

const extractMovieNameForSimilarity = (normalizedInput: string): string | undefined => {
    const match = normalizedInput.match(/giong\s+(.+?)(?:\s+khong|$)/);
    if (!match?.[1]) return undefined;
    return sanitizeEntity(match[1]);
};

const extractDateTarget = (normalizedInput: string): DateTarget | undefined => {
    if (includesAny(normalizedInput, TOMORROW_KEYWORDS)) {
        return "tomorrow";
    }

    if (includesAny(normalizedInput, TODAY_KEYWORDS)) {
        return "today";
    }

    return undefined;
};

const toIsoDate = (year: number, month: number, day: number): string | undefined => {
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return undefined;
    }

    const candidate = new Date(year, month - 1, day);
    if (
        candidate.getFullYear() !== year ||
        candidate.getMonth() + 1 !== month ||
        candidate.getDate() !== day
    ) {
        return undefined;
    }

    return `${year}-${pad2(month)}-${pad2(day)}`;
};

const normalizeYear = (rawYear: number): number => {
    if (rawYear >= 100) {
        return rawYear;
    }

    return rawYear + 2000;
};

const extractExplicitDate = (normalizedInput: string): string | undefined => {
    const ymdMatch = normalizedInput.match(/\b(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})\b/);
    if (ymdMatch) {
        const year = Number(ymdMatch[1]);
        const month = Number(ymdMatch[2]);
        const day = Number(ymdMatch[3]);
        return toIsoDate(year, month, day);
    }

    const dmyMatch = normalizedInput.match(/\b(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?\b/);
    if (!dmyMatch) {
        return undefined;
    }

    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[2]);
    const inferredYear = dmyMatch[3] ? normalizeYear(Number(dmyMatch[3])) : new Date().getFullYear();

    if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(inferredYear)) {
        return undefined;
    }

    return toIsoDate(inferredYear, month, day);
};

const extractGenreKey = (normalizedInput: string): string | undefined => {
    for (const [genreKey, aliases] of Object.entries(GENRE_ALIASES)) {
        if (aliases.some((alias) => normalizedInput.includes(alias))) {
            return genreKey;
        }
    }

    return undefined;
};

const extractTimeAfter = (normalizedInput: string): string | undefined => {
    const match = normalizedInput.match(/sau\s+(\d{1,2})(?:\s*(?:gio|h|:)\s*(\d{1,2}))?/);
    if (!match) return undefined;

    const rawHour = Number(match[1]);
    const rawMinute = Number(match[2] ?? "0");

    if (Number.isNaN(rawHour) || Number.isNaN(rawMinute)) {
        return undefined;
    }

    if (rawHour < 0 || rawHour > 23 || rawMinute < 0 || rawMinute > 59) {
        return undefined;
    }

    const shouldBiasToEvening = includesAny(normalizedInput, ["toi", "dem"]) || rawHour <= 7;
    const hour = normalizeHourTo24(rawHour, shouldBiasToEvening);

    return `${pad2(hour)}:${pad2(rawMinute)}`;
};

export const parseChatIntent = (rawInput: string): ParsedIntent => {
    const normalizedInput = normalizeText(rawInput);
    const genreKey = extractGenreKey(normalizedInput);
    const dateTarget = extractDateTarget(normalizedInput);
    const explicitDate = extractExplicitDate(normalizedInput);
    const timeAfter = extractTimeAfter(normalizedInput);

    if (!normalizedInput) {
        return {
            intent: "unknown",
            rawInput,
            normalizedInput,
            entities: {},
        };
    }

    if (normalizedInput.includes("the loai")) {
        return {
            intent: "genres_list",
            rawInput,
            normalizedInput,
            entities: {
                dateTarget,
                explicitDate,
            },
        };
    }

    if (includesAny(normalizedInput, ["nguoi yeu", "hen ho", "tinh cam"])) {
        return {
            intent: "romantic_tonight",
            rawInput,
            normalizedInput,
            entities: {
                dateTarget: dateTarget ?? "today",
                timeAfter: timeAfter ?? "18:00",
                explicitDate,
            },
        };
    }

    if (
        normalizedInput.includes("chieu luc may gio") ||
        normalizedInput.startsWith("lich chieu ") ||
        normalizedInput.includes("lich chieu")
    ) {
        return {
            intent: "movie_showtimes",
            rawInput,
            normalizedInput,
            entities: {
                movieName: extractMovieNameForShowtime(normalizedInput),
                dateTarget,
                timeAfter,
                explicitDate,
            },
        };
    }

    if (normalizedInput.includes("thong tin phim")) {
        return {
            intent: "movie_info",
            rawInput,
            normalizedInput,
            entities: {
                movieName: extractMovieNameForInfo(normalizedInput),
                explicitDate,
            },
        };
    }

    if (normalizedInput.includes("giong")) {
        return {
            intent: "similar_movie",
            rawInput,
            normalizedInput,
            entities: {
                movieName: extractMovieNameForSimilarity(normalizedInput),
                explicitDate,
            },
        };
    }

    if (genreKey && timeAfter) {
        return {
            intent: "movies_by_genre_after_time",
            rawInput,
            normalizedInput,
            entities: {
                genreKey,
                timeAfter,
                dateTarget: dateTarget ?? "today",
                explicitDate,
            },
        };
    }

    if (genreKey) {
        return {
            intent: "movies_by_genre",
            rawInput,
            normalizedInput,
            entities: {
                genreKey,
                dateTarget,
                explicitDate,
            },
        };
    }

    if (explicitDate && includesAny(normalizedInput, ["phim", "chieu", "suat"])) {
        return {
            intent: "movies_on_date",
            rawInput,
            normalizedInput,
            entities: {
                explicitDate,
                timeAfter,
            },
        };
    }

    if (dateTarget === "tomorrow") {
        return {
            intent: "movies_tomorrow",
            rawInput,
            normalizedInput,
            entities: {
                dateTarget,
                timeAfter,
                explicitDate,
            },
        };
    }

    if (dateTarget === "today") {
        return {
            intent: "movies_today",
            rawInput,
            normalizedInput,
            entities: {
                dateTarget,
                timeAfter,
                explicitDate,
            },
        };
    }

    return {
        intent: "unknown",
        rawInput,
        normalizedInput,
        entities: {
            genreKey,
            movieName: extractMovieNameForInfo(normalizedInput),
            dateTarget,
            timeAfter,
            explicitDate,
        },
    };
};
