"use client"

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useAuthStore} from "@/store/useAuthStore";
import {useTranslation} from "next-i18next";
import {shallow} from "zustand/vanilla/shallow";
import {toast} from "sonner";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {UpdateUserInformationFormValue, updateUserInformationSchema} from "@/lib/validations/profile.validation";
import {useProfileStore} from "@/store/profie/useProfileStore";

interface Props {
    onSubmit: () => void;
}

const InformationForm = ({onSubmit}: Props) => {

    const {t: ts} = useTranslation("toast");

    const user = useAuthStore((state) => state.user);

    const {updateUserInformation, isUpdatingInformation} = useProfileStore(
        (state) => ({
            updateUserInformation: state.updateUserInfo,
            isUpdatingInformation: state.isUpdatingUserInfo
        }),
        shallow
    );


    const defaultValues = {
       displayName: user?.profile.displayName ?? ""
    }

    const form = useForm({
        resolver: zodResolver(updateUserInformationSchema),
        defaultValues: defaultValues
    })

    if (!user) return null;


    const handleSubmit = async (data: UpdateUserInformationFormValue) => {
        const result = await updateUserInformation(data)
        if (result.success) {
            toast.success(ts("user.update_info.success"));
        } else {
            toast.error(ts("user.update_info.error"))
        }
    }





    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}
                      className={"flex max-h-[800px] w-full max-w-[500px] flex-col justify-center gap-2 transition-all lg:h-full "}
                >
                    <FormLabel className={"mt-2"}>
                        Display Name
                    </FormLabel>
                    <FormField
                        control={form.control}
                        name={"displayName"}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        required
                                        {...field}
                                        className={"update-information-input"}
                                        data-invalid={!!form.formState.errors.displayName}
                                        disabled={isUpdatingInformation}
                                        placeholder={"Phone Number"}
                                    />
                                </FormControl>
                                <FormMessage className="shad-form-message" />
                            </FormItem>
                        )}
                    />
                    <Button
                        type={"submit"}
                        className={"text-sm font-medium py-4 pl-3 w-full hover:bg-opacity-90 mt-2"}
                        disabled={isUpdatingInformation}
                        onClick={onSubmit}
                    >
                        <ContentWithLoader isLoading={isUpdatingInformation}>
                            Submit
                        </ContentWithLoader>
                    </Button>
                </form>
            </Form>
        </>
    )
}

export default InformationForm;