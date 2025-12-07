"use client"

import {
    AlertDialog,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from "react";
import {useTranslation} from "next-i18next";
import {X} from "lucide-react";
import {Button} from "@/components/ui/button";
import EditQuestionForm from "@/components/admin/questions/EditQuestionForm";
import {OlyneQuestion} from "@/types/adminQuestion";


interface Props {
    question: OlyneQuestion
    isOpen: boolean;
    setIsOpen: (value: boolean) => void,
    setQuestion: (question: OlyneQuestion | undefined) => void,
}

const EditQuestionDialog = ({question, isOpen, setIsOpen, setQuestion}: Props) => {
    const {t: ad} = useTranslation("admin");

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className={"w-full md:w-[600px]"}>
                <AlertDialogHeader className={"w-full items-center"}>
                    <AlertDialogTitle className={"text-xl font-medium text-center"}>
                        {ad("questions_page.edit_question.title")}
                        <Button
                            size={"lg"}
                            onClick={() => {
                                setIsOpen(false)
                                setQuestion(undefined)
                            }}
                            className={"absolute right-2 top-2 cursor-pointer sm:right-2 sm:top-2 px-2 text-foreground hover:text-error bg-transparent hover:bg-transparent"}
                        >
                            <X />
                        </Button>
                    </AlertDialogTitle>
                    <AlertDialogDescription></AlertDialogDescription>
                </AlertDialogHeader>
                <EditQuestionForm setIsOpen={setIsOpen} question={question} setQuestion={setQuestion}/>
                <AlertDialogFooter>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}


export default EditQuestionDialog;