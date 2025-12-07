"use client"

import {useTranslation} from "next-i18next";
import {ChevronLeft} from "lucide-react";
import {SignInView} from "@/types/auth";
import ForgotPasswordForm from "@/components/auth/signin/forms/ForgotPasswordForm";
import {useAuthStore} from "@/store/useAuthStore";

const ForgotPassword = ({ onSelect }: { onSelect: (s: SignInView) => void }) => {
    const {t: a} = useTranslation("auth");
    const isLoading = useAuthStore((state) => state.isLoading);
    return (
        <div className={"auth-form-container"}>
            <div className={"auth-form-header"}>
                <button
                    className={"icon-button p-2"}
                    onClick={() => onSelect(SignInView.EMAIL_PASSWORD)}
                    disabled={isLoading}
                >
                    <ChevronLeft className={"!size-8"}/>
                </button>
                <h1 className={"auth-form-title flex-1 text-center pr-10"}>{a("sign_in.forgot_password.title")}</h1>
            </div>
            <p className={"signin-form-subtitle mt-2"}>{a("sign_in.forgot_password.subtitle")}</p>

            <ForgotPasswordForm onNext={() => onSelect(SignInView.EMAIL_SENT)}/>
        </div>
    )
}

export default ForgotPassword;