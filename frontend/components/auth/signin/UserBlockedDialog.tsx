"use client"

import {
    AlertDialog, AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import {CircleAlert} from "lucide-react";
import React, {JSX} from "react";
import {useTranslation} from "next-i18next";
import { TFunction } from "i18next";

interface Props {
    unblockAt: string;
    permanent: boolean;
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

const UserBlockedDialog = ({unblockAt, permanent, isOpen, setIsOpen}: Props) => {
    const {t: a} = useTranslation("auth");
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className={"w-[400px] bg-container-100"}>
                <AlertDialogHeader className={"w-full items-center"}>
                    <AlertDialogTitle className={"text-xl font-medium text-foreground text-center"}>
                        <div className={"bg-error/10 rounded-full w-fit p-2"}>
                            <div className={"bg-error rounded-full w-fit text-light-300 p-4"}>
                                <CircleAlert width={32} height={32}/>
                            </div>
                        </div>
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
                <p className={"text-center"}>
                    {getBlockMessage(unblockAt, permanent, a)}
                </p>

                <AlertDialogFooter>
                    <AlertDialogAction
                        className={"w-full bg-error hover:bg-error/90 text-light-300"}
                    >
                        OK
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

const formatUnblockTime = (unblockAt: string): string => {
    const date = new Date(unblockAt);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // tháng bắt đầu từ 0
    const year = date.getFullYear();

    return `${hours}:${minutes}, ${day}/${month}/${year}`;
}

const getBlockMessage = (
    unblockAt: string,
    permanent: boolean,
    a: TFunction<"auth", undefined>
): JSX.Element => {
    if (permanent) return <>{a("sign_in.permanent")}</>;
    return (
        <>
            {a("sign_in.blocked")} <br />
            {formatUnblockTime(unblockAt)}
        </>
    );
};

export default UserBlockedDialog;