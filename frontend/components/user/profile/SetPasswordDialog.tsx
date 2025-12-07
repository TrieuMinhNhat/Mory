import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {ChevronLeft, X} from "lucide-react";
import React from "react";
import {useTranslation} from "next-i18next";
import SetPasswordForm from "@/components/user/profile/forms/SetPasswordForm";

interface Props {
    isOpen: boolean;
    onIsOpenChange: (isOpen: boolean) => void;
}

const SetPasswordDialog = ({ isOpen, onIsOpenChange }: Props) => {
    const {t: u} = useTranslation("user")
    return (
        <Dialog open={isOpen} onOpenChange={onIsOpenChange}>
            <DialogContent className="w-full md:max-w-[500px] h-full md:h-fit !pt-2 flex flex-col md:rounded-xl">
                <div className={"w-full flex flex-row md:pt-1 items-center"}>
                    <DialogClose asChild>
                        <button className={"block md:hidden rounded-full text-foreground-200 hover:text-foreground p-1 hover:bg-background-200"}>
                            <ChevronLeft className={"size-7"}/>
                        </button>
                    </DialogClose>
                    <DialogTitle className={"text-xl w-full pl-1 pr-8 md:pr-0 md:pl-8 font-medium text-left md:text-center"}>
                        {u("profile.set_password.title")}
                    </DialogTitle>
                    <DialogClose asChild>
                        <button className={" hidden md:block p-1 rounded-full hover:bg-background-200"}>
                            <X className={"size-6"}/>
                        </button>
                    </DialogClose>
                    <DialogDescription></DialogDescription>
                </div>
                <SetPasswordForm onClose={() => onIsOpenChange(false)}/>
            </DialogContent>
        </Dialog>
    )
}

export default SetPasswordDialog;