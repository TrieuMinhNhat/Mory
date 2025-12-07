"use client";

import { useTranslation } from "react-i18next";
import {
    TopicColumnLabel,
    TopicColumnVisibility,
    TopicColumnWidth,
} from "@/types/adminQuestion";

interface Props {
    columnLabels: TopicColumnLabel;
    columnWidth: TopicColumnWidth;
    columnVisibility: TopicColumnVisibility;
}

const TopicsTableHeader = ({columnLabels, columnWidth, columnVisibility,}: Props) => {
    const { t: ad } = useTranslation("admin");

    const columns = [
        { key: "nameEN", label: columnLabels.nameEN, show: columnVisibility.nameEN, width: columnWidth.nameEN },
        { key: "nameVI", label: columnLabels.nameVI, show: columnVisibility.nameVI, width: columnWidth.nameVI },
        { key: "descriptionEN", label: columnLabels.descriptionEN, show: columnVisibility.descriptionEN, width: columnWidth.descriptionEN },
        { key: "descriptionVI", label: columnLabels.descriptionVI, show: columnVisibility.descriptionVI, width: columnWidth.descriptionVI },
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

                        {col.key.includes("EN")  && (
                            <span className="absolute top-0 right-0 m-1 px-2 rounded bg-foreground text-background text-xs font-bold">
                                EN
                            </span>
                        )}
                        {col.key.includes("VI") && (
                            <span className="absolute top-0 right-0 m-1 px-2 rounded bg-error text-light-300 text-xs font-bold">
                                VI
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default TopicsTableHeader;
