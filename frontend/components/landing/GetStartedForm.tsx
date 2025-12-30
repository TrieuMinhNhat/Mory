"use client"

import {useForm} from "react-hook-form";
import {GetStartedFormValues, getStartedSchema} from "@/lib/validations/auth.validation";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useTranslation} from "next-i18next";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {useRouter} from "next/navigation";
import {SignInView} from "@/types/auth";
import {ROUTES} from "@/constants/routes";

const GetStartedForm = () => {
    const defaultValues = {
        email: ""
    }
    const form = useForm({
        resolver: zodResolver(getStartedSchema),
        defaultValues: defaultValues
    })

    const {isLoading, checkEmailExists, setInitialSignInView} = useAuthStore(
        (state) => ({
            isLoading: state.isLoading,
            checkEmailExists: state.checkEmailExists,
            setInitialSignInView: state.setInitialSignInView,
        }),
        shallow
    );

    const router = useRouter();

    const handleSubmit = async (data: GetStartedFormValues) => {
        const result = await checkEmailExists({email: data.email});
        if (result.success) {
            if ((result.data as {exists: boolean}).exists) {
                setInitialSignInView(SignInView.EMAIL_PASSWORD)
                router.push(ROUTES.AUTH.SIGN_IN);
            } else {
                router.push(ROUTES.AUTH.SIGN_UP)
            }
        }
    }

    const {t: c} = useTranslation("common");
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className={"get-started-form"}>
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
                                    placeholder={"Email address"}
                                    autoComplete={"email"}
                                />
                            </FormControl>
                            <FormMessage className="shad-form-message" />
                        </FormItem>
                    )}
                />
                <button
                    type="submit"
                    className={"auth-form-button h-12 rounded-full w-48 bg-primary"}
                    disabled={isLoading}
                >
                    <ContentWithLoader isLoading={isLoading} spinnerColor={"var(--spinner-color)"}>
                        {c("get_started")}
                    </ContentWithLoader>
                </button>
            </form>
        </Form>
    )
}

export default GetStartedForm;