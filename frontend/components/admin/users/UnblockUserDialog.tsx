"use client"

import {
    AlertDialog, AlertDialogAction,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from "react";
import {CircleAlert} from "lucide-react";
import Image from "next/image";
import { AdminUser} from "@/types/adminUser";
import {useAdminUserStore} from "@/store/admin/useAdminUserStore";
import {toast} from "sonner";
import {useTranslation} from "next-i18next";

interface Props {
    user: AdminUser;
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

const UnblockUserDialog = ({ user, isOpen, setIsOpen }: Props) => {
    const unblockUser = useAdminUserStore((state) => state.unblockUser)

    const {t: ts} = useTranslation("toast");
    const {t: ad} = useTranslation("admin");

    const handleSubmit = async () => {
        const result = await unblockUser({userId: user.id})
        if (result.success) {
            toast.success(ts("admin.unblock_user.success"));
        } else {
            toast.error(ts("admin.unblock_user.error"));
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className={"w-[400px] bg-background-100"}>
                <AlertDialogHeader className={"w-full items-center"}>
                    <AlertDialogTitle className={"text-xl font-medium text-foreground text-center"}>
                        {ad("users_page.unblock_user.title")}
                        <Image
                            src="/assets/icons/close-dark.svg"
                            alt="close"
                            width={20}
                            height={20}
                            onClick={() => setIsOpen(false)}
                            className={"absolute right-2 top-2 cursor-pointer sm:right-2 sm:top-2"}
                        />
                    </AlertDialogTitle>
                    <AlertDialogDescription></AlertDialogDescription>
                </AlertDialogHeader>

                <div className={"flex flex-col items-center"}>
                    {/* Icon */}
                    <div className={"bg-greenee-100/10 rounded-full w-fit p-2"}>
                        <div className={"bg-greenee-100 rounded-full w-fit text-light-300 p-4"}>
                            <CircleAlert width={32} height={32} />
                        </div>
                    </div>
                    <p className={"text-center text-sm mt-4"}>
                        {ad("users_page.unblock_user.alert_1")}
                        {user.email}
                        {ad("users_page.unblock_user.alert_2")}
                    </p>
                </div>


                <AlertDialogFooter>
                    <AlertDialogAction
                        className={"w-full bg-greenee-100 hover:bg-greenee-100/90 text-light-300"}
                        onClick={handleSubmit}
                    >
                        {ad("users_page.unblock_user.btn")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default UnblockUserDialog