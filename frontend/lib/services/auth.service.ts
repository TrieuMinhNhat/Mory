import axiosInstance from "@/lib/axios";
import {API_BASE_URL, API_ENDPOINTS} from "@/constants/apiEndpoints";
import {
    EmailOtpSignInFormValues,
    EmailPasswordSignInFormValues, ForgotPasswordFormValues,
    SendOtpSignInFormValues,
} from "@/lib/validations/auth.validation";
import {CheckEmailProps, ResetPasswordProps, VerifyEmailProps} from "@/types/auth";
import {CompleteProfileFormValues} from "@/lib/validations/profile.validation";
import {uploadToCloudinary} from "@/lib/services/upload.service";
import {FOLDER} from "@/constants";

export const signInEmailPassword = async ({email, password}: EmailPasswordSignInFormValues) => {
    const requestBody = {
        email: email,
        password: password
    }
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.EMAIL_PASSWORD_SIGN_IN, requestBody);
    return response.data;
}

export const sendSignInOtp = async ({email}: SendOtpSignInFormValues) => {
    const requestBody = {
        email: email,
    }
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SEND_SIGN_IN_OTP, requestBody);
    return response.data;
}

export const signInEmailOtp = async ({email, inputOtp}: EmailOtpSignInFormValues) => {
    const requestBody = {
        email: email,
        inputOtp: inputOtp
    }
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.EMAIL_OTP_SIGN_IN, requestBody);
    return response.data;
}

export interface SignUpParams {
    email: string;
    password: string;
}

export const signUp = async ({email, password}: SignUpParams) => {
    const requestBody = {
        email: email,
        password: password
    }
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SIGN_UP, requestBody);
    return response.data;
}

export const sendRegistrationOtp = async () => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SEND_VERIFICATION_OTP);
    return response.data;
}

export const verifyEmail = async ({inputOtp}: VerifyEmailProps) => {
    const requestBody = {
        inputOtp: inputOtp
    }
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.VERIFY_REGISTRATION_OTP, requestBody);
    return response.data;
}

export const checkAuth = async () => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.CHECK_AUTH);
    return response.data;
};

export const signOut = async () => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.SIGN_OUT);
}

export const completeProfile = async ({
    displayName,
    avatarImageFile
}: CompleteProfileFormValues) => {
    let avatarImageUrl = undefined;
    if (avatarImageFile) {
        avatarImageUrl = await uploadToCloudinary(avatarImageFile, "a", FOLDER.AVATAR)
    }
    const requestBody = {
        avatarImageUrl: avatarImageUrl,
        displayName: displayName,
    }
    const response = await axiosInstance.post(API_ENDPOINTS.USER.PROFILE.COMPLETE_PROFILE, requestBody);
    return response.data;
}

export const setPassword = async (password: string) => {
    const requestBody = {
        password: password
    }
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.SET_PASSWORD, requestBody);
    return response.data;
}

export const forgotPassword = async ({email}: ForgotPasswordFormValues) => {
    const requestBody = {
        email: email,
    }
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, requestBody);
    return response.data;
}

export const resetPassword = async ({email, token, newPassword}: ResetPasswordProps) => {
    const requestBody = {
        email: email,
        token: token,
        newPassword: newPassword
    }
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, requestBody);
    return response.data;
}

export const checkEmail = async ({email}: CheckEmailProps) => {
    const requestBody = {
        email: email,
    }
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.CHECK_EMAIL, requestBody);
    return response.data;
}

export const signInGooglePopup = () => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
        `${window.location.origin}${API_BASE_URL}/oauth2/authorization/google`.replace(/\/(en|vi)\//, '/'),
        "Google Login",
        `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars`
    );

    if (!popup) {
        throw new Error("Popup blocked");
    }

    return popup;
};
