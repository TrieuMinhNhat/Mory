import {createStore} from "zustand/vanilla";
import {useStoreWithEqualityFn} from "zustand/traditional";
import {fetchConversation, fetchMessages} from "@/lib/services/conversations.service";
import {ChatMessage, Conversation, ConversationMember, MessageLoadDirection} from "@/types/conversations";
import {ApiResult} from "@/types/auth";
import {authStore} from "@/store/useAuthStore";

interface CurrentConversationState {
    currentConversation?: Conversation;
    setCurrentConversation: (conversation?: Conversation) => void;
    isFetchingConversation: boolean;
    fetchConversation: (conversationId: string) => Promise<ApiResult>;

    updateConversation: (conversationId: string, partial: Partial<Conversation>) => void;
    updateMemberInConversation: (conversationId: string, userId: string, partialMember: Partial<ConversationMember>) => void;

    messages: ChatMessage[],
    isFetchingMessages: boolean,
    anchorMessageId?: string;
    hasScrolledToAnchorOnce: boolean
    messagesHasOlder: boolean;
    messagesOlderCursorCreatedAt?: string;
    messagesOlderCursorId?: string;
    messagesHasNewer: boolean;
    messagesNewerCursorCreatedAt?: string;
    messagesNewerCursorId?: string;
    messagesHasFetchedOnce: boolean;
    fetchMessages: (
        conversationId: string,
        params: {
            direction: MessageLoadDirection;
            size?: number;
            messageId?: string;
            reset?: boolean;
        }
        ) => Promise<ApiResult>;
    newMessages: ChatMessage[];
    resetNewMessages: () => void;
    setScrolledToAnchor: () => void;

    addMessage: (message: ChatMessage, conversationId: string) => void;
    resetMessages: (anchorMessageId?: string) => void;
}

