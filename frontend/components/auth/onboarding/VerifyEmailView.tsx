"use client"

import React from "react";
import {useTranslation} from "next-i18next";
import { LogOut} from "lucide-react";
import VerifyEmailForm from "@/components/auth/onboarding/forms/VerifyEmailForm";
import {useAuthStore} from "@/store/useAuthStore";

const VerifyEmailView = () => {
    const {t: u} = useTranslation("user");
    const signOut = useAuthStore((state) => state.signOut);

    return (
        <div className={"auth-form-container"}>
            <div className={"auth-form-header mb-4"}>
                <button
                    className={"icon-button p-2"}
                    onClick={() => signOut()}
                >
                    <LogOut className={"!size-6"}/>
                </button>
                <h1 className={"auth-form-title flex-1 text-center pr-14"}>{u("onboarding.verify.title")}</h1>
            </div>
            <p className={"signin-form-subtitle text-center"}>{u("onboarding.verify.subtitle")}</p>
            <h2 className={"text-center text-2xl font-semibold mt-4"}>{u("onboarding.verify.enter_otp")}</h2>
            <VerifyEmailForm/>
        </div>
    )
}
export default VerifyEmailView;