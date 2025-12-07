"use client"

import { Button } from "@/components/ui/button";
import {OlyneQuestion, QuestionColumnVisibility, QuestionColumnWidth} from "@/types/adminQuestion";
import {Menu, SquarePen, Trash} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {useAdminQuestionStore} from "@/store/admin/useAdminQuestionStore";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import i18n from "i18next";
import {useTranslation} from "next-i18next";

interface Props {
    setQuestion: (question: OlyneQuestion) => void;
    setIsDeleteDialogOpen: (isOpen: boolean) => void;
    selectedQuestion: OlyneQuestion | undefined;
    setIsEditDialogOpen: (isOpen: boolean) => void;
    question: OlyneQuestion;
    columnWidth: QuestionColumnWidth,
    columnVisibility: QuestionColumnVisibility
}

const QuestionsTableRow = ({selectedQuestion, setQuestion, setIsDeleteDialogOpen, setIsEditDialogOpen, question, columnWidth, columnVisibility}: Props) => {
    const {t: ad} = useTranslation("admin");

    const columns = [
        { key: "contentEN", show: columnVisibility.contentEN, width: columnWidth.contentEN },
        { key: "contentVI", show: columnVisibility.contentVI, width: columnWidth.contentVI },
        { key: "topic", show: columnVisibility.topic, width: columnWidth.topic },
        { key: "difficulty", show: columnVisibility.difficulty, width: columnWidth.difficulty },
        { key: "type", show: columnVisibility.type, width: columnWidth.type },
        { key: "active", show: columnVisibility.active, width: columnWidth.active },
        { key: "actions", show: columnVisibility.actions, width: columnWidth.actions },
    ];

    const isUpdatingQuestion = useAdminQuestionStore((state) => state.isUpdatingQuestion);

    const visibleColumns = columns.filter(col => col.show);
    const gridTemplateColumns = visibleColumns.map(col => col.width).join(" ");

    return (
        <>
            <div
                className="w-full grid border-b border-background-m bg-background-100 py-3"
                style={{ gridTemplateColumns }}
            >
                {columnVisibility.contentEN && (
                    <div className="flex items-center text-sm border-x border-background-m line-clamp-2 px-1">
                        <ContentWithLoader isLoading={isUpdatingQuestion && selectedQuestion?.id === question.id}>
                            {question.contentEN}
                        </ContentWithLoader>
                    </div>
                )}
                {columnVisibility.contentVI && (
                    <div className="flex items-center text-sm border-x border-background-m line-clamp-2 px-1">
                        <ContentWithLoader isLoading={isUpdatingQuestion && selectedQuestion?.id === question.id}>
                            {question.contentVI}
                        </ContentWithLoader>
                    </div>
                )}
                {columnVisibility.topic && (
                    <div className="flex items-center justify-center border-x border-background-m text-sm text-center line-clamp-2 px-1">
                        <ContentWithLoader isLoading={isUpdatingQuestion && selectedQuestion?.id === question.id}>
                            {i18n.language === "vi" ? question.topic.nameVI : question.topic.nameEN}
                        </ContentWithLoader>
                    </div>
                )}
                {columnVisibility.difficulty&& (
                    <div className="flex items-center justify-center border-x border-background-m text-sm px-1">
                        <ContentWithLoader isLoading={isUpdatingQuestion && selectedQuestion?.id === question.id}>
                            {question.difficulty}
                        </ContentWithLoader>
                    </div>
                )}
                {columnVisibility.type && (
                    <div className="flex items-center justify-center border-x border-background-m text-sm line-clamp-2 px-1">
                        <ContentWithLoader isLoading={isUpdatingQuestion && selectedQuestion?.id === question.id}>
                            {ad(`questions_page.type_labels.${question.type}`)}
                        </ContentWithLoader>
                    </div>
                )}
                {columnVisibility.active && (
                    <div className="flex items-center justify-center border-x border-background-m text-sm truncate px-1">
                        <ContentWithLoader isLoading={isUpdatingQuestion && selectedQuestion?.id === question.id}>
                            {question.active}
                        </ContentWithLoader>
                    </div>
                )}
                {columnVisibility.actions && (
                    <div className="flex items-center justify-center border-x border-background-m text-sm truncate px-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className={"bg-transparent shadow-none hover:bg-transparent text-foreground hover:text-primary"}
                                    disabled={isUpdatingQuestion}
                                >
                                    <ContentWithLoader isLoading={isUpdatingQuestion && selectedQuestion?.id === question.id}>
                                        <Menu/>
                                    </ContentWithLoader>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side={"left"} className={"bg-background-300 py-2"}>
                                <div className={"flex flex-row items-center justify-center gap-2"}>
                                    <Button
                                        size={"sm"}
                                        className={"shadow-none"}
                                        onClick={() => {
                                            setIsEditDialogOpen(true);
                                            setQuestion(question);
                                        }}
                                    >
                                        <SquarePen/>
                                    </Button>
                                    <Button
                                        size={"sm"}
                                        className={"shadow-none bg-error hover:bg-error/90 text-fg-light-100"}
                                        onClick={() => {
                                            setIsDeleteDialogOpen(true);
                                            setQuestion(question);
                                        }}
                                    >
                                        <Trash/>
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
        </>
    )
}
export default QuestionsTableRow