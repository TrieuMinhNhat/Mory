"use client"

import {useTranslation} from "next-i18next";
import React, {useEffect, useState} from "react";
import {SignInView} from "@/types/auth";
import OtpSignInForm from "@/components/auth/signin/forms/OtpSignInForm";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import {toast} from "sonner";
import {ChevronLeft} from "lucide-react";

//constant
const RESEND_INTERVAL_SECONDS = 30;
const SIGN_IN_OTP_TIMESTAMP_KEY = "sign_in_otp_last_sent";

const SignInOtpInput = ({ onSelect, email }: { onSelect: (s: SignInView) => void, email: string }) => {
    const {t: a} = useTranslation("auth");
    const {t: ts} = useTranslation("toast");

    const [countdown, setCountdown] = useState(0);

    const {isLoading, sendSignInOtp} = useAuthStore(
        (state) => ({
            isLoading: state.isLoading,
            sendSignInOtp: state.sendSignInOtp
        }),
        shallow
    );

    const handleResend = async () => {
        const requestBody = {
            email: email,
        }
        const result = await sendSignInOtp(requestBody);
        if (result.success) {
            toast.success(ts("send_otp.success"));
            localStorage.setItem(SIGN_IN_OTP_TIMESTAMP_KEY, Date.now().toString());
            setCountdown(RESEND_INTERVAL_SECONDS);
        } else {
            toast.error(ts("send_otp.error"));
        }
    }

    useEffect(() => {
        const now = Date.now();
        const lastSent = parseInt(localStorage.getItem(SIGN_IN_OTP_TIMESTAMP_KEY) || "0", 10)
        const elapsed = Math.floor((now - lastSent) / 1000);
        if (isNaN(lastSent) || elapsed >= RESEND_INTERVAL_SECONDS) {
            localStorage.setItem(SIGN_IN_OTP_TIMESTAMP_KEY, now.toString());
            setCountdown(RESEND_INTERVAL_SECONDS);
        } else {
            setCountdown(RESEND_INTERVAL_SECONDS - elapsed);
        }
    }, []);

    useEffect(() => {
        if (countdown <= 0) return;
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0;
                }
                return prev - 1
            })
        }, 1000);
        return () => clearInterval(interval);
    }, [countdown]);
    return (
        <div className={"auth-form-container"}>
            <div className={"auth-form-header mb-4"}>
                <button
                    className={"icon-button p-2"}
                    onClick={() => onSelect(SignInView.EMAIL_PASSWORD)}
                    disabled={isLoading}
                >
                    <ChevronLeft className={"!size-8"}/>
                </button>
                <h1 className={"auth-form-title flex-1 text-center pr-14"}>{a("sign_in.otp.title")}</h1>
            </div>
            <p className={"signin-form-subtitle text-center"}>{a("sign_in.otp.subtitle")}</p>
            <h2 className={"text-center text-2xl font-semibold mt-4"}>{a("sign_in.otp.enter_otp")}</h2>
            <OtpSignInForm email={email}/>

            <div className={"flex flex-col items-center w-full gap-2"}>
                <button
                    className={"flex flex-row text-base font-semibold items-center justify-center"}
                    onClick={handleResend}
                    disabled={isLoading}
                >
                    {countdown > 0
                        ? `${a("sign_in.button.resend")} (${countdown}s)`
                        : a("sign_in.button.resend")}
                </button>
                <p>{a("sign_in.or")}</p>
                <button
                    className={"auth-form-button-outline w-full h-12 rounded-full"}
                    onClick={() => onSelect(SignInView.EMAIL_PASSWORD)}
                    disabled={isLoading}
                >
                    {a("sign_in.button.use_password")}
                </button>
            </div>

        </div>
    )
}

export default SignInOtpInput;