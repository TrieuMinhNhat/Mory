import { createStore } from "zustand/vanilla";
import { useStoreWithEqualityFn } from "zustand/traditional";
import {fetchConversation, fetchConversations} from "@/lib/services/conversations.service";
import { authStore } from "@/store/useAuthStore";
import {Conversation, ConversationMember} from "@/types/conversations";
import {ApiResult} from "@/types/auth";

const fetchingConversationIds = new Set<string>();

interface ConversationsState {
    conversations: Conversation[];
    conversationsHasNext: boolean;
    conversationsCursorLastSentAt?: string;
    conversationsCursorId?: string;



    isFetchingConversations: boolean;
    conversationsHasFetchedOnce: boolean;
    fetchConversations: (params?: { size?: number }) => Promise<ApiResult>;

    updateConversation: (conversationId: string, partial: Partial<Conversation>) => void;
    updateMemberInConversation: (conversationId: string, userId: string, partialMember: Partial<ConversationMember>) => void;

    increaseMyUnreadCount: (conversationId: string, messageUserId: string) => void;
    resetMyUnreadCount: (conversationId: string) => void;
}



const conversationsStore = createStore<ConversationsState>()((set, get) => ({
    conversations: [],
    conversationsCursorLastSentAt: undefined,
    conversationsCursorId: undefined,
    conversationsHasNext: false,
    isFetchingConversations: false,
    conversationsHasFetchedOnce: false,


    fetchConversations: async ({ size = 20} = {}) => {
        const { user } = authStore.getState();
        if (!user) return { success: false, message: "User not authenticated" };

        return runWithLoadingFlag(set, "isFetchingConversations", async () => {
            const { conversationsCursorLastSentAt, conversationsCursorId } = get();
            const response = await fetchConversations({
                cursorLastSentAt: conversationsCursorLastSentAt,
                cursorId: conversationsCursorId,
                size,
            });

            if (response.success) {
                set((state) => {
                    const existingIds = new Set(state.conversations.map((c) => c.id));
                    const newCons: Conversation[] = response.data.conversations;
                    const filteredCons = newCons
                        ? newCons.filter((c) => !existingIds.has(c.id))
                        : [];

                    return {
                        conversations: [...state.conversations, ...filteredCons],
                        conversationsHasNext: response.data.hasNext,
                        conversationsCursorLastSentAt: response.data.nextCursorLastSentAt,
                        conversationsCursorId: response.data.nextCursorId,
                        conversationsHasFetchedOnce: state.conversationsHasFetchedOnce || true,
                    };
                });
            }
            return {success: response.success, message: response.message}
        }, "Failed to fetch conversations");},

    updateConversation: async (conversationId, partial) => {
        const { conversations } = conversationsStore.getState();

        const index = conversations.findIndex(
            (conv) => conv.id === conversationId
        );

        if (index !== -1) {
            conversationsStore.setState((state) => {
                const updatedConversation = {
                    ...state.conversations[index],
                    ...partial,
                };

                return {
                    conversations: [
                        updatedConversation,
                        ...state.conversations.filter(
                            (conv) => conv.id !== conversationId
                        ),
                    ],
                };
            });
            return;
        }

        if (fetchingConversationIds.has(conversationId)) return;
        fetchingConversationIds.add(conversationId);

        try {
            const response = await fetchConversation(conversationId);
            if (!response.success) return;

            conversationsStore.setState((state) => ({
                conversations: [
                    {
                        ...response.data,
                        ...partial,
                    },
                    ...state.conversations,
                ],
            }));
        } catch (error) {
            console.error("Failed to fetch conversation:", error);
        } finally {
            fetchingConversationIds.delete(conversationId);
        }
    },

    updateMemberInConversation: (conversationId, userId, partialMember) => {
        set((state) => {
            const conversations = state.conversations.map((conv) => {
                if (conv.id === conversationId) {
                    const members = conv.members.map((member) => {
                        if (member.user.id === userId) {
                            return { ...member, ...partialMember };
                        }
                        return member;
                    });
                    return { ...conv, members };
                }
                return conv;
            });
            return { conversations };
        });
    },

    increaseMyUnreadCount: (conversationId: string, messageUserId: string) => {
        const myUserId = authStore.getState().user?.id;
        if (!myUserId) return;
        if (myUserId === messageUserId) return;

        set((state) => {
            let changed = false;

            const conversations = state.conversations.map((conv) => {
                if (conv.id !== conversationId) return conv;

                const members = conv.members.map((member) => {
                    if (member.user.id !== myUserId) return member;

                    changed = true;
                    return {
                        ...member,
                        unreadCount: (member.unreadCount ?? 0) + 1,
                    };
                });

                return { ...conv, members };
            });

            return changed ? { conversations } : state;
        });
    },

    resetMyUnreadCount: (conversationId: string) => {
        const myUserId = authStore.getState().user?.id;
        if (!myUserId) return;

        set((state) => {
            let changed = false;

            const conversations = state.conversations.map((conv) => {
                if (conv.id !== conversationId) return conv;

                const members = conv.members.map((member) => {
                    if (member.user.id !== myUserId) return member;
                    if ((member.unreadCount ?? 0) === 0) return member;

                    changed = true;
                    return {
                        ...member,
                        unreadCount: 0,
                    };
                });

                return { ...conv, members };
            });

            return changed ? { conversations } : state;
        });
    },

}));

export default conversationsStore;

const runWithLoadingFlag = async (
    set: (state: Partial<ConversationsState>) => void,
    loadingKey: keyof ConversationsState,
    fn: () => Promise<ApiResult>,
    fallbackMessage: string
): Promise<ApiResult> => {
    set({ [loadingKey]: true } as Partial<ConversationsState>);
    try {
        return await fn();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error?.message);
        }
        return { success: false, message: fallbackMessage };
    } finally {
        set({ [loadingKey]: false } as Partial<ConversationsState>);
    }
};

export const useConversationsStore = <T>(
    selector: (state: ConversationsState) => T,
    equals?: (a: T, b: T) => boolean
) => useStoreWithEqualityFn(conversationsStore, selector, equals);
