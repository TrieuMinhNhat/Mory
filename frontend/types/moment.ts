import {UserPreview} from "@/types/user";

export interface Moment {
    id: string,
    user: UserPreview,
    mediaUrl: string,
    audioUrl?: string
    caption?: string,
    visibility: Visibility,
    position?: number,
    dayIndex?: number,
    createdAt: string,
    lastModifiedAt?: string,
    milestone: boolean,
    tags: MomentTag[],
    story?: StoryPreview,
    totalReactions: number,
    reactionPreviews: MomentReaction[],
    myReaction: ReactionType
}

export interface MomentReaction {
    user: UserPreview,
    reactionType: ReactionType
}

export interface Story {
    id: string,
    creator: UserPreview,
    title: string,
    type: StoryType,
    scope: StoryScope,
    visibility: Visibility,
    hasBefore?: boolean,
    hasAfter?: boolean,
    startDate?: string,
    endDate?: string,
    duration?: number,
    members: UserPreview[],
    totalMoments?: number,
}

export interface MomentTag {
    id: string,
    user: UserPreview,
}

export interface MomentPreview {
    id: string,
    mediaUrl: string,
    caption: string,
    position: number,
}

export interface StoryPreview {
    id: string,
    type: StoryType,
    title: string,
    scope: StoryScope,
}

export const enum StoryType {
    BEFORE_AFTER = "BEFORE_AFTER",
    JOURNEY = "JOURNEY",
    CHALLENGE = "CHALLENGE",
    ALBUM = "ALBUM",
}

export enum StoryScope {
    PERSONAL = "PERSONAL",
    GROUP = "GROUP",
}

export enum Visibility {
    ALL_FRIENDS = "ALL_FRIENDS",
    CLOSE_FRIENDS = "CLOSE_FRIENDS",
    PARTNER_ONLY = "PARTNER_ONLY",
    ONLY_ME = "ONLY_ME"
}

export enum ReactionType {
    ANGRY = "ANGRY",
    COLD = "COLD",
    COOL = "COOL",
    HEART = "HEART",
    LAUGH = "LAUGH",
    MONEY = "MONEY",
    SAD = "SAD",
    SHIFTY = "SHIFTY",
    SILENT = "SILENT",
    TIRED = "TIRED",
    WHAT = "WHAT",
}