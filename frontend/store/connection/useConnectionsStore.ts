import {ApiResult} from "@/types/auth";
import {createStore, StoreApi} from "zustand/vanilla";
import {useStoreWithEqualityFn} from "zustand/traditional";
import {
    Connection,
    ConnectionRequest,
    ConnectionStatus,
    ConnectionType,
    getOtherUserFromConnection
} from "@/types/connections";
import {
    acceptChangeConnectionTypeRequest,
    acceptConnectRequest,
    blockUserConnection,
    cancelRequest, downgradeConnectionType,
    fetchReceivedRequest,
    fetchSentRequest,
    fetchSuggestedConnections,
    fetchUserConnections,
    rejectRequest,
    removeConnection, sendChangeConnectionTypeRequest,
    sendConnectRequest,
    unblockUserConnection,
} from "@/lib/services/connections.service";
import {UserPreviewWithMutualConnections} from "@/types/user";
import {authStore} from "@/store/useAuthStore";
import storyDetailsStore from "@/store/story/useStoryDetailsStore";
import userProfileStore from "@/store/profie/useUserProfileStore";

interface UserConnectionsState {
    // --- Received requests ---
    receivedRequests: ConnectionRequest[];
    receivedRequestsHasNext: boolean;
    receivedRequestsCursorCreatedAt?: string;
    receivedRequestsCursorId?: string;
    isFetchingReceivedRequest: boolean;
    receivedRequestsHasFetchedOnce:boolean,
    fetchReceivedRequest: (size?: number, type?: string) => Promise<ApiResult>;

    // --- Sent requests ---
    sentRequests: ConnectionRequest[];
    sentRequestsHasNext: boolean;
    sentRequestsCursorCreatedAt?: string;
    sentRequestsCursorId?: string;
    isFetchingSentRequest: boolean;
    sentRequestsHasFetchedOnce: boolean;
    fetchSentRequest: (size?: number, type?: string) => Promise<ApiResult>;

    // --- Suggested connections ---
    suggestedConnections: UserPreviewWithMutualConnections[];
    suggestedConnectionsHasNext: boolean;
    suggestedConnectionsCursorCreatedAt?: string;
    suggestedConnectionsCursorId?: string;
    isFetchingSuggestedConnections: boolean;
    suggestedConnectionHasFetchedOnce: boolean;
    fetchSuggestedConnections: (size?: number) => Promise<ApiResult>;

    // --- Blocked connections ---
    blockedConnections: Connection[];
    blockedConnectionsHasNext: boolean;
    blockedConnectionsCursorCreatedAt?: string;
    blockedConnectionsCursorId?: string;
    isFetchingBlockedConnections: boolean;
    blockedConnectionsHasFetchedOnce: boolean;
    fetchBlockedConnections: (size?: number) => Promise<ApiResult>;

    // --- User connections ---
    connections: Connection[];
    typeFilter: ConnectionType | undefined;
    connectionsHasNext: boolean;
    connectionsCursorCreatedAt?: string;
    connectionsCursorId?: string;
    isFetchingConnections: boolean;
    connectionsHasFetchedOnce: boolean;
    fetchConnections: ({size, type, status, reset}:{size?: number, type?: ConnectionType, status?: ConnectionStatus, reset?: boolean}) => Promise<ApiResult>;
    resetConnections: () => void;

    // --- Request Action ---
    processingRequestIds: Set<string>;
    acceptRequest: (requestId: string) => Promise<ApiResult>;
    rejectRequest: (requestId: string) => Promise<ApiResult>;
    cancelRequest: (requestId: string) => Promise<ApiResult>;

    // --- Connection Action ---
    processingUserIds: Set<string>;
    sendRequest: (
        recipientId: string,
        code?: string,
        message?: string
    ) => Promise<ApiResult>;
    downgradeConnectionType: (
        recipientId: string,
        newType: ConnectionType,
    ) => Promise<ApiResult>;
    blockUser: (targetUserId: string) => Promise<ApiResult>;
    unblockUser: (targetUserId: string) => Promise<ApiResult>;
    removeConnection: (targetUserId: string) => Promise<ApiResult>;

