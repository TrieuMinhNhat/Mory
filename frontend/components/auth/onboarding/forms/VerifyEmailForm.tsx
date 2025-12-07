"use client"

import {InputOTP, InputOTPGroup, InputOTPSlotCustom} from "@/components/ui/input-otp";
import {REGEXP_ONLY_DIGITS} from "input-otp";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useTranslation} from "next-i18next";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import {toast} from "sonner";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {useForm} from "react-hook-form";
import {VerifyPasswordFormValues, verifyPasswordSchema} from "@/lib/validations/auth.validation";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormField, FormMessage} from "@/components/ui/form";

//Constant
const RESEND_INTERVAL_SECONDS = 60;
const VERIFICATION_OTP_TIMESTAMP_KEY = "verification_otp_last_sent";



const VerifyEmailForm = () => {
    const [countdown, setCountdown] = useState(0);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    const {t: a} = useTranslation("auth");
    const {t: ts} = useTranslation("toast");

    const {user, isLoading, sendRegistrationOtp, verifyRegistrationOtp} = useAuthStore(
        (state) => ({
            user: state.user,
            isLoading: state.isLoading,
            sendRegistrationOtp: state.sendVerifyEmailOtp,
            verifyRegistrationOtp: state.verifyEmail
        }),
        shallow
    );

    const startCountdown = useCallback((seconds: number) => {
        setCountdown(seconds);

        if (countdownRef.current) {
            clearInterval(countdownRef.current);
        }

        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const handleSendOtp = useCallback(async () => {
        const result = await sendRegistrationOtp();
        const now = Date.now();
        localStorage.setItem(VERIFICATION_OTP_TIMESTAMP_KEY, now.toString());
        
        startCountdown(RESEND_INTERVAL_SECONDS);
        
        if (result.success) {
            toast.success(ts("send_otp.success"))
        } else {
            toast.error(ts("send_otp.error"))
        }
    }, [sendRegistrationOtp, startCountdown, ts])


    useEffect(() => {
        const now = Date.now();
        const lastSent = parseInt(localStorage.getItem(VERIFICATION_OTP_TIMESTAMP_KEY) || "0", 10);
        const elapsed = Math.floor((now - lastSent) / 1000);
        const remaining = RESEND_INTERVAL_SECONDS - elapsed;

        if (isNaN(lastSent) || remaining <= 0) {
            void handleSendOtp();
        } else {
            startCountdown(remaining);
        }

        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, [handleSendOtp, startCountdown])


    const form = useForm<VerifyPasswordFormValues>({
        resolver: zodResolver(verifyPasswordSchema),
        defaultValues: { inputOtp: "" },
    });

    const onSubmit = async (data: VerifyPasswordFormValues) => {
        const result = await verifyRegistrationOtp(data);
        if (result.success) {
            toast.success(ts("verify_email.success"));
        } else {
            toast.error(ts("verify_email.error"))
        }
    };

    if (!user) return null;


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full gap-4">
                <FormField
                    control={form.control}
                    name="inputOtp"
                    render={({ field }) => (
                        <InputOTP
                            maxLength={6}
                            value={field.value}
                            onChange={field.onChange}
                            pattern={REGEXP_ONLY_DIGITS}
                        >
                            <InputOTPGroup className="otp-group">
                                {[...Array(6)].map((_, index) => (
                                    <InputOTPSlotCustom
                                        key={index}
                                        index={index}
                                        caretColorClass="bg-primary"
                                        caretHeight="h-[24px]"
                                        caretWidth="w-[1.5px]"
                                        className="otp-slot !rounded-xl h-20 w-full max-w-16"
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    )}
                />
                <FormMessage />

                <button
                    type="submit"
                    className="auth-form-button bg-primary h-12 rounded-full mt-2"
                    disabled={isLoading}
                >
                    <ContentWithLoader isLoading={isLoading}>
                        {a("verify_email.button.verify")}
                    </ContentWithLoader>
                </button>

                <button
                    type={"button"}
                    className={"flex flex-row text-base font-semibold items-center justify-center"}
                    onClick={handleSendOtp}
                    disabled={isLoading}
                >
                    {countdown > 0
                        ? `${a("sign_in.button.resend")} (${countdown}s)`
                        : a("sign_in.button.resend")}
                </button>
            </form>
        </Form>
    )
}

export default VerifyEmailForm;