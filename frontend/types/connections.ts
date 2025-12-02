import {UserPreview} from "@/types/user";
import {authStore} from "@/store/useAuthStore";

export interface ConnectionRequest {
    id: string;
    newConnectionType: ConnectionType;
    oldConnectionType: ConnectionType;
    requester: UserPreview,
    recipient: UserPreview,
    mutualConnections: UserPreview[],
    message: string;
    status: RequestStatus;
    createdAt: string;
}

export interface Connection {
    id: string;
    connectionType: ConnectionType;
    user1: UserPreview,
    user2: UserPreview,
    mutualConnections: UserPreview[],
    status: ConnectionStatus,
    createdAt: string;
}

export interface ConnectionLimit {
    selfExceeded: boolean
}

export interface RequestAlreadyPending {
    hasPendingRequest: boolean,
}

export interface ConnectionTypeStatus {
    connectionType?: ConnectionType;
    status?: ConnectionStatus;
    mutualConnections: UserPreview[],
}

export const enum ConnectionStatus {
    CONNECTED = "CONNECTED",
    BLOCKED = "BLOCKED",
    INACTIVE = "INACTIVE",
}

export const enum RequestStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    CANCELED = "CANCELED"
}

export enum ConnectionType {
    FRIEND = "FRIEND",
    CLOSE_FRIEND = "CLOSE_FRIEND",
    SPECIAL = "SPECIAL"
}

export function getOtherUserFromConnection(connection: Connection): UserPreview {
    const { user } = authStore.getState();
    if (!user) throw new Error("No auth user found");

    if (!connection.user2) return connection.user1;

    return connection.user1.id === user.id ? connection.user2 : connection.user1;
}
