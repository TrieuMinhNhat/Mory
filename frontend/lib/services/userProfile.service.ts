import axiosInstance from "@/lib/axios";
import {UpdateUserAvatarProps} from "@/types/user";
import {API_ENDPOINTS} from "@/constants/apiEndpoints";
import {UpdateUserInformationFormValue} from "@/lib/validations/profile.validation";
import {uploadToCloudinary} from "@/lib/services/upload.service";
import {FOLDER} from "@/constants";

export const updateUserInformation = async (data: UpdateUserInformationFormValue) => {
    const response = await axiosInstance.put(API_ENDPOINTS.USER.PROFILE.UPDATE, data);
    return response.data;
}

export const updateUserAvatar = async (data: UpdateUserAvatarProps) => {
    if (!data.imageFile) return;
    const avatarImageUrl = await uploadToCloudinary(data.imageFile, "a", FOLDER.AVATAR)
    const response = await axiosInstance.put(API_ENDPOINTS.USER.PROFILE.UPDATE, {
        avatarImageUrl: avatarImageUrl
    });
    return response.data;
}

export const fetchProfile = async (id: string) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.PROFILE.GET_USER_PROFILE(id));
    return response.data;
}

export const fetchUserProfile = async (id: string) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.PROFILE.GET_USER_PROFILE(id));
    return response.data;
}

