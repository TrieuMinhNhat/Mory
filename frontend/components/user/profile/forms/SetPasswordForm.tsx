"use client"

import {useForm} from "react-hook-form";
import {
    SetPasswordFormValues,
    setPasswordSchema
} from "@/lib/validations/auth.validation";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useTranslation} from "next-i18next";
import {useState} from "react";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {toast} from "sonner";
import {Eye, EyeOff} from "lucide-react";

interface Props {
    onClose: () => void;
}

const SetPasswordForm = ({ onClose }: Props) => {
    const {t: a} = useTranslation("auth");
    const {t: ts} = useTranslation("toast");

    const {isLoading, setPassword} = useAuthStore(
        (state) => ({
            isLoading: state.isLoading,
            setPassword: state.setPassword
        }),
        shallow
    );

    const defaultValues = {
        newPassword: "",
        confirmPassword: ""
    }

    const form = useForm({
        resolver: zodResolver(setPasswordSchema),
        defaultValues: defaultValues
    })

    const handleSubmit = async (data: SetPasswordFormValues) => {
        const result = await setPassword(data.newPassword);
        if (result.success) {
            toast.success(ts("reset_password.success"))
            onClose();
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
                <FormLabel className={"auth-input-label mt-2"}>
                    {a("sign_up.label.password")}
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
                                        placeholder={"Password"}
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
                                        className={"outline-input-icon-right h-12 rounded-full"}
                                        placeholder={"Password"}
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
                    className={"auth-form-button h-12 mt-4 rounded-full bg-primary"}
                    disabled={isLoading}
                >
                    <ContentWithLoader isLoading={isLoading}>
                        {a("sign_in.button.save")}
                    </ContentWithLoader>
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className={"auth-form-button-outline h-12 mt-2 rounded-full"}
                    disabled={isLoading}
                >
                    <ContentWithLoader isLoading={isLoading}>
                        {a("sign_in.button.cancel")}
                    </ContentWithLoader>
                </button>
            </form>
        </Form>
    )
}

export default SetPasswordForm;