
export interface VerifyEmailProps {
    inputOtp: string;
}

export interface ResetPasswordProps {
    email: string;
    token: string;
    newPassword: string;
}

export interface CheckEmailProps {
    email: string;
}

export type ApiResult = {
    success: boolean;
    message?: string;
    data?: unknown;
}

export type BlockDetails = {
    level: string;
    unblockAt: string;
    permanent: boolean;
}

export enum SignInView {
    EMAIL_PASSWORD,
    EMAIL_OTP,
    OTP_INPUT,
    FORGOT_PASSWORD,
    EMAIL_SENT
}

export enum OnboardingView {
    WELCOME,
    VERIFY_EMAIL,
    COMPLETE_INFORMATION,
}

export enum PremiumView {
    GO_PREMIUM,
    FINISH
}
