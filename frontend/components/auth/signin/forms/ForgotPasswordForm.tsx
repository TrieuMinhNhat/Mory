"use client"

import {useForm} from "react-hook-form";
import {
    ForgotPasswordFormValues, forgotPasswordSchema
} from "@/lib/validations/auth.validation";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useTranslation} from "next-i18next";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import {toast} from "sonner";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import React, {useEffect, useState} from "react";

interface Props {
    onNext: () => void;
}

const ForgotPasswordForm = ({onNext = () => {}}: Props) => {
    const defaultValues = {
        email: "",
    }
    const form = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: defaultValues
    })

    const {isLoading, forgotPassword, currentGetStartedEmail} = useAuthStore(
        (state) => ({
            isLoading: state.isLoading,
            forgotPassword: state.forgotPassword,
            currentGetStartedEmail: state.currentGetStartedEmail
        }),
        shallow
    );

    const [hasSetEmail, setHasSetEmail] = useState(false);

    useEffect(() => {
        if (currentGetStartedEmail && !hasSetEmail) {
            form.setValue("email", currentGetStartedEmail);
            setHasSetEmail(true);
        }
    }, [currentGetStartedEmail, form, hasSetEmail]);

    const {t: ts}  = useTranslation("toast");

    const handleSubmit = async (data: ForgotPasswordFormValues) => {
        const result = await forgotPassword(data);
        if (result.success) {
            onNext();
        } else {
            toast.error(ts("forgot_password.error"));
        }
    }

    const {t: a} = useTranslation("auth");

    return (
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

                <button
                    type="submit"
                    className={"auth-form-button bg-primary h-12 rounded-full mt-2"}
                    disabled={isLoading}
                >
                    <ContentWithLoader isLoading={isLoading}>
                        {a("sign_in.button.email_me")}
                    </ContentWithLoader>
                </button>
            </form>
        </Form>
    )
}

export default ForgotPasswordForm;