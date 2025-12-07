"use client"

import React from "react";
import {useTranslation} from "next-i18next";
import CompleteProfileForm from "@/components/auth/onboarding/forms/CompleteProfileForm";
import {LogOut} from "lucide-react";
import {useAuthStore} from "@/store/useAuthStore";

const CompleteProfileView = () => {
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
                <h1 className={"auth-form-title flex-1 text-center pr-14"}>{u("onboarding.complete_profile.title")}</h1>
            </div>
            <CompleteProfileForm/>
        </div>

    )
}
export default CompleteProfileView;