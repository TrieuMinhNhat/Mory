"use client"

import {
    AlertDialog, AlertDialogAction,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React, {useState} from "react";
import {CircleAlert} from "lucide-react";
import Image from "next/image";
import {BlockLevel, blockLevels, AdminUser} from "@/types/adminUser";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useAdminUserStore} from "@/store/admin/useAdminUserStore";
import {BlockUserParams} from "@/lib/services/adminUser.service";
import {toast} from "sonner";
import {useTranslation} from "next-i18next";
import { TFunction } from "i18next";


interface Props {
    user: AdminUser;
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

const BlockUserDialog = ({user, isOpen, setIsOpen}: Props) => {
    const blv: BlockLevel[] = blockLevels;
    const blockUser = useAdminUserStore((state) => state.blockUser)
    const [selectedBlockLevel, setSelectedBlockLevel] = useState<BlockLevel>(blv[0]);


    const {t: ts} = useTranslation("toast");
    const {t: ad} = useTranslation("admin");

    const handleSubmit = async () => {
        const params: BlockUserParams = {
            userId: user.id,
            blockLevel: selectedBlockLevel.name,
        }
        const result = await blockUser(params);
        if (result.success) {
            toast.success(ts("admin.block_user.success"));
        } else {
            toast.error(ts("admin.block_user.error"));
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className={"w-[400px]"}>
                <AlertDialogHeader className={"w-full items-center"}>
                    <AlertDialogTitle className={"text-xl font-medium  text-center"}>
                        {ad("users_page.block_user.title")}
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
                    <div className={"bg-error/10 rounded-full w-fit p-2"}>
                        <div className={"bg-error rounded-full w-fit text-fg-light-100 p-4"}>
                            <CircleAlert width={32} height={32}/>
                        </div>
                    </div>

                    <p className={"text-sm mb-2 mt-4 font-medium"}>{ad("users_page.block_user.duration")}</p>

                    <div className={"w-[160px]"}>
                        <Select
                            value={selectedBlockLevel.name}
                            onValueChange={(value) => {
                                const selected: BlockLevel = blv.find((b) => b.name === value) ?? blv[0];
                                setSelectedBlockLevel(selected);
                            }}
                        >
                            <SelectTrigger
                                className={"bg-transparent border-error focus:outline-none outline-none focus:border-error focus:ring-0"}>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent className={"bg-background-300"}>
                                {blv.map((level) => (
                                    <SelectItem
                                        key={level.name}
                                        value={level.name}
                                    >
                                        <span>{level.name} - </span>
                                        <span className="text-foreground/70 text-sm">
                                            {formatDuration(level.durationSeconds, ad)}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>


                    </div>
                    <p className={"text-center text-sm mt-4"}>
                        {ad("users_page.block_user.alert_1")}
                        {user.email}
                        {ad("users_page.block_user.alert_2")}
                        {formatDuration(selectedBlockLevel?.durationSeconds, ad)}
                    </p>
                </div>


                <AlertDialogFooter>
                    <AlertDialogAction
                        className={"w-full bg-error hover:bg-error/90 text-fg-light-100"}
                        onClick={handleSubmit}
                    >
                        {ad("users_page.block_user.btn")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

function formatDuration(seconds: number, ad: TFunction<"admin", undefined>): string {
    if (seconds == -1) return "";
    if (seconds < 3600) return `${seconds / 60} ${ad("users_page.block_user.minute")}` ;
    if (seconds < 86400) return `${seconds / 3600} ${ad("users_page.block_user.hour")}`;
    return `${seconds / 86400} ${ad("users_page.block_user.day")}`;
}

export default BlockUserDialog;