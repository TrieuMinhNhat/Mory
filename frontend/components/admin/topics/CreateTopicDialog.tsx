"use client"

import {
    AlertDialog,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from "react";
import {useTranslation} from "next-i18next";
import CreateTopicForm from "@/components/admin/topics/CreatTopicForm";
import {X} from "lucide-react";
import {Button} from "@/components/ui/button";


interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

const CreateTopicDialog = ({isOpen, setIsOpen}: Props) => {
    const {t: ad} = useTranslation("admin");

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className={"w-full md:w-[600px]"}>
                <AlertDialogHeader className={"w-full items-center"}>
                    <AlertDialogTitle className={"text-xl font-medium text-fg-light-100 text-center"}>
                        {ad("questions_page.topics_tab.create_topic.title")}
                        <Button
                            size={"lg"}
                            onClick={() => setIsOpen(false)}
                            className={"absolute right-2 top-2 cursor-pointer sm:right-2 sm:top-2 px-2 text-foreground hover:text-error bg-transparent hover:bg-transparent"}
                        >
                            <X />
                        </Button>
                    </AlertDialogTitle>
                    <AlertDialogDescription></AlertDialogDescription>
                </AlertDialogHeader>
                <CreateTopicForm setIsOpen={setIsOpen}/>
                <AlertDialogFooter>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}


export default CreateTopicDialog;