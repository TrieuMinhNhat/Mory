"use client"

import {useTranslation} from "next-i18next";
import Link from "next/link";
import {SignInView} from "@/types/auth";
import EmailPasswordSignInForm from "@/components/auth/signin/forms/EmailPasswordSignInForm";
import {useAuthStore} from "@/store/useAuthStore";
import {clsx} from "clsx";
import {useOAuthPopupManager} from "@/hooks/useOAuthPopupManager";
import {signInGooglePopup} from "@/lib/services/auth.service";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import Image from "next/image";
import {ROUTES} from "@/constants/routes";

const SignInWithEmailPassword = ({ onSelect }: { onSelect: (s: SignInView) => void }) => {
    const {t: a} = useTranslation("auth");
    const isLoading = useAuthStore((state) => state.isLoading);

    const { login, loading } = useOAuthPopupManager();

    const handleGoogleLogin = () => {
        login(signInGooglePopup)
    }

    return (
        <div className={"auth-form-container"}>
            <h1 className={"mx-auto auth-form-title"}>{a("sign_in.email_password.title")}</h1>
            <div className={"flex flex-col items-center w-full mt-4 gap-2"}>
                <EmailPasswordSignInForm onSelect={onSelect} isSigningInWithGoogle={loading} />
                <p>{a("sign_in.or")}</p>
                <button
                    className={"auth-form-button-outline w-full h-12 rounded-full"}
                    onClick={() => onSelect(SignInView.EMAIL_OTP)}
                    disabled={isLoading || loading}
                >
                    <ContentWithLoader isLoading={isLoading || loading}>
                        {a("sign_in.button.use_code")}
                    </ContentWithLoader>

                </button>

            </div>
            <p className={"signup-prompt mx-auto text-base text-foreground-200"}>
                {a("sign_in.sign_up_prompt.text")}{" "}
                <Link
                    href={ROUTES.AUTH.SIGN_UP}
                    className={clsx(
                        "font-semibold text-foreground transition-opacity",
                        isLoading && "pointer-events-none opacity-50"
                    )}
                >{a("sign_in.sign_up_prompt.link")}</Link>
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
    )
}

export default SignInWithEmailPassword;