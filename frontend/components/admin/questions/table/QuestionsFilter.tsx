"use client"

import {QuestionTopic, QuestionType} from "@/types/adminQuestion";
import {useTranslation} from "next-i18next";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {ListFilterPlus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useAdminQuestionStore} from "@/store/admin/useAdminQuestionStore";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import i18n from "i18next";

const TYPE_LABELS: Record<QuestionType, string> = {
    [QuestionType.OPEN_ENDED]: "OPEN_ENDED",
    [QuestionType.YES_NO]: "YES_NO",
    [QuestionType.MULTIPLE_CHOICE]: "MULTIPLE_CHOICE",
    [QuestionType.RATING]: "RATING",
    [QuestionType.SCALE]: "SCALE",
    [QuestionType.IMAGE]: "IMAGE",
    [QuestionType.VIDEO]: "VIDEO",
    [QuestionType.AUDIO]: "AUDIO"
};

type Props = {
    topicId?: string;
    type?: QuestionType;
    updateQueryParam: (key: string, value: string | number | boolean | null) => void;
}

const QuestionsFilter = ({topicId, type, updateQueryParam}: Props) => {
    const {t: ad} = useTranslation("admin");

    const topics = useAdminQuestionStore((state) => state.topics);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="p-2" size="sm">
                    {ad("questions_page.filter.btn")}
                    <ListFilterPlus />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2 space-y-3 bg-background-300 text-foreground" align="end">
                {/*  Type Select  */}
                <div className="flex flex-col w-full gap-2">
                    <label className="text-sm font-medium block">{ad("questions_page.filter.label.type")}</label>
                    <Select
                        value={type || "all"}
                        onValueChange={(value) => updateQueryParam("type", value === "all" ? null : value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Type"/>
                        </SelectTrigger>
                        <SelectContent className="bg-background-200">
                            <div className="grid grid-cols-2 gap-2 p-2">
                                <SelectItem value="all">{ad("questions_page.filter.label.all_types")}</SelectItem>

                                {Object.entries(TYPE_LABELS).map(([code]) => (
                                    <SelectItem key={code} value={code}>
                                        {ad(`questions_page.type_labels.${code}`)}
                                    </SelectItem>
                                ))}
                            </div>

                        </SelectContent>
                    </Select>
                </div>

                {/* Topic Select */}
                <div className="flex flex-col w-full gap-2">
                    <label className="text-sm font-medium block">
                        {ad("questions_page.filter.label.topic")}
                    </label>
                    <Select
                        value={topicId || "all"}
                        onValueChange={(value) =>
                            updateQueryParam("topicId", value === "all" ? null : value)
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Topic" />
                        </SelectTrigger>
                        <SelectContent className="bg-background-200 max-h-64 lg:max-h-96 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2 p-2">
                                <SelectItem value="all">{ad("questions_page.filter.label.all_topics")}</SelectItem>
                                {topics.map((topic: QuestionTopic) => (
                                    <SelectItem key={topic.id} value={topic.id.toString()}>
                                        {i18n.language === "vi" ? topic.nameVI : topic.nameEN}
                                    </SelectItem>
                                ))}
                            </div>
                        </SelectContent>
                    </Select>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default QuestionsFilter;