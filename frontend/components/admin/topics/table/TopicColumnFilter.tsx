"use client"

import { topicColumnLabel, TopicColumnVisibility } from "@/types/adminQuestion";
import React, { SetStateAction } from "react";
import { useTranslation } from "next-i18next";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";

type Props = {
    columnVisibility: TopicColumnVisibility,
    setColumnVisibility: React.Dispatch<SetStateAction<TopicColumnVisibility>>
};

const TopicColumnFilter = ({ columnVisibility, setColumnVisibility }: Props) => {
    const { t: ad } = useTranslation("admin");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="relative pl-2 pr-8" size="sm">
                    {ad("questions_page.topics_tab.columns.filter_label")}
                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-48 bg-background-300 text-foreground"
            >
                {Object.keys(columnVisibility).map((key) => (
                    <DropdownMenuCheckboxItem
                        key={key}
                        checked={columnVisibility[key as keyof typeof columnVisibility]}
                        onCheckedChange={(checked) => {
                            setColumnVisibility((prev: TopicColumnVisibility) => ({
                                ...prev,
                                [key]: checked,
                            }));
                        }}
                        disabled={key === "actions"}
                    >
                        {ad(topicColumnLabel[key as keyof typeof topicColumnLabel])}
                        {key.includes("EN") && (
                            <span className="absolute top-0 right-0 m-1 px-2 rounded bg-foreground text-background text-xs font-bold">
                                EN
                            </span>
                        )}
                        {key.includes("VI") && (
                            <span className="absolute top-0 right-0 m-1 px-2 rounded bg-error text-light-300 text-xs font-bold">
                                VI
                            </span>
                        )}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default TopicColumnFilter;
