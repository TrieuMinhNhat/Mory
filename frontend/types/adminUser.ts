import {UserProfile} from "@/types/user";

export interface AdminUser {
    id: string,
    email: string,
    profile: UserProfile;
    providers: string[],
    roleCode: RoleCode
    createdAt: string,
    isPasswordVerified: boolean,
    isDeleted: boolean,
    isBlocked: boolean,
}

export enum RoleCode {
    ADMIN = "ADMIN",
    USER = "USER",
    MODERATOR = "MODERATOR"
}

export interface UsersStat {
    totalUsers: StatsWithDiff;
    activeUsers: StatsWithDiff;
    pendingUsers: StatsWithDiff;
    deletedUsers: StatsWithDiff;
}

interface StatsWithDiff {
    value: number,
    diff: number
}



export interface BlockLevel {
    name: string,
    durationSeconds: number
}

export const blockLevels: BlockLevel[] = [
    {
        name: "LOW",
        durationSeconds: 30*60
    },
    {
        name: "MEDIUM",
        durationSeconds: 60*60*24
    },
    {
        name: "HIGH",
        durationSeconds: 60*60*24*7
    },
    {
        name: "CRITICAL",
        durationSeconds: 60*60*24*30
    },
    {
        name: "PERMANENT",
        durationSeconds: -1
    }
]

export interface StatRow {
    date: string
    count: number
}

export interface ColumnVisibility {
    joinedDate: boolean,
    role: boolean,
    providers: boolean,
    status: boolean,
    actions: boolean,
}

export interface ColumnWidth {
    basicInformation: string,
    joinedDate: string;
    role: string;
    providers: string;
    status: string;
    actions: string;
}

export interface ColumnLabel {
    basicInformation: string,
    joinedDate: string;
    role: string;
    providers: string;
    status: string;
    actions: string;
}

export const columnLabels: ColumnLabel = {
    basicInformation: "users_page.columns.label.basic_information",
    joinedDate: "users_page.columns.label.joined_date",
    role: "users_page.columns.label.role",
    providers: "users_page.columns.label.providers",
    status: "users_page.columns.label.status",
    actions: "users_page.columns.label.actions",
}
export const defaultColumnWidths: ColumnWidth = {
    basicInformation: "1fr",
    joinedDate: "120px",
    role: "120px",
    providers: "120px",
    status: "120px",
    actions: "80px"
};


export const defaultColumnVisibility: ColumnVisibility = {
    joinedDate: true,
    role: true,
    providers: true,
    status: true,
    actions: true
};

