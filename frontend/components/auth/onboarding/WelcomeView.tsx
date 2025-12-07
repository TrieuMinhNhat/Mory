"use client"

import {useTranslation} from "next-i18next";
import WelcomeGraphic from "@/components/auth/onboarding/graphics/WelcomeGraphic";

const WelcomeView = ({ onContinueClick }: { onContinueClick: (value: boolean) => void }) => {
    const {t: u} = useTranslation("user")
    return (
        <div className={"auth-form-container"}>
            <h1 className={"mx-auto auth-form-title mb-8"}>{u("onboarding.welcome.title")}</h1>
            <WelcomeGraphic bgColor={"rgb(var(--background-100))"} fgColor={"rgb(var(--foreground-100))"} className={"w-64 mx-auto h-auto"}/>
            <p className={"signin-form-subtitle mt-2 mb-2 text-center"}>{u("onboarding.welcome.subtitle")}</p>
            <button
                className={"button-filled bg-primary text-primary-foreground h-12 rounded-full"}
                onClick={() => onContinueClick(false)}
            >
                {u("onboarding.button.continue")}
            </button>
        </div>
    )
}
export default WelcomeView;