import axiosInstance from "@/lib/axios";
import {API_ENDPOINTS} from "@/constants/apiEndpoints";
import axios from "axios";
import {FOLDER} from "@/constants";

export const getSignature = async (folder: string) => {
    const response = await axiosInstance.get(API_ENDPOINTS.USER.UPLOAD, {
        params: { folder },
    });
    return response.data;
};

export const uploadToCloudinary = async (file: File, userId: string, folder: FOLDER) => {
    const folderPath = folder === FOLDER.MOMENT ? `moments/${userId}` : `${folder}`;
    const { signature, timestamp, api_key, cloud_name } = await getSignature(folderPath);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", api_key);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folderPath);

    const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );

    return res.data.secure_url;
};