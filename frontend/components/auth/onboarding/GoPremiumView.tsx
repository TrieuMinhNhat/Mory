import {useTranslation} from "next-i18next";
import {LogOut} from "lucide-react";
import React from "react";
import GoPremiumGraphic from "@/components/auth/onboarding/graphics/GoPremiumGraphic";
import GoPremiumButton from "@/components/shared/GoPremiumButton";
import {PremiumView} from "@/types/auth";
import {useAuthStore} from "@/store/useAuthStore";

const GoPremiumView = ({ onSkip }: { onSkip: (p: PremiumView) => void }) => {
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
                <h1 className={"auth-form-title flex-1 text-center pr-14"}>{u("onboarding.go_premium.title")}</h1>
            </div>
            <GoPremiumGraphic bgColor={"rgb(var(--background-100))"} fgColor={"rgb(var(--foreground-100))"} className={"w-64 mx-auto h-auto"}/>
            <p className={"signin-form-subtitle text-center mt-2 max-w-96 mx-auto"}>{u("onboarding.go_premium.subtitle")}</p>
            <div className={"w-full flex justify-center"}>
                <GoPremiumButton/>
            </div>

            <button
                className={"outline-button h-12 rounded-full mt-2"}
                onClick={() => onSkip(PremiumView.FINISH)}
            >
                {u("onboarding.button.skip")}
            </button>
        </div>
    )
}

export default GoPremiumView;