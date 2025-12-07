"use client"

import {
    AlertDialog, AlertDialogAction,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from "react";
import {useTranslation} from "next-i18next";
import {CircleAlert, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {OlyneQuestion} from "@/types/adminQuestion";
import {toast} from "sonner";
import {useAdminQuestionStore} from "@/store/admin/useAdminQuestionStore";
import {shallow} from "zustand/vanilla/shallow";
import ContentWithLoader from "@/components/shared/ContentWithLoader";


interface Props {
    question: OlyneQuestion
    isOpen: boolean;
    setIsOpen: (value: boolean) => void,
    setQuestion: (question: OlyneQuestion | undefined) => void,
}

const DeleteQuestionDialog = ({question, isOpen, setIsOpen, setQuestion}: Props) => {
    const {t: ad} = useTranslation("admin");
    const {t: ts} = useTranslation("toast");

    const {isDeletingQuestion, deleteQuestion} = useAdminQuestionStore(
        (state) => ({
            isDeletingQuestion: state.isDeletingQuestion,
            deleteQuestion: state.deleteQuestion,
        }),
        shallow
    );

    const handleSubmit = async () => {
        setIsOpen(false);
        setQuestion(undefined)
        const result = await deleteQuestion(question.id);
        if (result.success) {
            toast.success(ts("admin.delete_question.success"));
        } else {
            toast.error(ts("admin.delete_question.error"));
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className={"w-full md:w-[600px]"}>
                <AlertDialogHeader className={"w-full items-center"}>
                    <AlertDialogTitle className={"text-xl font-medium text-center"}>
                        {ad("questions_page.delete_question.title")}
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

                <div className={"flex flex-col items-center"}>
                    {/* Icon */}
                    <div className={"bg-error/10 rounded-full w-fit p-2"}>
                        <div className={"bg-error rounded-full w-fit text-light-300 p-4"}>
                            <CircleAlert width={32} height={32}/>
                        </div>
                    </div>

                    <p className={"text-base mb-2 mt-4 text-center"}>{ad("questions_page.delete_question.alert")}</p>


                    <AlertDialogFooter className={"w-full mt-4"}>
                        <AlertDialogAction
                            className={"w-full bg-error hover:bg-error/90 h-10 md:h-12 text-light-300"}
                            onClick={handleSubmit}
                            disabled={isDeletingQuestion}
                        >
                            <ContentWithLoader isLoading={isDeletingQuestion}>
                                {ad("questions_page.delete_question.submit_btn")}
                            </ContentWithLoader>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}


export default DeleteQuestionDialog;