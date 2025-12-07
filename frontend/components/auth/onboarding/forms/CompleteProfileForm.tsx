"use client"

import React, {ChangeEvent, useRef, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import Image from "next/image";
import {useAuthStore} from "@/store/useAuthStore";
import {useTranslation} from "next-i18next";
import {shallow} from "zustand/vanilla/shallow";
import {toast} from "sonner";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import AvatarCropDialog from "@/components/shared/AvatarCropDialog";
import {useProfileStore} from "@/store/profie/useProfileStore";
import {CompleteProfileFormValues, completeProfileSchema} from "@/lib/validations/profile.validation";

const CompleteProfileForm = () => {

    const {t: u} = useTranslation("user");
    const {t: ts} = useTranslation("toast");

    const user = useAuthStore((state) => state.user);

    const {isCompleteProfile, completeProfile} = useProfileStore(
        (state) => ({
            isCompleteProfile: state.isCompleteProfile,
            completeProfile: state.completeProfile,
        }),
        shallow
    )

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [openCrop, setOpenCrop] = useState(false);
    const [lastConfirmedFile, setLastConfirmedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>("");

    const defaultValues = {
        avatarImageFile: null,
        displayName: user?.profile.displayName ?? "",
    }

    const form = useForm({
        resolver: zodResolver(completeProfileSchema),
        defaultValues: defaultValues
    })

    const handleSubmit = async (data: CompleteProfileFormValues) => {
        const result = await completeProfile(data)
        if (result.success) {
            toast.success(ts("complete_information.success"));
        } else {
            toast.error(ts("complete_information.error"))
        }
        console.log(data);
    }

    const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image")) return;

        setCropSrc(URL.createObjectURL(file));
        setFileName(file.name);
        setOpenCrop(true);

        e.target.value = "";
    };

    const handleCropDone = async (croppedDataUrl: string) => {
        const blob = await fetch(croppedDataUrl).then((r) => r.blob());
        const file = new File([blob], fileName , { type: "image/jpeg" });

        form.setValue("avatarImageFile", file);
        setLastConfirmedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleCropCancel = () => {
        setOpenCrop(false);
        if (lastConfirmedFile) {
            form.setValue("avatarImageFile", lastConfirmedFile);
            setPreviewUrl(URL.createObjectURL(lastConfirmedFile));
            setFileName(lastConfirmedFile.name);
        }
    };

    return (
        <>
            <AvatarCropDialog
                open={openCrop}
                fileUrl={cropSrc || ""}
                onClose={handleCropCancel}
                onCropDone={(url) => {
                    setOpenCrop(false);
                    void handleCropDone(url);
                }}
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className={"auth-form"}>
                    <FormField
                        control={form.control}
                        name="avatarImageFile"
                        render={({ field }) => (
                            <FormItem className="mx-auto mt-4 flex items-center gap-4">
                                <FormLabel className="shrink-0 cursor-pointer">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleSelectFile}
                                    />
                                    <div className={"w-32 h-32 border-4 border-primary p-1 rounded-full"}>
                                        {field.value ? (
                                            <Image
                                                src={previewUrl ?? "/assets/images/avatar.png"}
                                                alt="profile photo"
                                                height={82}
                                                width={82}
                                                priority
                                                className={"rounded-full w-full object-contain "}
                                                onClick={() => fileInputRef.current?.click()}
                                            />
                                        ) : (
                                            <Image
                                                src="/assets/images/avatar.png"
                                                alt="profile photo"
                                                height={82}
                                                width={82}
                                                className={"object-contain w-full rounded-full"}
                                                onClick={() => fileInputRef.current?.click()}
                                            />
                                        )}
                                    </div>

                                </FormLabel>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormLabel className={"auth-input-label"}>
                        {u("onboarding.complete_profile.label.name")}
                    </FormLabel>
                    <FormField
                        control={form.control}
                        name={"displayName"}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        id={"phone-input"}
                                        required
                                        {...field}
                                        className={"outline-input h-12 rounded-full"}
                                        data-invalid={!!form.formState.errors.displayName}
                                        placeholder={"Display name"}
                                        autoComplete={"off"}
                                    />
                                </FormControl>
                                <FormMessage className="shad-form-message" />
                            </FormItem>
                        )}
                    />
                    <p className={"text-center text-sm font-light"}>{u("onboarding.complete_profile.label.name_des")}</p>

                    <button
                        type="submit"
                        className={"button-filled text-primary-foreground mt-2 h-12 w-full rounded-full bg-primary"}
                        disabled={isCompleteProfile}
                    >
                        <ContentWithLoader isLoading={isCompleteProfile}>
                            {u("onboarding.button.continue")}
                        </ContentWithLoader>
                    </button>
                </form>
            </Form>
        </>
    )
}

export default CompleteProfileForm;