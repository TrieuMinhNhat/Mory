"use client"

import { ColumnLabel, ColumnVisibility, ColumnWidth } from "@/types/adminUser";
import {useTranslation} from "next-i18next";

interface Props {
    columnLabels: ColumnLabel;
    columnWidth: ColumnWidth;
    columnVisibility: ColumnVisibility;
}

const UsersTableHeader = ({ columnLabels, columnWidth, columnVisibility }: Props) => {
    const {t: ad}  = useTranslation("admin");
    const columns = [
        { key: "basicInformation", label: columnLabels.basicInformation, show: true, width: columnWidth.basicInformation },
        { key: "joinedDate", label: columnLabels.joinedDate, show: columnVisibility.joinedDate, width: columnWidth.joinedDate },
        { key: "role", label: columnLabels.role, show: columnVisibility.role, width: columnWidth.role },
        { key: "status", label: columnLabels.status, show: columnVisibility.status, width: columnWidth.status },
        { key: "actions", label: columnLabels.actions, show: columnVisibility.actions, width: columnWidth.actions },
    ];

    const visibleColumns = columns.filter(col => col.show);
    const gridTemplateColumns = visibleColumns.map(col => col.width).join(" ");

    return (
        <div
            className="w-full grid border-b text-sm font-medium bg-primary rounded-md py-2"
            style={{ gridTemplateColumns }}
        >
            {columns.map(col =>
                col.show ? (
                    <div
                        key={col.key}
                        className={`flex items-start overflow-hidden truncate px-2
                            ${col.key === "basicInformation" ? "justify-start" : "justify-center"} 
                            text-primary-foreground`}
                    >
                        {ad(col.label)}
                    </div>
                ) : null
            )}
        </div>
    );
};

export default UsersTableHeader;
