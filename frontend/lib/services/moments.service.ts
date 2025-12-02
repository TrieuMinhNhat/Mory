import axiosInstance from "@/lib/axios";
import {API_ENDPOINTS} from "@/constants/apiEndpoints";
import {CreateStandAloneFormValue, CreateStoryMomentFormValue} from "@/lib/validations/moment.validation";
import {uploadToCloudinary} from "@/lib/services/upload.service";
import {FOLDER} from "@/constants";
import {ReactionType, Visibility} from "@/types/moment";

interface KeysetParams {
    cursorCreatedAt?: string;
    cursorId?: string;
    size?: number;
    order?: "ASC" | "DESC";
    targetUserId?: string;
}

export const fetchHomeFeeds = async ({
                                         cursorCreatedAt,
                                         cursorId,
                                         size = 20,
                                         order = "DESC",
                                         targetUserId = undefined
                                     }: KeysetParams) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.MOMENTS.FETCH_HOME_FEEDS, {
        params: { cursorCreatedAt, cursorId, size, order, targetUserId },
    });
    return response.data;
};

export const fetchMomentsByStoryId = async (
    storyId: string,
    { cursorCreatedAt, cursorId, size = 20, order = "DESC" }: KeysetParams
) => {
    const response = await axiosInstance.get(
        API_ENDPOINTS.USER.MOMENTS.FETCH_MOMENTS_BY_STORY_ID(storyId),
        { params: { cursorCreatedAt, cursorId, size, order } }
    );
    return response.data;
};

export const fetchMomentsByUserId = async (
    userId: string,
    { cursorCreatedAt, cursorId, size = 20, order = "DESC" }: KeysetParams
) => {
    const response = await axiosInstance.get(
        API_ENDPOINTS.USER.MOMENTS.FETCH_MOMENTS_BY_USER_ID(userId),
        { params: { cursorCreatedAt, cursorId, size, order } }
    );
    return response.data;
};

export const createStandAloneMoment = async (
    userId: string,
    {mediaFile, audioFile, caption, milestone, visibility}: CreateStandAloneFormValue
) => {
    if (!mediaFile) return;
    const mediaType = mediaFile.type;
    const isImageOrVideo = mediaType.startsWith("image/") || mediaType.startsWith("video/");
    if (!isImageOrVideo) return;
    const mediaUrl = await uploadToCloudinary(mediaFile, userId, FOLDER.MOMENT)
    let audioUrl = undefined;
    if (audioFile) {
        const audioType = audioFile.type;
        const isAudio = audioType.startsWith("audio/");
        if (isAudio) {
            audioUrl = await uploadToCloudinary(audioFile, userId, FOLDER.MOMENT);
        }
    }
    const response = await axiosInstance.post(
        API_ENDPOINTS.USER.MOMENTS.CREATE_STANDALONE_MOMENT,
        {
            mediaUrl: mediaUrl,
            audioUrl: audioUrl,
            caption: caption,
            milestone: milestone,
            visibility: visibility,
        }
    );
    return response.data;
}

export const createStoryMoment = async (
    storyId: string,
    userId: string,
    {mediaFile, audioFile, caption, milestone}: CreateStoryMomentFormValue
) => {
    if (!mediaFile) return;
    const mediaType = mediaFile.type;
    const isImageOrVideo = mediaType.startsWith("image/") || mediaType.startsWith("video/");
    if (!isImageOrVideo) return;
    const mediaUrl = await uploadToCloudinary(mediaFile, userId, FOLDER.MOMENT)
    let audioUrl = undefined;
    if (audioFile) {
        const audioType = audioFile.type;
        const isAudio = audioType.startsWith("audio/");
        if (isAudio) {
            audioUrl = await uploadToCloudinary(audioFile, userId, FOLDER.MOMENT);
        }
    }
    const response = await axiosInstance.post(
        API_ENDPOINTS.USER.MOMENTS.CREATE_IN_STORY_MOMENT(storyId),
        {
            mediaUrl: mediaUrl,
            audioUrl: audioUrl,
            caption: caption,
            milestone: milestone
        }
    );
    return response.data;
}

export const updateMomentVisibility = async (momentId: string, visibility: Visibility) => {
    const requestBody = {
        visibility: visibility
    };
    const response = await axiosInstance.patch(
        API_ENDPOINTS.USER.MOMENTS.UPDATE.VISIBILITY(momentId),
        requestBody
    )
    return response.data;
}

export const updateMomentMilestone = async (momentId: string, milestone: boolean) => {
    const requestBody = {
        milestone: milestone,
    }
    const response = await axiosInstance.patch(
        API_ENDPOINTS.USER.MOMENTS.UPDATE.MILESTONE(momentId),
        requestBody
    )
    return response.data;
}

export const deleteMoment = async (momentId: string) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.USER.MOMENTS.DELETE(momentId));
    return response.data;
}

export const toggleReaction = async (momentId: string, reactionType: ReactionType) => {
    const requestBody = {
        reactionType: reactionType,
    }
    const response = await axiosInstance.post(API_ENDPOINTS.USER.MOMENTS.TOGGLE_REACTION(momentId),requestBody);
    return response.data;
}

export const fetchMomentReactions = async (momentId: string) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.MOMENTS.FETCH_REACTIONS(momentId));
    return response.data;
}