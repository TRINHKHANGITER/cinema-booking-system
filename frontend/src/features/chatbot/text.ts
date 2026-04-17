export const normalizeText = (value: string): string => {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
};

export const includesAny = (source: string, keywords: string[]): boolean => {
    return keywords.some((keyword) => source.includes(keyword));
};

export const sanitizeEntity = (value: string): string => {
    return value.replace(/[?.!,]+$/g, "").trim();
};

export const pad2 = (value: number): string => String(value).padStart(2, "0");

export const toYyyyMmDd = (date: Date): string => {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

export const addDays = (date: Date, amount: number): Date => {
    const cloned = new Date(date);
    cloned.setDate(cloned.getDate() + amount);
    return cloned;
};

export const uniqueBy = <T, K extends string | number>(
    items: T[],
    keySelector: (item: T) => K
): T[] => {
    const seen = new Set<K>();
    const result: T[] = [];

    for (const item of items) {
        const key = keySelector(item);
        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        result.push(item);
    }

    return result;
};

export const truncateText = (value: string | null | undefined, maxLength: number): string => {
    if (!value) return "";
    if (value.length <= maxLength) return value;
    return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
};

export const normalizeHourTo24 = (hour: number, shouldBiasToEvening: boolean): number => {
    if (shouldBiasToEvening && hour > 0 && hour < 12) {
        return hour + 12;
    }

    return hour;
};
