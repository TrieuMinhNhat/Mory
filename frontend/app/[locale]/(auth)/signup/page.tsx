"use client"

import ContentWithLoader from "@/components/shared/ContentWithLoader";
import Link from "next/link";
import {ROUTES} from "@/constants/routes";
import {clsx} from "clsx";
import Image from "next/image";
import {useAuthStore} from "@/store/useAuthStore";
import {useOAuthPopupManager} from "@/hooks/useOAuthPopupManager";
import {signInGooglePopup} from "@/lib/services/auth.service";
import {useTranslation} from "next-i18next";
import SignUpForm from "@/components/auth/signup/forms/SignUpForm";
import React from "react";
import {ChevronLeft} from "lucide-react";
import {useRouter} from "next/navigation";

const SignUpPage = () => {
    const {t: a} = useTranslation("auth");
    const isLoading = useAuthStore((state) => state.isLoading);
    const { login, loading } = useOAuthPopupManager();
    const handleGoogleLogin = () => {
        login(signInGooglePopup)
    }
    const router = useRouter();

    return (
        <div className={"flex flex-col w-full items-center"}>
            <div className={"auth-form-container"}>
                <div className={"auth-form-header mb-4"}>
                    <button
                        className={"icon-button p-2"}
                        onClick={router.back}
                        disabled={isLoading}
                    >
                        <ChevronLeft className={"!size-8"}/>
                    </button>
                    <h1 className={"auth-form-title flex-1 text-center pr-16"}>{a("sign_up.title")}</h1>
                </div>
                <SignUpForm isSigningInWithGoogle={loading}/>
                <p className={"signup-prompt mx-auto text-base text-foreground-200"}>
                    {a("sign_up.sign_in_prompt.text")}{" "}
                    <Link
                        href={ROUTES.AUTH.SIGN_IN}
                        className={clsx(
                            "font-semibold text-foreground transition-opacity",
                            isLoading && "pointer-events-none opacity-50"
                        )}
                    >{a("sign_up.sign_in_prompt.link")}</Link>
                </p>
                <p className={"mx-auto"}>{a("sign_in.or")}</p>
                <button
                    className={"auth-form-button-outline w-full h-12 rounded-full"}
                    onClick={handleGoogleLogin}
                    disabled={loading || isLoading}
                >
                    <ContentWithLoader isLoading={isLoading || loading}>
                        <Image
                            src={"/assets/icons/google.svg"}
                            alt={"logo Google"}
                            width={24}
                            height={24}
                            className={"mr-2"}
                        />
                        {a("sign_in.button.google")}
                    </ContentWithLoader>
                </button>
            </div>
        </div>
    )
}

export default SignUpPage;