"use client"

import {useAdminQuestionStore} from "@/store/admin/useAdminQuestionStore";
import {shallow} from "zustand/vanilla/shallow";
import {useRouter, useSearchParams} from "next/navigation";
import {useTranslation} from "next-i18next";
import {
    defaultQuestionColumnVisibility,
    defaultQuestionColumnWidth, OlyneQuestion,
    questionColumnLabel,
    QuestionType
} from "@/types/adminQuestion";
import {useEffect, useState} from "react";
import QuestionsFilter from "@/components/admin/questions/table/QuestionsFilter";
import QuestionColumnFilter from "@/components/admin/questions/table/QuestionsColumnFilter";
import QuestionsTableHeader from "@/components/admin/questions/table/QuestionsTableHeader";
import QuestionsTableRow from "@/components/admin/questions/table/QuestionsTableRow";
import CustomPagination from "@/components/shared/CustomPagination";
import {Button} from "@/components/ui/button";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import OPlus from "@/components/shared/icons/OPlus";
import CreateQuestionDialog from "@/components/admin/questions/CreateQuestionDialog";
import EditQuestionDialog from "@/components/admin/questions/EditQuestionDialog";
import DeleteQuestionDialog from "@/components/admin/questions/DeleteQuestionDialog";

const STORAGE_KEY = "admin_questions_column_visibility";

interface Props {
    onChangeTab: () => void;
}

const QuestionsTab = ({onChangeTab}: Props) => {
    const {
        questions,
        questionsPageInfo,
        isFetchingQuestions,
        topics,
        fetchTopics,
        fetchQuestions,
        isCreatingQuestion,
    } = useAdminQuestionStore(
        (state) => ({
            questions: state.questions,
            questionsPageInfo: state.questionPageInfo,
            isFetchingQuestions: state.isFetchingQuestions,
            topics: state.topics,
            fetchTopics: state.fetchTopics,
            fetchQuestions: state.fetchQuestions,
            isCreatingQuestion: state.isCreatingQuestion,
        }),
        shallow
    );
    const searchParams = useSearchParams();
    const router = useRouter();

    const {t: ad} = useTranslation("admin");

    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");
    const typeParam = searchParams.get("type");
    const type = (typeParam && Object.values(QuestionType).includes(typeParam as QuestionType))
        ? (typeParam as QuestionType)
        : undefined;
    const topicIdParam = searchParams.get("topicId");
    const topicId = (topicIdParam) ? topicIdParam : undefined;

    const updateQueryParam = (key: string, value: string | number | boolean | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === null || value === "") {
            params.delete(key);
        } else {
            params.set(key, String(value));
        }
        params.set("page", "0");
        router.push(`/admin/questions?${params.toString()}`);
    }

    useEffect(() => {
        void fetchQuestions({
            topicId: topicId || undefined,
            type: type || undefined,
            page,
            size
        })
        if (topics.length == 0) {
            void fetchTopics()
        }
        
    }, [fetchQuestions, fetchTopics, page, questions.length, size, topicId, topics.length, type]);

    const goToPage = (p: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", p.toString());
        router.push(`/admin/questions?${params.toString()}`);
    };

    const [columnVisibility, setColumnVisibility] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        }
        return defaultQuestionColumnVisibility;
    });

    const [isCreateQuestionDialogOpen, setIsCreateQuestionDialogOpen] = useState(false);
    const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<OlyneQuestion | undefined>(undefined);
    const [isDeleteQuestionDialogOpen, setIsDeleteQuestionDialogOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
    }, [columnVisibility]);

    if (!questions || !questionsPageInfo) return null;

    return (
        <div className={"flex flex-col h-[calc(100vh-6rem)]"}> {/* 100vh - height của header */}
            <div className={"shrink-0 flex flex-row items-center  bg-background-100 gap-2 rounded-t-lg shadow p-4"}>
                <div className={"text-base font-semibold flex-row flex gap-2 text-foreground flex-1"}>
                    <Button className={"p-0 rounded-lg hover:bg-primary hover:cursor-default shadow-none"}>
                        <p className={"py-1 px-3 rounded-lg"}>
                            {ad("questions_page.title")}
                        </p>
                    </Button>
                    <Button
                        className={"p-0 rounded-lg bg-transparent hover:bg-background-300 shadow-none text-foreground"}
                        onClick={onChangeTab}
                    >
                        <p className={"py-1 px-3"}>
                            {ad("questions_page.topics_tab.title")}
                        </p>
                    </Button>
                </div>

                <QuestionsFilter
                    topicId={topicId}
                    type={type}
                    updateQueryParam={updateQueryParam}
                />

                <QuestionColumnFilter
                    columnVisibility={columnVisibility}
                    setColumnVisibility={setColumnVisibility}
                />

                {/*  Add Question Button  */}
                <Button
                    size={"sm"}
                    className={"px-2"}
                    onClick={() => {setIsCreateQuestionDialogOpen(true)}}
                >
                    <ContentWithLoader isLoading={isCreatingQuestion || isFetchingQuestions}>
                        {ad("questions_page.create_question_btn")}
                        <OPlus className={"size-8"}/>
                    </ContentWithLoader>
                </Button>

            </div>
            <div className={"w-full px-4 bg-background-100"}>
                <QuestionsTableHeader
                    columnLabels={questionColumnLabel}
                    columnWidth={defaultQuestionColumnWidth}
                    columnVisibility={columnVisibility}
                />
            </div>
            <div
                className={"flex-1 overflow-y-auto scrollbar-thumb-only bg-background-100 rounded-b-lg pl-4 pr-[6px]"}
                style={{ scrollbarGutter: 'stable' }}
            >
                {
                    questions.map((question, index) => (
                        <QuestionsTableRow
                            key={index}
                            setQuestion={setSelectedQuestion}
                            setIsEditDialogOpen={setIsEditQuestionDialogOpen}
                            setIsDeleteDialogOpen={setIsDeleteQuestionDialogOpen}
                            selectedQuestion={selectedQuestion}
                            question={question}
                            columnWidth={defaultQuestionColumnWidth}
                            columnVisibility={columnVisibility}
                        />
                    ))
                }
            </div>
            <div className={"bg-background-100 rounded-b-lg py-2"}>
                <CustomPagination
                    currentPage={questionsPageInfo.currentPage}
                    totalPages={questionsPageInfo.totalPages}
                    hasNext={questionsPageInfo.hasNext}
                    isLoading={isFetchingQuestions}
                    onPageChange={goToPage}
                />
            </div>
            {isCreateQuestionDialogOpen && (
                <CreateQuestionDialog isOpen={isCreateQuestionDialogOpen} setIsOpen={setIsCreateQuestionDialogOpen} />
            )}
            {isEditQuestionDialogOpen && selectedQuestion && (
                <EditQuestionDialog
                    question={selectedQuestion}
                    isOpen={isEditQuestionDialogOpen}
                    setIsOpen={setIsEditQuestionDialogOpen}
                    setQuestion={setSelectedQuestion}
                />
            )}
            {isDeleteQuestionDialogOpen && selectedQuestion && (
                <DeleteQuestionDialog
                    question={selectedQuestion}
                    isOpen={isDeleteQuestionDialogOpen}
                    setIsOpen={setIsDeleteQuestionDialogOpen}
                    setQuestion={setSelectedQuestion}
                />
            )}
        </div>
    )
}

export default QuestionsTab;