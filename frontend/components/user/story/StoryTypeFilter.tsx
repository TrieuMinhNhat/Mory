"use client"


import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { StoryType } from "@/types/moment"
import { useTranslation } from "next-i18next"
import {getStoryTypeIcon, toStoryType} from "@/utils/story"
import Filters from "@/components/shared/icons/Filters"


const storyTypeOptions = (u: (key: string) => string) => [
    { value: undefined, label: u("story.home.filter.all") },
    { value: StoryType.JOURNEY, label: u("story.create_story.selection.journey.title") },
    { value: StoryType.BEFORE_AFTER, label: u("story.create_story.selection.before_after.title") },
    { value: StoryType.CHALLENGE, label: u("story.create_story.selection.challenge.title") },
    { value: StoryType.ALBUM, label: u("story.create_story.selection.album.title") },
]

export default function StoryTypeFilter() {
    const { t: u } = useTranslation("user")
    const router = useRouter()
    const searchParams = useSearchParams()

    const initialType = toStoryType(searchParams.get("type") ?? undefined)
    const [typeFilter, setTypeFilter] = useState<StoryType | undefined>(initialType)

    useEffect(() => {
        const newType = toStoryType(searchParams.get("type") ?? undefined)
        if (newType !== typeFilter) {
            setTypeFilter(newType)
        }
    }, [searchParams, typeFilter])

    const options = storyTypeOptions(u)

    const onSelectType = (value: StoryType | undefined) => {
        setTypeFilter(value)
        const params = new URLSearchParams(Array.from(searchParams.entries()))

        if (value) {
            params.set("type", value)
        } else {
            params.delete("type")
        }

        router.replace(`?${params.toString()}`)
    }

    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="text-foreground-200 hover:bg-background-300 rounded-full p-1 flex items-center gap-1"
                >
                    <Filters className="size-5" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-52 bg-background-200 rounded-3xl" align={"end"}>
                {options.map(({ value, label }) => {
                    const Icon = value ? getStoryTypeIcon(value) : undefined;
                    return (
                        <DropdownMenuItem
                            key={value ?? "all"}
                            onSelect={() => onSelectType(value)}
                            className={`rounded-full cursor-pointer ${
                                typeFilter === value ? "bg-background-300" : "!bg-background-200"
                            } hover:!bg-background-300`}
                        >
                            <div className={"flex flex-row p-0.5 gap-1 items-center"}>
                                {Icon ? (
                                    <Icon className="size-5 text-foreground" />
                                ) : (
                                    <div className={"p-0.5"}>
                                        <div className="size-4 rounded-full bg-foreground-200" />
                                    </div>
                                )}
                                <p className={"text-sm "}>
                                    {label}
                                </p>
                            </div>

                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
