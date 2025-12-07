"use client"

import {QuestionColumnLabel, QuestionColumnVisibility, QuestionColumnWidth} from "@/types/adminQuestion";
import { useTranslation } from "react-i18next";

interface Props {
    columnLabels: QuestionColumnLabel,
    columnWidth: QuestionColumnWidth,
    columnVisibility: QuestionColumnVisibility
}

const QuestionsTableHeader = ({columnLabels, columnWidth, columnVisibility}: Props) => {
    const {t: ad} = useTranslation("admin");

    const columns = [
        { key: "contentEN", label: columnLabels.contentEN, show: columnVisibility.contentEN, width: columnWidth.contentEN },
        { key: "contentVI", label: columnLabels.contentVI, show: columnVisibility.contentVI, width: columnWidth.contentVI },
        { key: "topic", label: columnLabels.topic, show: columnVisibility.topic, width: columnWidth.topic },
        { key: "difficulty", label: columnLabels.difficulty, show: columnVisibility.difficulty, width: columnWidth.difficulty },
        { key: "type", label: columnLabels.type, show: columnVisibility.type, width: columnWidth.type },
        { key: "active", label: columnLabels.active, show: columnVisibility.active, width: columnWidth.active },
        { key: "actions", label: columnLabels.actions, show: columnVisibility.actions, width: columnWidth.actions },
    ];

    const visibleColumns = columns.filter(col => col.show);
    const gridTemplateColumns = visibleColumns.map(col => col.width).join(" ");

    return (
        <div
            className="w-full grid border-b text-sm font-medium bg-primary rounded-md"
            style={{ gridTemplateColumns }}
        >
            {visibleColumns.map((col, index) => {
                const isFirst = index === 0;
                const isLast = index === visibleColumns.length - 1;

                let borderClass = "";
                if (isFirst) borderClass = "border-r";
                else if (isLast) borderClass = "border-l";
                else borderClass = "border-l border-r";

                return (
                    <div
                        key={col.key}
                        className={`relative flex items-start overflow-hidden truncate p-2 
                        text-primary-foreground justify-center ${borderClass} border-border`}
                    >
                        {ad(col.label)}

                        {col.key === "contentEN" && (
                            <span className="absolute top-0 right-0 m-1 px-2 rounded bg-foreground text-background text-xs font-bold">
                    EN
                </span>
                        )}
                        {col.key === "contentVI" && (
                            <span className="absolute top-0 right-0 m-1 px-2 rounded bg-error text-fg-light-100 text-xs font-bold">
                    VI
                </span>
                        )}
                    </div>
                );
            })}
        </div>
    )

}

export default QuestionsTableHeader;