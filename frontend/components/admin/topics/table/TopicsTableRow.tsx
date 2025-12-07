"use client"

import { QuestionTopic, TopicColumnVisibility, TopicColumnWidth } from "@/types/adminQuestion";
import {SquarePen} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useAdminQuestionStore} from "@/store/admin/useAdminQuestionStore";
import ContentWithLoader from "@/components/shared/ContentWithLoader";

interface Props {
    setTopic: (topic: QuestionTopic) => void;
    selectedTopic: QuestionTopic | undefined;
    setIsOpen: (isOpen: boolean) => void;
    topic: QuestionTopic;
    columnWidth: TopicColumnWidth;
    columnVisibility: TopicColumnVisibility;
}

const TopicsTableRow = ({setTopic, selectedTopic, setIsOpen, topic, columnWidth, columnVisibility }: Props) => {
    const columns = [
        { key: "nameEN", show: columnVisibility.nameEN, width: columnWidth.nameEN },
        { key: "nameVI", show: columnVisibility.nameVI, width: columnWidth.nameVI },
        { key: "descriptionEN", show: columnVisibility.descriptionEN, width: columnWidth.descriptionEN },
        { key: "descriptionVI", show: columnVisibility.descriptionVI, width: columnWidth.descriptionVI },
        { key: "actions", show: columnVisibility.actions, width: columnWidth.actions },
    ];

    const visibleColumns = columns.filter(col => col.show);
    const gridTemplateColumns = visibleColumns.map(col => col.width).join(" ");

    const isUpdatingTopic = useAdminQuestionStore((state) => state.isUpdatingTopic);

    return (
        <div
            className="w-full grid border-b border-background-m bg-container-200 py-3"
            style={{ gridTemplateColumns }}
        >
            {columnVisibility.nameEN && (
                <div className="flex items-center justify-center text-sm border-x border-background-m line-clamp-2 px-1">
                    <ContentWithLoader isLoading={isUpdatingTopic && selectedTopic?.id === topic.id}>
                        {topic.nameEN}
                    </ContentWithLoader>
                </div>
            )}
            {columnVisibility.nameVI && (
                <div className="flex items-center justify-center text-sm border-x border-background-m line-clamp-2 px-1">
                    <ContentWithLoader isLoading={isUpdatingTopic && selectedTopic?.id === topic.id}>
                        {topic.nameVI}
                    </ContentWithLoader>
                </div>
            )}
            {columnVisibility.descriptionEN && (
                <div className="flex items-center text-sm line-clamp-2 border-x border-background-m px-1">
                    <ContentWithLoader isLoading={isUpdatingTopic && selectedTopic?.id === topic.id}>
                        {topic.descriptionEN}
                    </ContentWithLoader>
                </div>
            )}
            {columnVisibility.descriptionVI && (
                <div className="flex items-center text-sm line-clamp-2 border-x border-background-m px-1">
                    <ContentWithLoader isLoading={isUpdatingTopic && selectedTopic?.id === topic.id}>
                        {topic.descriptionVI}
                    </ContentWithLoader>
                </div>
            )}
            {columnVisibility.actions && (
                <div className="flex items-center justify-center text-sm truncate border-x border-background-m px-1">
                    <Button
                        size={"sm"}
                        className={"bg-transparent shadow-none hover:bg-transparent text-primary hover:bg-background-m"}
                        onClick={() => {
                            setTopic(topic);
                            setIsOpen(true);
                        }}
                    >
                        <ContentWithLoader isLoading={isUpdatingTopic && selectedTopic?.id === topic.id}>
                            <SquarePen/>
                        </ContentWithLoader>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TopicsTableRow;
