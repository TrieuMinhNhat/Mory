"use client"

import {useForm} from "react-hook-form";
import {
    SendOtpSignInFormValues,
    sendOtpSignInSchema
} from "@/lib/validations/auth.validation";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useTranslation} from "next-i18next";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {toast} from "sonner";
import React, {useEffect, useState} from "react";
import {BlockDetails} from "@/types/auth";
import UserBlockedDialog from "@/components/auth/signin/UserBlockedDialog";

interface Props {
    onNext?: () => void;
    setEmail: (s: string) => void;
    isSigningInWithGoogle: boolean;
}

const EmailOtpSignInRequestForm = ({onNext = () => {}, setEmail, isSigningInWithGoogle}: Props) => {
    const {t: ts}  = useTranslation("toast");
    const {t: a} = useTranslation("auth");

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [unblockAt, setUnblockAt] = useState("");
    const [permanent, setPermanent] = useState(false);

    const {isLoading, sendSignInOtp, currentGetStartedEmail} = useAuthStore(
        (state) => ({
            isLoading: state.isLoading,
            sendSignInOtp: state.sendSignInOtp,
            currentGetStartedEmail: state.currentGetStartedEmail,
        }),
        shallow
    );

    const defaultValues = {
        email: "",
    }

    const form = useForm({
        resolver: zodResolver(sendOtpSignInSchema),
        defaultValues: defaultValues
    })

    const [hasSetEmail, setHasSetEmail] = useState(false);

    useEffect(() => {
        if (currentGetStartedEmail && !hasSetEmail) {
            form.setValue("email", currentGetStartedEmail);
            setHasSetEmail(true);
        }
    }, [currentGetStartedEmail, form, hasSetEmail]);

    const handleSubmit = async (data: SendOtpSignInFormValues) => {
        const result = await sendSignInOtp(data);

        setEmail(form.getValues("email"))

        if (result.success) {
            onNext();
        } else if (result.data) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const blockDetails: BlockDetails = result.data;
            setPermanent(blockDetails.permanent);
            setUnblockAt(blockDetails.unblockAt);
            setDialogOpen(true);
        } else {
            toast.error(ts("send_otp.error"));
        }
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className={"auth-form"}>
                    <FormLabel className={"auth-input-label"}>
                        {a("sign_in.email_password.label.email")}
                    </FormLabel>
                    <FormField
                        control={form.control}
                        name={"email"}
                        render={({ field }) => (
                            <FormItem className={"w-full"}>
                                <FormControl>
                                    <Input
                                        required
                                        {...field}
                                        className={"outline-input h-12 rounded-full"}
                                        data-invalid={!!form.formState.errors.email}
                                        placeholder={"Email"}
                                        autoComplete={"email"}
                                    />
                                </FormControl>
                                <FormMessage className="shad-form-message" />
                            </FormItem>
                        )}
                    />

                    <p className={"text-sm  font-light text-center text-foreground-200"}>{a("sign_in.otp.rates_notice")}</p>

                    <button
                        type="submit"
                        className={"auth-form-button bg-primary h-12 rounded-full mt-2"}
                        disabled={isLoading || isSigningInWithGoogle}
                    >
                        <ContentWithLoader isLoading={isLoading || isSigningInWithGoogle}>
                            {a("sign_in.button.send_code")}
                        </ContentWithLoader>
                    </button>
                </form>
            </Form>
            {isDialogOpen && (
                <UserBlockedDialog isOpen={isDialogOpen} setIsOpen={setDialogOpen} unblockAt={unblockAt} permanent={permanent} />
            )}
        </>
    )
}

export default EmailOtpSignInRequestForm;