import {Story, StoryType} from "@/types/moment";
import Journey from "@/components/user/story/icons/Journey";
import BeforeAfter from "@/components/user/story/icons/BeforeAfter";
import Challenge from "@/components/user/story/icons/Challenge";
import Album from "@/components/user/story/icons/Album";
import {ElementType} from "react";

const storyTypeMap = {
    [StoryType.JOURNEY]: Journey,
    [StoryType.BEFORE_AFTER]: BeforeAfter,
    [StoryType.CHALLENGE]: Challenge,
    [StoryType.ALBUM]: Album,
};

export function toStoryType(type?: string): StoryType | undefined {
    if (!type) return undefined;
    switch (type.toUpperCase()) {
        case "BEFORE_AFTER":
            return StoryType.BEFORE_AFTER;
        case "JOURNEY":
            return StoryType.JOURNEY;
        case "CHALLENGE":
            return StoryType.CHALLENGE;
        case "ALBUM":
            return StoryType.ALBUM;
        default:
            return undefined;
    }
}

export function getStoryTypeIcon(type: StoryType):ElementType {
    return storyTypeMap[type] ?? Album;
}

export enum StoryStatus {
    UPCOMING,
    ONGOING,
    ENDED,
    FAILED,
    COMPLETED,
    NONE
}

export function getStoryStatus(story: Story): StoryStatus {
    if (story.type === StoryType.CHALLENGE) {
        if (!story.startDate || !story.endDate || !story.duration) return StoryStatus.NONE;
        const now = new Date();
        const start = new Date(story.startDate);
        const end = new Date(story.endDate);
        now.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const nowTime = now.getTime();
        const startTime = start.getTime();
        const endTime = end.getTime();

        if (nowTime < startTime) return StoryStatus.UPCOMING;
        if (story.momentsInfo) {

            if (story.momentsInfo.total >= story.duration) return StoryStatus.COMPLETED;
            if (nowTime > endTime && story.momentsInfo.total < story.duration) return StoryStatus.FAILED;

            const daysLeft = Math.max(0, Math.ceil((endTime - nowTime) / (1000 * 60 * 60 * 24)));

            if (daysLeft + 1 < story.duration - story.momentsInfo.total) return StoryStatus.FAILED;
        }

        return StoryStatus.ONGOING;
    } else if (story.type === StoryType.BEFORE_AFTER) {
        if (story.momentsInfo?.total && story.momentsInfo.total === 2) return StoryStatus.ENDED;
        return StoryStatus.ONGOING;
    } else if (story.type === StoryType.JOURNEY) {
        if (!story.startDate || !story.endDate) return StoryStatus.NONE;
        const now = new Date();
        const start = new Date(story.startDate);
        const end = new Date(story.endDate);
        now.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const nowTime = now.getTime();
        const startTime = start.getTime();
        const endTime = end.getTime();

        if (nowTime < startTime) return StoryStatus.UPCOMING;
        if (nowTime > endTime) return StoryStatus.ENDED;
        return StoryStatus.ONGOING;
    }
    return StoryStatus.NONE;
}