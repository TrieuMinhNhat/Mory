// lib/utils/time.ts
export function timeAgo(dateString: string): { key: string; count?: number } {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) {
        return { key: "time.just_now" };
    }
    if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return { key: "time.minutes_ago", count: minutes };
    }
    if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return { key: "time.hours_ago", count: hours };
    }
    const days = Math.floor(diff / 86400);
    return { key: "time.days_ago", count: days };
}

export function toDateString(instant: string): string {
    if (!instant) return "";
    const date = new Date(instant);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}
