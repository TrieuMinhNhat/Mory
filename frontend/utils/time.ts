import { Locale } from "@/lib/i18n/locales";

// lib/utils/time.ts
export function timeAgo(dateString: string): { key: string; count?: number } {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor(
        (now.getTime() - date.getTime()) / 1000
    );

    if (diffSeconds < 60) {
        return { key: "time.just_now" };
    }

    if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60);
        return { key: "time.minutes_ago", count: minutes };
    }

    if (diffSeconds < 86400) {
        const hours = Math.floor(diffSeconds / 3600);
        return { key: "time.hours_ago", count: hours };
    }

    const days = Math.floor(diffSeconds / 86400);
    if (days < 30) {
        return { key: "time.days_ago", count: days };
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return { key: "time.months_ago", count: months };
    }

    const years = Math.floor(months / 12);
    return { key: "time.years_ago", count: years };
}

export function toDateString(instant: string): string {
    if (!instant) return "";
    const date = new Date(instant);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

const WEEKDAYS = {
    vi: ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"],
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

const PERIOD = {
    vi: { am: "SA", pm: "CH" },
    en: { am: "AM", pm: "PM" },
};

export function formatTime(
    dateInput: string | Date,
    locale: Locale = "vi"
): string {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

    let hours = date.getHours();
    const minutes = date.getMinutes();

    const isAM = hours < 12;
    const period = isAM
        ? PERIOD[locale].am
        : PERIOD[locale].pm;

    hours = hours % 12;
    if (hours === 0) hours = 12;

    const minutesStr = String(minutes).padStart(2, "0");

    return `${hours}:${minutesStr} ${period}`;
}


// Hàm format ngày tháng kiểu "5 thg 12" hoặc "5 thg 6, 2022"
export function formatDate(
    date: Date,
    locale: Locale = "vi",
    includeYear = false
): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;

    if (locale === "vi") {
        if (includeYear) return `${day} thg ${month}, ${date.getFullYear()}`;
        return `${day} thg ${month}`;
    }

    // English
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct", "Nov", "Dec"];

    if (includeYear) return `${monthNames[month - 1]} ${day}, ${date.getFullYear()}`;
    return `${monthNames[month - 1]} ${day}`;
}

// Hàm lấy tên thứ tiếng Việt: Th 2, Th 3, ..., CN
export function getWeekday(date: Date, locale: Locale = "vi"): string {
    return WEEKDAYS[locale][date.getDay()];
}

// Hàm chính theo yêu cầu
export function formatSmartDateTime(
    dateInput: string | Date,
    locale: Locale = "vi"
): string {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const now = new Date();

    const isSameDay =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

    if (isSameDay) {
        return formatTime(date, locale);
    }

    const diffDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 0 && diffDays <= 4) {
        return getWeekday(date, locale);
    }

    if (date.getFullYear() === now.getFullYear()) {
        return formatDate(date, locale, false);
    }

    return formatDate(date, locale, true);
}

