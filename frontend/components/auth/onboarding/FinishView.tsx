import {useTranslation} from "next-i18next";
import FinishGraphic from "@/components/auth/onboarding/graphics/FinishGraphic";
import React from "react";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/constants/routes";

const FinishView = () => {
    const {t: u} = useTranslation("user");
    const router = useRouter();
    return (
        <div className={"auth-form-container"}>
            <h1 className={"mx-auto auth-form-title mb-4"}>{u("onboarding.finish.title")}</h1>
            <FinishGraphic bgColor={"rgb(var(--background-100))"} fgColor={"rgb(var(--foreground-100))"} className={"w-64 mx-auto h-auto"}/>
            <p className={"signin-form-subtitle max-w-96 mx-auto mt-2 mb-2 text-center"}>{u("onboarding.finish.subtitle")}</p>
            <button
                className={"button-filled h-12 bg-primary text-primary-foreground rounded-full mt-2"}
                onClick={() => router.push(ROUTES.HOME)}
            >
                {u("onboarding.button.finish")}
            </button>
        </div>
    )
}

export default FinishView;
