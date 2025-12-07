"use client"

import {useForm} from "react-hook-form";
import {
    ResetPasswordFormValues, resetPasswordSchema
} from "@/lib/validations/auth.validation";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useTranslation} from "next-i18next";
import {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {toast} from "sonner";
import {Eye, EyeOff} from "lucide-react";

const ResetPasswordForm = () => {
    const {t: a} = useTranslation("auth");
    const {t: ts} = useTranslation("toast");
    const router = useRouter();

    const searchParams = useSearchParams();

    const email = searchParams.get("email") ?? "";
    const token = searchParams.get("token") ?? "";

    const {isLoading, resetPassword} = useAuthStore(
        (state) => ({
            isLoading: state.isLoading,
            resetPassword: state.resetPassword
        }),
        shallow
    );

    const defaultValues = {
        email: email,
        newPassword: "",
        confirmPassword: ""
    }

    const form = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: defaultValues
    })

    const handleSubmit = async (data: ResetPasswordFormValues) => {
        const requestBody = {
            email: data.email,
            token: token,
            newPassword: data.newPassword,
        }
        const result = await resetPassword(requestBody);
        if (result.success) {
            toast.success(ts("reset_password.success"))
            router.replace("/signin")
        } else if (result.data) {
            toast.error(ts("reset_password.same_password"))
        } else {
            toast.error(ts("reset_password.error"))
        }
    }

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className={"auth-form"}>
                <FormLabel className={"auth-input-label"}>
                    {a("sign_in.reset_password.label.email")}
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
                                    placeholder={"Email"}
                                    disabled={true}
                                />
                            </FormControl>
                            <FormMessage className="shad-form-message" />
                        </FormItem>
                    )}
                />

                <FormLabel className={"auth-input-label mt-2"}>
                    {a("sign_in.reset_password.label.password")}
                </FormLabel>
                <FormField
                    control={form.control}
                    name={"newPassword"}
                    render={({ field }) => (
                        <FormItem className={"w-full"}>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        required
                                        {...field}
                                        type={showPassword ? "text" : "password"}
                                        className={"outline-input-icon-right h-12 rounded-full"}
                                        placeholder={"New password"}
                                        autoComplete={"new-password"}
                                        data-invalid={!!form.formState.errors.newPassword}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className={"show-password-button"}
                                        data-invalid={!!form.formState.errors.newPassword}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage className="shad-form-message" />
                        </FormItem>
                    )}
                />

                <FormLabel className={"auth-input-label mt-2"}>
                    {a("sign_in.reset_password.label.re_enter_password")}
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
                                        className={"outline-input-icon-right h-12 rounded-full"}
                                        placeholder={"New password"}
                                        autoComplete={"new-password"}
                                        data-invalid={!!form.formState.errors.confirmPassword}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className={"show-password-button"}
                                        data-invalid={!!form.formState.errors.confirmPassword}
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
                    disabled={isLoading}
                >
                    <ContentWithLoader isLoading={isLoading}>
                        {a("sign_in.button.save")}
                    </ContentWithLoader>
                </button>
            </form>
        </Form>
    )
}

export default ResetPasswordForm;