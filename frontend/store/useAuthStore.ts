import {createStore} from "zustand/vanilla";
import {useStoreWithEqualityFn} from "zustand/traditional";
import {
    ApiResult,
    CheckEmailProps,
    ResetPasswordProps,
    SignInView,
    VerifyEmailProps,
} from "@/types/auth";
import {
    checkAuth,
    checkEmail,
    forgotPassword,
    resetPassword,
    sendRegistrationOtp, sendSignInOtp, setPassword, signInEmailOtp,
    signInEmailPassword,
    signOut,
    signUp, SignUpParams,
    verifyEmail
} from "@/lib/services/auth.service";
import {User} from "@/types/user";
import {
    EmailOtpSignInFormValues,
    EmailPasswordSignInFormValues, ForgotPasswordFormValues,
    SendOtpSignInFormValues
} from "@/lib/validations/auth.validation";
import {ROUTES} from "@/constants/routes";



interface AuthState {
    user: User | null;
    isCheckingAuth: boolean;
    isLoading: boolean;
    currentGetStartedEmail: string | null,

    initialSignInView: SignInView;
    setInitialSignInView: (view: SignInView) => void;

    signInEmailPassword: (data: EmailPasswordSignInFormValues) => Promise<ApiResult>;

    sendSignInOtp: (data: SendOtpSignInFormValues) => Promise<ApiResult>;
    signInEmailOtp: (data: EmailOtpSignInFormValues) => Promise<ApiResult>;


    checkEmailExists: (data: CheckEmailProps) => Promise<ApiResult>;
    signUp: (data: SignUpParams) => Promise<ApiResult>;
    sendVerifyEmailOtp: () => Promise<ApiResult>;
    verifyEmail: (data: VerifyEmailProps) => Promise<ApiResult>;

    checkAuth: () => Promise<ApiResult>;
    signOut: () => Promise<void>;

    forgotPassword: (data: ForgotPasswordFormValues) => Promise<ApiResult>;
    resetPassword: (data: ResetPasswordProps) => Promise<ApiResult>
    setPassword: (password: string) => Promise<ApiResult>;

    getOnboardingStep: () => number;
    setUser: (user: User | null) => void;
    setCurrentGetStartedEmail: (startedEmail: string) => void;
}

const authStore = createStore<AuthState>()((set) => ({
    user: null,
    isCheckingAuth: false,
    isLoading: false,
    currentGetStartedEmail: null,

    initialSignInView: SignInView.EMAIL_PASSWORD,
    setInitialSignInView: (view) => set({ initialSignInView: view }),

    signInEmailPassword: async (data): Promise<ApiResult> => {
        return withLoading(set, async () => {
            const response = await signInEmailPassword(data);
            if (response.success) {
                const user = await response.data.user;
                set({user: user});
                console.log("user", user);
            }
            console.log(response)
            set({currentGetStartedEmail: null, initialSignInView: SignInView.EMAIL_PASSWORD});
            return {success: response.success, message: response.message, data: response.data}
        }, "Failed to sign in");
    },
    sendSignInOtp: async (data): Promise<ApiResult> => {
        return withLoading(set, async () => {
            const response = await sendSignInOtp(data);
            if (response.success) {

            }
            return {success: response.success, message: response.message, data: response.data}
        }, "Failed to send otp!")
    },
    signInEmailOtp: (data): Promise<ApiResult> =>  {
        return withLoading(set, async () => {
            const response = await signInEmailOtp(data);
            if (response.success) {
                const user = await response.data.user;
                set({user: user});

            }


            return {success: response.success, message: response.message, data: response.data}
        }, "Failed to sign in");
    },
    checkEmailExists: async (data: CheckEmailProps): Promise<ApiResult> => {
        return withLoading(set, async () => {
            const response = await checkEmail(data);
            if (response.success) {
                set({currentGetStartedEmail: data.email})
            }
            return {success: response.success, message: response.message, data: {exists: response.data.exists}}
        }, "Failed to check email exists");
    },

    signUp: async (data): Promise<ApiResult> => {
        return withLoading(set, async  () => {
            const response = await signUp(data);
            set({currentGetStartedEmail: null, initialSignInView: SignInView.EMAIL_PASSWORD});
            return {success: response.success, message: response.message}
        },"Failed to sign up");
    },
    sendVerifyEmailOtp: async (): Promise<ApiResult> => {
        return withLoading(set, async () => {
            const response = await sendRegistrationOtp();
            return {success: response.success, message: response.message}
        }, "Failed to send otp")
    },
    verifyEmail: async (data): Promise<ApiResult> => {
        return withLoading(set, async () => {
            const response = await verifyEmail(data);
            if (response.success) {
                const {verified} = response.data;
                set((state) => {
                    if (state.user) {
                        return {
                            user: {
                                ...state.user,
                                verified,
                            },
                        };
                    }
                    return {};
                });
            }
            return {success: response.success, message: response.message}
        }, "Failed to verify otp")
    },
    checkAuth: async (): Promise<ApiResult> => {
        return withLoading(set, async () => {
            const response = await checkAuth();
            if (response.success) {
                const user = await response.data;
                set({user: user});
            } else {
                set({user: null})
            }
            return {success: response.success, message: response.message}
        }, "Failed to check auth", true)
    },
    forgotPassword: async (data): Promise<ApiResult> => {
        return withLoading(set, async () => {
            const response = await forgotPassword(data);
            return {success: response.success, message: response.message}
        }, "Failed to send request")
    },
    resetPassword: async (data): Promise<ApiResult> => {
        return withLoading(set, async () => {
            const response = await resetPassword(data);
            return {success: response.success, message: response.message, data: response.data}
        }, "Failed to reset password");
    },
    setPassword: async (password): Promise<ApiResult> => {
        return withLoading(set, async () => {
            const response = await setPassword(password);
            return {success: response.success, message: response.message, data: response.data}
        }, "Failed to set password")
    },

    getOnboardingStep: (): number => {
        const state = authStore.getState();
        const user = state.user;

        if (!user) return 0;
        if (!user.verified) return 1;
        if (!user.profile.onboarded) return 2;
        return 3;
    },
    signOut: async () => {
        try {
            await signOut();
            set({user: null, isLoading: false, isCheckingAuth: false});
            set({currentGetStartedEmail: null, initialSignInView: SignInView.EMAIL_PASSWORD});
            window.location.href = ROUTES.AUTH.SIGN_IN;
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log(error.message)
            }
        }
    },
    setUser: (user) => set({ user: user }),
    setCurrentGetStartedEmail: (startedEmail) => set({currentGetStartedEmail: startedEmail}),
}))

const withLoading = async (
    set: (state: Partial<AuthState>) => void,
    fn: () => Promise<ApiResult>,
    fallbackMessage: string,
    isCheckAuth: boolean = false,
): Promise<ApiResult> => {
    if (isCheckAuth) {
        set({isCheckingAuth: true});
    }
    set({isLoading: true});
    try {
        return await fn();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message)
        }
        return { success: false, message: fallbackMessage};
    } finally {
        set({isLoading: false});
        if (isCheckAuth) {
            set({isCheckingAuth: false});
        }
    }
}

export { authStore }


export const useAuthStore = <T>(
    selector: (state: AuthState) => T,
    equals?: (a: T, b: T) => boolean
) => useStoreWithEqualityFn(authStore, selector, equals);