"use client"

import {useForm} from "react-hook-form";
import {EmailPasswordSignInFormValues, emailPasswordSignInSchema} from "@/lib/validations/auth.validation";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useTranslation} from "next-i18next";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import {toast} from "sonner";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {useEffect, useState} from "react";
import {Eye, EyeOff} from "lucide-react";
import UserBlockedDialog from "@/components/auth/signin/UserBlockedDialog";
import {BlockDetails, SignInView} from "@/types/auth";

const EmailPasswordSignInForm = ({ onSelect, isSigningInWithGoogle}: { onSelect: (s: SignInView) => void; isSigningInWithGoogle: boolean}) => {

    const {isLoading, currentGetStartedEmail, signInEmailPassword} = useAuthStore(
        (state) => ({
            isLoading: state.isLoading,
            signInEmailPassword: state.signInEmailPassword,
            currentGetStartedEmail: state.currentGetStartedEmail,
        }),
        shallow
    );

    const defaultValues = {
        email: "",
        password: ""
    }
    const form = useForm({
        resolver: zodResolver(emailPasswordSignInSchema),
        defaultValues: defaultValues
    })

    const [hasSetEmail, setHasSetEmail] = useState(false);

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [unblockAt, setUnblockAt] = useState("");
    const [permanent, setPermanent] = useState(false);

    useEffect(() => {
        if (currentGetStartedEmail && !hasSetEmail) {
            form.setValue("email", currentGetStartedEmail);
            setHasSetEmail(true);
        }
    }, [currentGetStartedEmail, form, hasSetEmail]);

    const {t: a} = useTranslation("auth");
    const {t: ts} = useTranslation("toast");

    const handleSubmit = async (data: EmailPasswordSignInFormValues) => {
        const result = await signInEmailPassword(data);
        if (result.success) {
            toast.success(ts("sign_in.success"));
        } else if (result.data) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const blockDetails: BlockDetails = result.data;
            setPermanent(blockDetails.permanent);
            setUnblockAt(blockDetails.unblockAt);
            setDialogOpen(true);
        }
        else {
            toast.error(ts("sign_in.error"));
        }
    }

    const [showPassword, setShowPassword] = useState(false);


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
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const passwordInput = document.getElementById("password-input");
                                                passwordInput?.focus();
                                            }
                                        }}
                                        autoComplete={"email"}
                                    />
                                </FormControl>
                                <FormMessage className="shad-form-message" />
                            </FormItem>
                        )}
                    />

                    <FormLabel className={"mt-2 auth-input-label"}>
                        {a("sign_in.email_password.label.password")}
                    </FormLabel>
                    <FormField
                        control={form.control}
                        name={"password"}
                        render={({ field }) => (
                            <FormItem className={"w-full"}>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            id={"password-input"}
                                            required
                                            {...field}
                                            type={showPassword ? "text" : "password"}
                                            className={"outline-input-icon-right w-full rounded-full h-12"}
                                            placeholder={"Password"}
                                            autoComplete={"new-password"}
                                            data-invalid={!!form.formState.errors.password}
                                        />
                                        <button
                                            type="button"
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
                    <button
                        type={"button"}
                        disabled={isLoading || isSigningInWithGoogle}
                        onClick={() => onSelect(SignInView.FORGOT_PASSWORD)}
                        className={"ml-auto text-base text-foreground-200"}>
                        {a("sign_in.button.forgot_password")}
                    </button>
                    <button
                        type="submit"
                        className={"auth-form-button h-12 rounded-full bg-primary"}
                        disabled={isLoading || isSigningInWithGoogle}
                    >
                        <ContentWithLoader isLoading={isLoading || isSigningInWithGoogle}>
                            {a("sign_in.button.sign_in")}
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

export default EmailPasswordSignInForm;