const currentConversationStore = createStore<CurrentConversationState>()((set, get) => {
    const currentConversationInitialState = {
        currentConversation: undefined,
        isFetchingConversation: false,
    }
    const messagesInitialState = {
        messages: [],
        isFetchingMessages: false,
        anchorMessageId: undefined,
        hasScrolledToAnchorOnce: false,
        messagesHasOlder: false,
        messagesOlderCursorCreatedAt: undefined,
        messagesOlderCursorId: undefined,
        messagesHasNewer: false,
        messagesNewerCursorCreatedAt: undefined,
        messagesNewerCursorId: undefined,
        messagesHasFetchedOnce: false,
        newMessages: []
    }

    return {
        ...currentConversationInitialState,
        setCurrentConversation: (conversation?: Conversation) => {
            get().resetMessages()
            set({currentConversation: conversation});
        },
        fetchConversation: async (conversationId: string) => {
            return runWithLoadingFlag(set, "isFetchingConversation", async () => {
                const response = await fetchConversation(conversationId);
                if (response.success) {
                    set({currentConversation: response.data});
                    get().resetMessages()
                }
                return {success: response.success, message: response.message}
            }, "Failed to fetch conversation");},
        updateConversation: (conversationId, partial) => {
            if (conversationId !== get().currentConversation?.id) return;
            set((state) => {
                if (!state.currentConversation) return state;
                return {
                    currentConversation: {
                        ...state.currentConversation,
                        ...partial,
                    },
                };
            });
        },
        updateMemberInConversation: (conversationId, userId, partialMember) => {
            if (conversationId !== get().currentConversation?.id) return;
            set((state) => {
                if (!state.currentConversation) return state;

                const updatedMembers = state.currentConversation.members.map((member) => {
                    if (member.user.id === userId) {
                        return { ...member, ...partialMember };
                    }
                    return member;
                });

                return {
                    currentConversation: {
                        ...state.currentConversation,
                        members: updatedMembers,
                    },
                };
            });
        },


        ...messagesInitialState,
        fetchMessages: async (
            conversationId: string,
            {
                direction,
                size = 20,
                messageId,
                reset = false,
            }: {
                direction: MessageLoadDirection;
                size?: number;
                messageId?: string;
                reset?: boolean;
            }
        ) => {
            return runWithLoadingFlag(set, "isFetchingMessages", async () => {
                if (messageId) get().resetMessages(messageId);

                let messagesCursorCreatedAt = direction === MessageLoadDirection.OLDER
                    ? get().messagesOlderCursorCreatedAt
                    : get().messagesNewerCursorCreatedAt;
                let messagesCursorId = direction === MessageLoadDirection.OLDER
                    ? get().messagesOlderCursorId
                    : get().messagesNewerCursorId;

                if (reset) {
                    messagesCursorCreatedAt = undefined;
                    messagesCursorId = undefined;
                }

                const response = await fetchMessages(
                    conversationId,
                    {
                        size: size,
                        cursorCreatedAt: messageId ? undefined : messagesCursorCreatedAt,
                        cursorId: messageId ? undefined : messagesCursorId,
                        direction: reset ? MessageLoadDirection.OLDER : direction,
                        messageId: messageId
                    }
                );
                if (response.success) {
                    set((state) => {
                        const oldMessages = state.messages || [];
                        const newMessages: ChatMessage[] = response.data.messages || [];

                        const oldIds = new Set(oldMessages.map((m) => m.id));
                        const filteredNewMessages = newMessages.filter((m) => !oldIds.has(m.id));

                        const reversedNewMessages = filteredNewMessages.reverse();
                        if (messageId) {
                            console.log("response", response)
                            return {
                                messages: reversedNewMessages,
                                anchorMessageId: response.data.anchorMessageId,
                                messagesHasOlder: response.data.hasOlder,
                                messagesOlderCursorCreatedAt: response.data.olderCursorCreatedAt,
                                messagesOlderCursorId: response.data.olderCursorId,
                                messagesHasNewer: response.data.hasNewer,
                                messagesNewerCursorCreatedAt: response.data.newerCursorCreatedAt,
                                messagesNewerCursorId: response.data.newerCursorId,
                                messagesHasFetchedOnce: state.messagesHasFetchedOnce || true,
                            }
                        }
                        if (direction === MessageLoadDirection.OLDER) {
                            const updatedMessages = [...reversedNewMessages, ...oldMessages];
                            return {
                                messages: updatedMessages,
                                messagesHasOlder: response.data.hasOlder,
                                messagesOlderCursorCreatedAt: response.data.olderCursorCreatedAt,
                                messagesOlderCursorId: response.data.olderCursorId,
                                messagesHasFetchedOnce: state.messagesHasFetchedOnce || true,
                            }
                        } else {
                            const updatedMessages = [...oldMessages, ...reversedNewMessages];
                            return {
                                messages: updatedMessages,
                                messagesHasNewer: response.data.hasNewer,
                                messagesNewerCursorCreatedAt: response.data.newerCursorCreatedAt,
                                messagesNewerCursorId: response.data.newerCursorId,
                                messagesHasFetchedOnce: state.messagesHasFetchedOnce || true,
                            }
                        }
                    })
                }
                return {success: response.success, message: response.message}
            }, "Failed to fetch messages");},

        setScrolledToAnchor: () => {
            set({hasScrolledToAnchorOnce: true})
        },

        addMessage: (message: ChatMessage, conversationId: string) => {
            const myUserId = authStore.getState().user?.id;
            if (!myUserId) return;
            if (conversationId !== get().currentConversation?.id) return;

            const myMessage = myUserId === message.senderId
            if (get().messagesHasNewer && !myMessage) {
                set((state) => {
                    const exists = state.newMessages.some((m) => m.id === message.id);
                    if (exists) return state;

                    return {
                        newMessages: [...state.newMessages, message],
                    };
                })
                return;
            }
            set((state) => {
                const exists = state.messages.some((m) => m.id === message.id);
                if (exists) return state;

                return {
                    messages: [...state.messages, message],
                };
            });
        },
        resetNewMessages: () => {
            set({newMessages: []});
        },
        resetMessages: (anchorMessageId) => {
            set({...messagesInitialState, anchorMessageId: anchorMessageId});
        }
    }
});

export default currentConversationStore;

const runWithLoadingFlag = async (
    set: (state: Partial<CurrentConversationState>) => void,
    loadingKey: keyof CurrentConversationState,
    fn: () => Promise<ApiResult>,
    fallbackMessage: string
): Promise<ApiResult> => {
    set({ [loadingKey]: true } as Partial<CurrentConversationState>);
    try {
        return await fn();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error?.message);
        }
        return { success: false, message: fallbackMessage };
    } finally {
        set({ [loadingKey]: false } as Partial<CurrentConversationState>);
    }
};

export const useCurrentConversationStore = <T>(
    selector: (state: CurrentConversationState) => T,
    equals?: (a: T, b: T) => boolean
) => useStoreWithEqualityFn(currentConversationStore, selector, equals);
