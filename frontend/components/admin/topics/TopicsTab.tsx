"use client";

import { useAdminQuestionStore } from "@/store/admin/useAdminQuestionStore";
import { useTranslation } from "next-i18next";
import {
    defaultTopicColumnVisibility,
    defaultTopicColumnWidth, QuestionTopic,
    topicColumnLabel
} from "@/types/adminQuestion";
import { useState, useEffect } from "react";
import TopicColumnFilter from "@/components/admin/topics/table/TopicColumnFilter";
import {Button} from "@/components/ui/button";
import TopicsTableHeader from "@/components/admin/topics/table/TopicsTableHeader";
import TopicsTableRow from "@/components/admin/topics/table/TopicsTableRow";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import OPlus from "@/components/shared/icons/OPlus";
import {shallow} from "zustand/vanilla/shallow";
import CreateTopicDialog from "@/components/admin/topics/CreateTopicDialog";
import EditTopicDialog from "@/components/admin/topics/EditTopicDialog";

const STORAGE_KEY = "admin_topics_column_visibility";

interface Props {
    onChangeTab: () => void;
}


const TopicsTab = ({onChangeTab}: Props) => {
    const {topics, isCreatingTopic} = useAdminQuestionStore(
        (state) => ({
            topics: state.topics,
            isCreatingTopic: state.isCreatingTopic,
        }),
        shallow
    );

    const { t: ad } = useTranslation("admin");

    const [columnVisibility, setColumnVisibility] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        }
        return defaultTopicColumnVisibility;
    });

    const [isCreateTopicDialogOpen, setIsCreateTopicDialogOpen] = useState(false);
    const [isEditTopicDialogOpen, setIsEditTopicDialogOpen] = useState(false);

    const [selectedTopic, setSelectedTopic] = useState<QuestionTopic | undefined>(undefined);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
    }, [columnVisibility]);

    if (!topics) return null;

    return (
        <div className={"flex flex-col h-[calc(100vh-6rem)]"}>
            <div className={"shrink-0 flex flex-row items-center bg-background-100 gap-2 rounded-t-lg shadow p-4"}>
                <div className={"text-base font-semibold flex-row flex gap-2 text-foreground flex-1"}>
                    <Button
                        className={"p-0 rounded-lg bg-transparent hover:bg-background-300 shadow-none text-foreground"}
                        onClick={onChangeTab}
                    >
                        <p className={"py-1 px-3 rounded-lg"}>
                            {ad("questions_page.title")}
                        </p>
                    </Button>
                    <Button className={"p-0 rounded-lg hover:bg-primary hover:cursor-default shadow-none"}>
                        <p className={"py-1 px-3"}>
                            {ad("questions_page.topics_tab.title")}
                        </p>
                    </Button>
                </div>


                <TopicColumnFilter
                    columnVisibility={columnVisibility}
                    setColumnVisibility={setColumnVisibility}
                />

                {/*  Add Topic Button  */}
                <Button
                    size={"sm"}
                    className={"px-2"}
                    onClick={() => {setIsCreateTopicDialogOpen(true);}}
                >
                    <ContentWithLoader isLoading={isCreatingTopic}>
                        {ad("questions_page.create_question_btn")}
                        <OPlus className={"size-8"}/>
                    </ContentWithLoader>
                </Button>
            </div>

            <div className={"w-full px-4 bg-background-100"}>
                <TopicsTableHeader
                    columnLabels={topicColumnLabel}
                    columnWidth={defaultTopicColumnWidth}
                    columnVisibility={columnVisibility}
                />
            </div>

            <div
                className={"flex-1 overflow-y-auto scrollbar-thumb-only bg-background-100 rounded-b-lg pl-4 pr-[6px]"}
                style={{ scrollbarGutter: "stable" }}
            >
                {topics.map((topic, index) => (
                    <TopicsTableRow
                        key={index}
                        setIsOpen={setIsEditTopicDialogOpen}
                        selectedTopic={selectedTopic}
                        setTopic={setSelectedTopic}
                        topic={topic}
                        columnWidth={defaultTopicColumnWidth}
                        columnVisibility={columnVisibility}
                    />
                ))}
            </div>
            {isCreateTopicDialogOpen && (
                <CreateTopicDialog isOpen={isCreateTopicDialogOpen} setIsOpen={setIsCreateTopicDialogOpen}/>
            )}
            {isEditTopicDialogOpen && selectedTopic && (
                <EditTopicDialog
                    topic={selectedTopic}
                    isOpen={isEditTopicDialogOpen}
                    setIsOpen={setIsEditTopicDialogOpen}
                    setTopic={setSelectedTopic}
                />
            )}
        </div>
    );
};

export default TopicsTab;
