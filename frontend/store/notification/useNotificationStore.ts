import { createStore } from "zustand/vanilla";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { authStore } from "@/store/useAuthStore";
import {ApiResult} from "@/types/auth";
import {Notification} from "@/types/notifications";
import {fetchNotifications} from "@/lib/services/notifications.service";

interface NotificationsState {
    notifications: Notification[];
    notificationsHasNext: boolean;
    notificationsCursorCreatedAt?: string;
    notificationsCursorId?: string;
    isFetchingNotifications: boolean;
    notificationsHasFetchedOnce: boolean;
    fetchNotifications: (params?: { size?: number }) => Promise<ApiResult>;

    addNotification: (notification: Notification) => void;
}



const notificationsStore = createStore<NotificationsState>()((set, get) => ({
    notifications: [],
    notificationsCursorCreatedAt: undefined,
    notificationsCursorId: undefined,
    notificationsHasNext: false,
    isFetchingNotifications: false,
    notificationsHasFetchedOnce: false,


    fetchNotifications: async ({ size = 20} = {}) => {
        const { user } = authStore.getState();
        if (!user) return { success: false, message: "User not authenticated" };

        return runWithLoadingFlag(set, "isFetchingNotifications", async () => {
            const { notificationsCursorCreatedAt, notificationsCursorId } = get();
            const response = await fetchNotifications({
                cursorCreatedAt: notificationsCursorCreatedAt,
                cursorId: notificationsCursorId,
                size: size,
            });

            if (response.success) {
                set((state) => {
                    const existingIds = new Set(state.notifications.map((c) => c.id));
                    const newNotifications: Notification[] = response.data.notifications
                    const filteredNotifications = newNotifications
                        ? newNotifications.filter((n) => !existingIds.has(n.id))
                        : [];

                    return {
                        notifications: [...state.notifications, ...filteredNotifications],
                        notificationsHasNext: response.data.hasNext,
                        notificationsCursorCreatedAt: response.data.nextCursorCreatedAt,
                        notificationsCursorId: response.data.nextCursorId,
                        notificationsHasFetchedOnce: state.notificationsHasFetchedOnce || true,
                    };
                });
            }
            return {success: response.success, message: response.message}
        }, "Failed to fetch conversations");},

    addNotification: (notification: Notification) => {
        set((state) => {
            const exists = state.notifications.some(
                (n) => n.id === notification.id
            );

            if (exists) {
                return state;
            }

            return {
                notifications: [notification, ...state.notifications],
            };
        });
    },
}));

export default notificationsStore;

const runWithLoadingFlag = async (
    set: (state: Partial<NotificationsState>) => void,
    loadingKey: keyof NotificationsState,
    fn: () => Promise<ApiResult>,
    fallbackMessage: string
): Promise<ApiResult> => {
    set({ [loadingKey]: true } as Partial<NotificationsState>);
    try {
        return await fn();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error?.message);
        }
        return { success: false, message: fallbackMessage };
    } finally {
        set({ [loadingKey]: false } as Partial<NotificationsState>);
    }
};

export const useNotificationsStore = <T>(
    selector: (state: NotificationsState) => T,
    equals?: (a: T, b: T) => boolean
) => useStoreWithEqualityFn(notificationsStore, selector, equals);
