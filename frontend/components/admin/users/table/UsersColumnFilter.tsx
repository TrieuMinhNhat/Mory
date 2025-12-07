"use client";

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { columnLabels, ColumnVisibility } from "@/types/adminUser";
import { useTranslation } from "next-i18next";
import React from "react";

type UsersColumnFilterProps = {
    columnVisibility: ColumnVisibility;
    setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>;
};

const UsersColumnFilter = ({ columnVisibility, setColumnVisibility }: UsersColumnFilterProps) => {
    const { t: ad } = useTranslation("admin");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className={"relative pl-2 pr-8"} size={"sm"}>
                    {ad("users_page.columns.filter_label")}
                    <ChevronDownIcon className={"absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4"} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align={"end"}
                className={"w-48 bg-background-300 text-foreground"}
            >
                {Object.keys(columnVisibility).map((key) => (
                    <DropdownMenuCheckboxItem
                        key={key}
                        checked={columnVisibility[key as keyof typeof columnVisibility]}
                        onCheckedChange={(checked) => {
                            setColumnVisibility((prev: ColumnVisibility) => ({
                                ...prev,
                                [key]: checked,
                            }));
                        }}
                    >
                        {ad(columnLabels[key as keyof typeof columnLabels])}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UsersColumnFilter;
