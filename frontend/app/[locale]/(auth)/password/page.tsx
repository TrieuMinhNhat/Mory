"use client"

import ResetPasswordForm from "@/components/auth/password/ResetPasswordForm";
import {useTranslation} from "next-i18next";
import {useAuthStore} from "@/store/useAuthStore";
import {useRouter} from "next/navigation";

const PasswordPage = () => {

    const {t: a} = useTranslation("auth");
    const isLoading = useAuthStore((state) => state.isLoading);
    const router = useRouter();

    return (
        <div className={"flex flex-col w-full items-center"}>
            <div className={"auth-form-container"}>
                <h1 className={"auth-form-title mx-auto"}>{a("sign_in.reset_password.title")}</h1>
                <ResetPasswordForm/>

                <button
                    className={"auth-form-button-outline w-full h-12 rounded-full"}
                    onClick={() => router.replace("/")}
                    disabled={isLoading}
                >
                    {a("sign_in.button.cancel")}
                </button>
            </div>
        </div>
    )
};

export default PasswordPage;