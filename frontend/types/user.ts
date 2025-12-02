import {Connection} from "@/types/connections";

export interface UpdateUserAvatarProps {
    imageFile: File;
}

export interface User {
    id: string;
    email: string;
    profile: UserProfile;
    roleCode: string;
    verified: boolean;
}

export interface UserProfile {
    displayName: string;
    avatarUrl?: string;
    onboarded: boolean;
}

export interface UserProfileApiResponse {
    displayName?: string;
    avatarUrl?: string;
}

export interface UserDetails {
    displayName: string;
    avatarUrl?: string;
    connectionCount: number;
    connection: Connection;
}
export interface UserPreview {
    id: string;
    displayName: string,
    avatarUrl?: string
}

export interface UserPreviewWithMutualConnections {
    user: UserPreview,
    mutualConnections:UserPreview[],
}