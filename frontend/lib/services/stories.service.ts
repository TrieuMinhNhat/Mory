import axiosInstance from "@/lib/axios";
import {API_ENDPOINTS} from "@/constants/apiEndpoints";
import {StoryType, Visibility} from "@/types/moment";
import {LeaveStoryAction} from "@/types/story";

interface StoryKeysetParams {
    cursorCreatedAt?: string;
    cursorId?: string;
    size?: number;
    type?: StoryType;
    order?: "ASC" | "DESC";
}

export const fetchStory = async (storyId: string) => {
    const response = await axiosInstance.get(
        API_ENDPOINTS.USER.STORIES.FETCH_STORY(storyId)
    );
    return response.data;
}

export const fetchStoriesByUser = async (
    userId: string,
    { cursorCreatedAt, cursorId, size = 20, type, order = "DESC" }: StoryKeysetParams = {}
) => {
    const response = await axiosInstance.get(
        API_ENDPOINTS.USER.STORIES.FETCH_STORIES_BY_USER_ID(userId),
        {
            params: { cursorCreatedAt, cursorId, size, type, order },
        }
    );
    return response.data;
};

export const fetchAvailableStories = async (
    { cursorCreatedAt, cursorId, size = 20, type, order = "DESC" }: StoryKeysetParams = {}
) => {
    const response = await axiosInstance.get(
        API_ENDPOINTS.USER.STORIES.FETCH_AVAILABLE_STORIES,
        {
            params: { cursorCreatedAt, cursorId, size, type, order },
        }
    );
    return response.data;
}

export interface CreateJourneyStoryRequestBody {
    type: string,
    title: string,
    scope: string,
    visibility: string,
    startDate: string,
    endDate: string,
    memberIds?: string[],
}

export const createJourneyStory = async (data: CreateJourneyStoryRequestBody) => {
    const requestBody = {
        type: data.type,
        title: data.title,
        scope: data.scope,
        visibility: data.visibility,
        startDate: data.startDate,
        endDate: data.endDate,
        memberIds: data.memberIds,
    }
    const response = await axiosInstance.post(
        API_ENDPOINTS.USER.STORIES.CREATE_STORY,
        requestBody
    )
    return response.data;
}

export interface CreateBeforeAfterStoryRequestBody {
    type: string,
    title: string,
    visibility: string,
}

export const createBeforeAfterStory = async (data: CreateBeforeAfterStoryRequestBody) => {
    const requestBody = {
        type: data.type,
        title: data.title,
        visibility: data.visibility,
    }
    const response = await axiosInstance.post(
        API_ENDPOINTS.USER.STORIES.CREATE_STORY,
        requestBody
    )
    return response.data;
}

export interface CreateChallengeStoryRequestBody {
    type: string,
    title: string,
    visibility: string,
    startDate: string,
    endDate: string,
    duration: number
}

export const createChallengeStory = async (data: CreateChallengeStoryRequestBody) => {
    const requestBody = {
        type: data.type,
        title: data.title,
        visibility: data.visibility,
        startDate: data.startDate,
        endDate: data.endDate,
        duration: data.duration,
    }
    const response = await axiosInstance.post(
        API_ENDPOINTS.USER.STORIES.CREATE_STORY,
        requestBody
    )
    return response.data;
}

export interface CreateAlbumStoryRequestBody {
    type: string,
    title: string,
    scope: string,
    visibility: string,
    memberIds?: string[],
}

export const createAlbumStory = async (data: CreateAlbumStoryRequestBody) => {
    const requestBody = {
        type: data.type,
        title: data.title,
        scope: data.scope,
        visibility: data.visibility,
        memberIds: data.memberIds,
    }
    const response = await axiosInstance.post(
        API_ENDPOINTS.USER.STORIES.CREATE_STORY,
        requestBody
    )
    return response.data;
}

export const dissolveStory = async (storyId: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.USER.STORIES.DISSOLVE(storyId));
    return response.data;
}

export const deleteStory = async (storyId: string) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.USER.STORIES.DELETE(storyId));
    return response.data;
}

export interface UpdateStoryRequestBody {
    title: string,
    visibility?: Visibility,
    startDate?: string,
    endDate?: string,
}

export const updateStory = async (storyId: string, data: UpdateStoryRequestBody) => {
    const requestBody = {
        title: data.title,
        visibility: data.visibility,
        startDate: data.startDate,
        endDate: data.endDate,
    }
    const response = await axiosInstance.patch(
        API_ENDPOINTS.USER.STORIES.UPDATE(storyId),
        requestBody
    )
    return response.data;
}

export const leaveStory = async (storyId: string, leaveStoryAction: LeaveStoryAction) => {
    const requestBody = {
        action: leaveStoryAction,
    }
    const response = await axiosInstance.post(
        API_ENDPOINTS.USER.STORIES.MEMBERS.LEAVE(storyId),
        requestBody
    );
    return response.data;
}

export interface AddStoryMembersRequestBody {
    newMemberIds: string[],
}

export const addStoryMembers = async (storyId: string, data: AddStoryMembersRequestBody) => {
    const requestBody = {
        newMemberIds: data.newMemberIds,
    }
    const response = await axiosInstance.post(
        API_ENDPOINTS.USER.STORIES.MEMBERS.ADD(storyId),
        requestBody
    );
    return response.data;
}

export interface KickStoryMembersRequestBody {
    memberIds: string[],
}

export const kickStoryMembers = async (storyId: string, data: KickStoryMembersRequestBody) => {
    const requestBody = {
        memberIds: data.memberIds,
    }
    const response = await axiosInstance.post(
        API_ENDPOINTS.USER.STORIES.MEMBERS.KICK(storyId),
        requestBody
    )
    return response.data;
}