import {UserPreview} from "@/types/user";
import {ConnectionType} from "@/types/connections";

export interface Notification {
    id: string,
    userId: string,
    type: NotificationType,
    fromUser: UserPreview,
    metadata: any,
    createdAt: string,
}

export interface ConnectRequestMetadata {
    variant: ConnectionNotificationVariant,
    fromUserId: string
}

export interface ChangeTypeRequestMetadata {
    variant: ConnectionNotificationVariant,
    fromUserId: string,
    fromConnectionType: ConnectionType,
    toConnectionType: ConnectionType,
}

export const enum ConnectionNotificationVariant {
    CONNECT = "CONNECT",
    CHANGE_TYPE = "CHANGE_TYPE"
}
export const enum NotificationType {
    SYSTEM = "SYSTEM",
    CONNECTION_REQUEST = "CONNECTION_REQUEST",
    CONNECTION_ACCEPTED = "CONNECTION_ACCEPTED",
    MESSAGE = "MESSAGE",
    MOMENT_REACTIONS = "MOMENT_REACTIONS",
    STORY_INVITED = "STORY_INVITED",
    STORY_DELETED = "STORY_DELETED",
}