    // --- Change Type Request ---
    sendChangeTypeRequest: (
        recipientId: string,
        newType: ConnectionType,
        message: string
    ) => Promise<ApiResult>;
    acceptChangeTypeRequest: (requestId: string) => Promise<ApiResult>;
}

const userConnectionsStore = createStore<UserConnectionsState>()((set, get) => ({
    // --- Received requests ---
    receivedRequests: [],
    receivedRequestsHasNext: false,
    receivedRequestsCursorCreatedAt: undefined,
    receivedRequestsCursorId: undefined,
    receivedRequestsHasFetchedOnce: false,
    isFetchingReceivedRequest: false,

    fetchReceivedRequest: async (size = 10, type) => {
        const { receivedRequestsCursorCreatedAt, receivedRequestsCursorId} = get();
        return runWithLoadingFlag(set, "isFetchingReceivedRequest", async () => {
            const response = await fetchReceivedRequest({
                cursorCreatedAt: receivedRequestsCursorCreatedAt,
                cursorId: receivedRequestsCursorId,
                size,
                type,
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            if (response.success) {
                set((state) => {
                    const existingIds = new Set(state.receivedRequests.map(r => r.id));
                    const newItems = (response.data.requests ?? []).filter((r: ConnectionRequest) => !existingIds.has(r.id));
                    return {
                        receivedRequests: [...state.receivedRequests, ...newItems],
                        receivedRequestsHasNext: response.data.hasNext,
                        receivedRequestsCursorCreatedAt: response.data.nextCursorCreatedAt,
                        receivedRequestsCursorId: response.data.nextCursorId,
                        receivedRequestsHasFetchedOnce: state.receivedRequestsHasFetchedOnce || true
                    };
                });
            }
            return { success: response.success, message: response.message };
        }, "Failed to fetch received requests");
    },

    // --- Sent requests ---
    sentRequests: [],
    sentRequestsHasNext: false,
    sentRequestsCursorCreatedAt: undefined,
    sentRequestsCursorId: undefined,
    isFetchingSentRequest: false,
    sentRequestsHasFetchedOnce: false,

    fetchSentRequest: async (size = 10, type) => {
        const { sentRequestsCursorCreatedAt, sentRequestsCursorId } = get();
        return runWithLoadingFlag(set, "isFetchingSentRequest", async () => {
            const response = await fetchSentRequest({
                cursorCreatedAt: sentRequestsCursorCreatedAt,
                cursorId: sentRequestsCursorId,
                size,
                type,
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            if (response.success) {
                set((state) => {
                    const existingIds = new Set(state.sentRequests.map(r => r.id));
                    const newItems = (response.data.requests ?? []).filter((r: ConnectionRequest) => !existingIds.has(r.id));
                    return {
                        sentRequests: [...state.sentRequests, ...newItems],
                        sentRequestsHasNext: response.data.hasNext,
                        sentRequestsCursorCreatedAt: response.data.nextCursorCreatedAt,
                        sentRequestsCursorId: response.data.nextCursorId,
                        sentRequestsHasFetchedOnce: state.sentRequestsHasFetchedOnce || true
                    };
                });
            }
            return { success: response.success, message: response.message };
        }, "Failed to fetch sent requests");
    },

    // --- Suggested connections ---
    suggestedConnections: [],
    suggestedConnectionsHasNext: false,
    suggestedConnectionsCursorCreatedAt: undefined,
    suggestedConnectionsCursorId: undefined,
    isFetchingSuggestedConnections: false,
    suggestedConnectionHasFetchedOnce: false,

    fetchSuggestedConnections: async (size = 10) => {
        const { suggestedConnectionsCursorCreatedAt, suggestedConnectionsCursorId } = get();
        return runWithLoadingFlag(set, "isFetchingSuggestedConnections", async () => {
            const response = await fetchSuggestedConnections({
                cursorCreatedAt: suggestedConnectionsCursorCreatedAt,
                cursorId: suggestedConnectionsCursorId,
                size,
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            if (response.success) {
                set((state) => {
                    const existingIds = new Set(state.suggestedConnections.map(r => r.user.id));
                    const newItems = (response.data.suggestions ?? []).filter(
                        (r: UserPreviewWithMutualConnections) => !existingIds.has(r.user.id)
                    );
                    return {
                        suggestedConnections: [...state.suggestedConnections, ...newItems],
                        suggestedConnectionsHasNext: response.data.hasNext,
                        suggestedConnectionsCursorCreatedAt: response.data.nextCursorCreatedAt,
                        suggestedConnectionsCursorId: response.data.nextCursorId,
                        suggestedConnectionHasFetchedOnce: state.suggestedConnectionHasFetchedOnce || true
                    };
                });
            }
            return { success: response.success, message: response.message };
        }, "Failed to fetch suggested connections");
    },

    // --- Blocked connections ---
    blockedConnections: [],
    blockedConnectionsHasNext: false,
    blockedConnectionsCursorCreatedAt: undefined,
    blockedConnectionsCursorId: undefined,
    isFetchingBlockedConnections: false,
    blockedConnectionsHasFetchedOnce: false,

    fetchBlockedConnections: async (size = 10) => {
        const { blockedConnectionsCursorCreatedAt, blockedConnectionsCursorId } = get();
        const { user } = authStore.getState();
        if (!user) return { success: false, message: "User not authenticated" } as ApiResult;

        return runWithLoadingFlag(set, "isFetchingBlockedConnections", async () => {
            const response = await fetchUserConnections(user.id, {
                cursorCreatedAt: blockedConnectionsCursorCreatedAt,
                cursorId: blockedConnectionsCursorId,
                size,
                status: ConnectionStatus.BLOCKED,
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            if (response.success) {
                set((state) => {
                    const existingIds = new Set(state.blockedConnections.map(c => c.id));
                    const newItems = (response.data.connections ?? []).filter(
                        (c: Connection) => !existingIds.has(c.id)
                    );
                    return {
                        blockedConnections: [...state.blockedConnections, ...newItems],
                        blockedConnectionsHasNext: response.data.hasNext,
                        blockedConnectionsCursorCreatedAt: response.data.nextCursorCreatedAt,
                        blockedConnectionsCursorId: response.data.nextCursorId,
                        blockedConnectionsHasFetchedOnce: state.blockedConnectionsHasFetchedOnce || true,
                    };
                });
            }

            return { success: response.success, message: response.message };
        }, "Failed to fetch blocked connections");
    },


    // --- User connections ---
    connections: [],
    typeFilter: undefined,
    connectionsHasNext: false,
    connectionsCursorCreatedAt: undefined,
    connectionsCursorId: undefined,
    isFetchingConnections: false,
    connectionsHasFetchedOnce: false,

    fetchConnections: async ({size = 50, type, status, reset = false}) => {
        if (reset) get().resetConnections();
        const { connectionsCursorCreatedAt, connectionsCursorId } = get();

        set({typeFilter: type})
        const { user } = authStore.getState();
        if (!user) return { success: false, message: "User not authenticated" } as ApiResult;

        return runWithLoadingFlag(set, "isFetchingConnections", async () => {
            const response = await fetchUserConnections(user.id, {
                cursorCreatedAt: connectionsCursorCreatedAt,
                cursorId: connectionsCursorId,
                size,
                type,
                status,
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            if (response.success) {
                set((state) => {
                    const existingIds = new Set(state.connections.map(c => c.id));
                    const newItems = (response.data.connections ?? []).filter((c: Connection) => !existingIds.has(c.id));
                    return {
                        connections: [...state.connections, ...newItems],
                        connectionsHasNext: response.data.hasNext,
                        connectionsCursorCreatedAt: response.data.nextCursorCreatedAt,
                        connectionsCursorId: response.data.nextCursorId,
                        connectionsHasFetchedOnce: state.connectionsHasFetchedOnce || true
                    };
                });
            }
            return { success: response.success, message: response.message };
        }, "Failed to fetch user connections");
    },

    resetConnections: () => {
        set({
            connections: [],
            typeFilter: undefined,
            connectionsHasNext: false,
            connectionsCursorCreatedAt: undefined,
            connectionsCursorId: undefined,
            isFetchingConnections: false,
            connectionsHasFetchedOnce: false,
        })
    },

    // --- Change Type Request ---
    sendChangeTypeRequest: async (recipientId: string, newType: ConnectionType, message: string) =>
        runWithLoadingSet(
            set,
            "processingUserIds",
            async () => {
                const response = await sendChangeConnectionTypeRequest({
                    recipientId,
                    newType,
                    message,
                });

                await new Promise(resolve => setTimeout(resolve, 1500));

                if (response.success) {
                    const request = response.data;
                    set((state) => {
                        const exists = state.sentRequests.some((r) => r.id === request.id);
                        return {
                            sentRequests: exists
                                ? state.sentRequests.map((r) => (r.id === request.id ? request : r))
                                : [request, ...state.sentRequests],
                        };
                    });
                }

                return { success: response.success, message: response.message, data: response.data };
            },
            recipientId,
            "Failed to send change connection type request"
        ),

    acceptChangeTypeRequest: async (requestId: string) =>
        runWithLoadingSet(
            set,
            "processingRequestIds",
            async () => {
                const response = await acceptChangeConnectionTypeRequest(requestId);
                await new Promise(resolve => setTimeout(resolve, 1500));

                if (response.success) {
                    const updatedConnection = response.data;
                    set((state) => ({
                        connections: state.connections.map((c) =>
                            c.id === updatedConnection.id
                                ? { ...c, connectionType: updatedConnection.connectionType }
                                : c
                        ),
                        receivedRequests: state.receivedRequests.filter(
                            (r) => r.id !== requestId
                        ),
                    }));

                    const otherUser = getOtherUserFromConnection(updatedConnection);
                    storyDetailsStore.getState().updateConnectionStatus(otherUser.id, {
                        connectionType: updatedConnection.connectionType,
                        status: updatedConnection.status
                    })
                    userProfileStore.getState().updateUserDetailsConnection(otherUser.id, {
                        connectionType: updatedConnection.connectionType,
                        status: updatedConnection.status
                    })
                    userProfileStore.getState().updateUserConnection(otherUser.id, {
                        connectionType: updatedConnection.connectionType,
                        status: updatedConnection.status
                    })
                }

                return { success: response.success, message: response.message, data: response.data };
            },
            requestId,
            "Failed to accept change type request"
        ),

    downgradeConnectionType: async (recipientId: string, newType: ConnectionType) =>
        runWithLoadingSet(
            set,
            "processingUserIds",
            async () => {
                const response = await downgradeConnectionType({
                    recipientId,
                    newType
                });

                await new Promise(resolve => setTimeout(resolve, 1500));

                if (response.success) {
                    const updatedConnection = response.data;
                    set((state) => ({
                        connections: state.connections.map((c) =>
                            c.id === updatedConnection.id
                                ? { ...c, connectionType: updatedConnection.connectionType }
                                : c
                        )
                    }));
                    storyDetailsStore.getState().updateConnectionStatus(recipientId, {
                        connectionType: updatedConnection.connectionType
                    })
                    userProfileStore.getState().updateUserDetailsConnection(recipientId, {
                        connectionType: updatedConnection.connectionType,
                        status: updatedConnection.status
                    })
                    userProfileStore.getState().updateUserConnection(recipientId, {
                        connectionType: updatedConnection.connectionType,
                        status: updatedConnection.status
                    })
                }
                return { success: response.success, message: response.message, data: response.data };
            },
            recipientId,
            "Failed to downgrade connection type"
        ),

    // --- Action loading ---
    processingRequestIds: new Set<string>(),

    acceptRequest: async (requestId: string) =>
        runWithLoadingSet(
            set,
            "processingRequestIds",
            async () => {
                const response = await acceptConnectRequest(requestId);
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (response.success) {
                    const newConnection: Connection = response.data;
                    set((state) => {
                        const exists = state.connections.some(
                            (c) => c.id === newConnection.id
                        );
                        return {
                            receivedRequests: state.receivedRequests.filter(
                                (r) => r.id !== requestId
                            ),
                            connections: exists
                                ? state.connections
                                : [newConnection, ...state.connections],
                        };
                    });
                    const otherUser = getOtherUserFromConnection(newConnection);
                    storyDetailsStore.getState().updateConnectionStatus(otherUser.id, {
                        connectionType: newConnection.connectionType,
                        status: newConnection.status,
                        mutualConnections: newConnection.mutualConnections
                    })
                    userProfileStore.getState().updateUserDetailsConnection(otherUser.id, {
                        connectionType: newConnection.connectionType,
                        status: newConnection.status,
                        mutualConnections: newConnection.mutualConnections
                    })
                    userProfileStore.getState().updateUserConnection(otherUser.id, {
                        connectionType: newConnection.connectionType,
                        status: newConnection.status,
                        mutualConnections: newConnection.mutualConnections
                    })
                }
                return { success: response.success, message: response.message, data: response.data };
            },
            requestId,
            "Failed to accept request"
        ),

    rejectRequest: async (requestId: string) =>
        runWithLoadingSet(
            set,
            "processingRequestIds",
            async () => {
                const response = await rejectRequest(requestId);
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (response.success) {
                    set((state) => ({
                        receivedRequests: state.receivedRequests.filter(
                            (r) => r.id !== requestId
                        ),
                    }));
                }
                return { success: response.success, message: response.message };
            },
            requestId,
            "Failed to reject request"
        ),

    cancelRequest: async (requestId: string) =>
        runWithLoadingSet(
            set,
            "processingRequestIds",
            async () => {
                const response = await cancelRequest(requestId);
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (response.success) {
                    set((state) => ({
                        sentRequests: state.sentRequests.filter((r) => r.id !== requestId),
                    }));
                }
                return { success: response.success, message: response.message };
            },
            requestId,
            "Failed to cancel request"
        ),

    processingUserIds: new Set<string>(),

    sendRequest: async (recipientId: string, code?: string, message?: string) =>
        runWithLoadingSet(
            set,
            "processingUserIds",
            async () => {
                const response = await sendConnectRequest({ recipientId, code, message });
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (response.success) {
                    const connectionRequest: ConnectionRequest = response.data;
                    set((state) => {
                        const exists = state.sentRequests.some(
                            (r) => r.id === connectionRequest.id
                        );
                        const recipientId = connectionRequest.recipient.id;

                        return {
                            sentRequests: exists
                                ? state.sentRequests
                                : [connectionRequest, ...state.sentRequests],
                            suggestedConnections: state.suggestedConnections.filter(
                                (s) => s.user.id !== recipientId
                            ),
                        };
                    });
                }
                return { success: response.success, message: response.message, data: response.data };
            },
            recipientId,
            "Failed to send connection request"
        ),

    blockUser: async (targetUserId: string) =>
        runWithLoadingSet(
            set,
            "processingUserIds",
            async () => {
                const response = await blockUserConnection(targetUserId);
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (response.success) {
                    const blockedConnection: Connection = response.data;
                    set((state) => {
                        const updatedConnections = state.connections.filter(
                            (c) => getOtherUserFromConnection(c).id !== targetUserId
                        );

                        const existsInBlocked = state.blockedConnections.some(
                            (c) => getOtherUserFromConnection(c).id === targetUserId
                        );
                        const updatedBlocked = existsInBlocked
                            ? state.blockedConnections
                            : [blockedConnection, ...state.blockedConnections];

                        return {
                            connections: updatedConnections,
                            blockedConnections: updatedBlocked,
                        };
                    });
                    storyDetailsStore.getState().updateConnectionStatus(targetUserId, {
                        connectionType: blockedConnection.connectionType,
                        status: blockedConnection.status
                    })
                    userProfileStore.getState().updateUserDetailsConnection(targetUserId, {
                        connectionType: blockedConnection.connectionType,
                        status: blockedConnection.status
                    })
                    userProfileStore.getState().updateUserConnection(targetUserId, {
                        connectionType: blockedConnection.connectionType,
                        status: blockedConnection.status
                    })
                }
                return { success: response.success, message: response.message };
            },
            targetUserId,
            "Failed to block user"
        ),

    unblockUser: async (targetUserId: string) =>
        runWithLoadingSet(
            set,
            "processingUserIds",
            async () => {
                const response = await unblockUserConnection(targetUserId);
                const unblockedConnection: Connection = response.data;
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (response.success) {
                    set((state) => ({
                        blockedConnections: state.blockedConnections.filter(
                            (c) => getOtherUserFromConnection(c).id !== targetUserId
                        ),
                    }));
                    storyDetailsStore.getState().updateConnectionStatus(targetUserId, {
                        connectionType: unblockedConnection.connectionType,
                        status: unblockedConnection.status
                    })
                    userProfileStore.getState().updateUserDetailsConnection(targetUserId, {
                        connectionType: unblockedConnection.connectionType,
                        status: unblockedConnection.status
                    })
                    userProfileStore.getState().updateUserConnection(targetUserId, {
                        connectionType: unblockedConnection.connectionType,
                        status: unblockedConnection.status
                    })
                }
                return { success: response.success, message: response.message };
            },
            targetUserId,
            "Failed to unblock user"
        ),

    removeConnection: async (targetUserId: string) =>
        runWithLoadingSet(
            set,
            "processingUserIds",
            async () => {
                const response = await removeConnection(targetUserId);
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (response.success) {
                    set((state) => ({
                        connections: state.connections.filter(
                            (c) => getOtherUserFromConnection(c).id !== targetUserId
                        ),
                    }));
                    storyDetailsStore.getState().removeConnectionStatus(targetUserId)
                    userProfileStore.getState().updateUserDetailsConnection(targetUserId, {
                        connectionType: undefined,
                        status: undefined
                    })
                    userProfileStore.getState().updateUserConnection(targetUserId, {
                        connectionType: undefined,
                        status: undefined
                    })
                }
                return { success: response.success, message: response.message };
            },
            targetUserId,
            "Failed to remove connection"
        ),
}));

const runWithLoadingFlag = async (
    set: (state: Partial<UserConnectionsState>) => void,
    loadingKey: keyof UserConnectionsState,
    fn: () => Promise<ApiResult>,
    fallbackMessage: string
): Promise<ApiResult> => {
    set({ [loadingKey]: true } as Partial<UserConnectionsState>);
    try {
        return await fn();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error?.message);
        }
        return { success: false, message: fallbackMessage };
    } finally {
        set({ [loadingKey]: false } as Partial<UserConnectionsState>);
    }
};

const runWithLoadingSet = async <T extends object>(
    set: StoreApi<T>["setState"],
    key: keyof T,
    fn: () => Promise<ApiResult>,
    id: string,
    fallbackMessage: string
): Promise<ApiResult> => {
    // Add ID vào Set
    set((state: T) => {
        const newSet = new Set((state[key] as Set<string>) ?? []);
        newSet.add(id);
        return { [key]: newSet } as Partial<T>;
    });

    try {
        return await fn();
    } catch (error: unknown) {
        if (error instanceof Error) console.error(error.message);
        return { success: false, message: fallbackMessage };
    } finally {
        // Xóa ID khỏi Set
        set((state: T) => {
            const newSet = new Set((state[key] as Set<string>) ?? []);
            newSet.delete(id);
            return { [key]: newSet } as Partial<T>;
        });
    }
};

export const useUserConnectionsStore = <T>(
    selector: (state: UserConnectionsState) => T,
    equals?: (a: T, b: T) => boolean
) => useStoreWithEqualityFn(userConnectionsStore, selector, equals);
