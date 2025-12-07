"use client"

import {useForm} from "react-hook-form";
import {
    SignUpFormValues,
    signUpSchema,
} from "@/lib/validations/auth.validation";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useTranslation} from "next-i18next";
import React, {useEffect, useState} from "react";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import {toast} from "sonner";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {Eye, EyeOff} from "lucide-react";

const SignUpForm = ({isSigningInWithGoogle}: {isSigningInWithGoogle: boolean}) => {
    const {t: a} = useTranslation("auth");

    const {isLoading, currentGetStartedEmail, signUp, signInEmailPassword} = useAuthStore(
        (state) => ({
            isLoading: state.isLoading,
            signUp: state.signUp,
            currentGetStartedEmail: state.currentGetStartedEmail,
            signInEmailPassword: state.signInEmailPassword,
        }),
        shallow
    );

    const defaultValues = {
        email: "",
        password: "",
        confirmPassword: "",
    }

    const form = useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues: defaultValues
    })

    const [hasSetEmail, setHasSetEmail] = useState(false);

    useEffect(() => {
        if (currentGetStartedEmail && !hasSetEmail) {
            form.setValue("email", currentGetStartedEmail);
            setHasSetEmail(true);
        }
    }, [currentGetStartedEmail, form, hasSetEmail]);


    const {t: ts} = useTranslation("toast");

    const handleSubmit = async (data: SignUpFormValues) => {
        const result = await signUp({email: data.email, password: data.password});
        if (result.success) {
            toast.success(ts("create_password.success"));
            await signInEmailPassword({email: data.email , password: data.password})
        } else {
            toast.error(ts("create_password.error"));
        }
    }

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className={"auth-form"}>
                <FormLabel className={"auth-input-label"}>
                    {a("sign_up.label.email")}
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

                <FormLabel className={"mt-2 auth-input-label"}>
                    {a("sign_up.label.password")}
                </FormLabel>
                <FormField
                    control={form.control}
                    name={"password"}
                    render={({ field }) => (
                        <FormItem className={"w-full"}>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        required
                                        {...field}
                                        type={showPassword ? "text" : "password"}
                                        className={"outline-input-icon-right w-full rounded-full h-12"}
                                        autoComplete={"new-password"}
                                        data-invalid={!!form.formState.errors.password}
                                        placeholder={"Password"}
                                    />
                                    <button
                                        type={"button"}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className={"show-password-button"}
                                        data-invalid={!!form.formState.errors.password}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage className="shad-form-message" />
                        </FormItem>
                    )}
                />

                <FormLabel className={"mt-2 auth-input-label"}>
                    {a("sign_up.label.re_enter_password")}
                </FormLabel>
                <FormField
                    control={form.control}
                    name={"confirmPassword"}
                    render={({ field }) => (
                        <FormItem className={"w-full"}>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        required
                                        {...field}
                                        type={showConfirmPassword ? "text" : "password"}
                                        className={"outline-input-icon-right w-full rounded-full h-12"}
                                        autoComplete={"new-password"}
                                        data-invalid={!!form.formState.errors.password}
                                        placeholder={"Password"}
                                    />
                                    <button
                                        type={"button"}
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className={"show-password-button"}
                                        data-invalid={!!form.formState.errors.password}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage className="shad-form-message" />
                        </FormItem>
                    )}
                />
                <button
                    type="submit"
                    className={"auth-form-button h-12 mt-2 rounded-full bg-primary"}
                    disabled={isLoading || isSigningInWithGoogle}
                >
                    <ContentWithLoader isLoading={isLoading}>
                        {a("sign_up.button.sign_up")}
                    </ContentWithLoader>
                </button>
            </form>
        </Form>
    )
}

export default SignUpForm;