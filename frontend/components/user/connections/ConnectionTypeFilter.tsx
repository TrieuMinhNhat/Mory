"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "next-i18next"
import Filters from "@/components/shared/icons/Filters"
import { ConnectionType } from "@/types/connections"
import {getConnectionTypeIcon, getConnectionTypeLabel, toConnectionType} from "@/utils/connection"
import {TFunction} from "i18next";

const connectionTypeOptions = (u: TFunction) => [
    { value: undefined, label: u("connections.filter.all", "All") },
    { value: ConnectionType.FRIEND, label: getConnectionTypeLabel(ConnectionType.FRIEND, u) },
    { value: ConnectionType.CLOSE_FRIEND, label: getConnectionTypeLabel(ConnectionType.CLOSE_FRIEND, u) },
    { value: ConnectionType.SPECIAL, label: getConnectionTypeLabel(ConnectionType.SPECIAL, u) },
]

export default function ConnectionTypeFilter() {
    const { t: u } = useTranslation("user")

    const router = useRouter()
    const searchParams = useSearchParams()

    const initialType = toConnectionType(searchParams.get("type") ?? undefined)
    const [typeFilter, setTypeFilter] = useState<ConnectionType | undefined>(initialType)

    useEffect(() => {
        const newType = toConnectionType(searchParams.get("type") ?? undefined)
        if (newType !== typeFilter) {
            setTypeFilter(newType)
        }
    }, [searchParams, typeFilter])

    const options = connectionTypeOptions(u)

    const onSelectType = (value: ConnectionType | undefined) => {
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
                    className="outline-none text-foreground-200 hover:bg-background-300 rounded-full p-1 flex items-center gap-1"
                >
                    <Filters className="size-5" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-52 bg-background-200 rounded-3xl" align="end">
                {options.map(({ value, label }) => {
                    const Icon = value ? getConnectionTypeIcon(value) : undefined;
                    return (
                        <DropdownMenuItem
                            key={value ?? "all"}
                            onSelect={() => onSelectType(value)}
                            className={`rounded-full cursor-pointer ${
                                typeFilter === value ? "bg-background-300" : "!bg-background-200"
                            } hover:!bg-background-300`}
                        >
                            <div className="flex flex-row p-0.5 gap-1 items-center">
                                {Icon ? (
                                    <Icon className="size-5 text-foreground" />
                                ) : (
                                    <div className={"p-0.5"}>
                                        <div className="size-4 rounded-full bg-foreground-200" />
                                    </div>
                                )}

                                <p className="text-sm">
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
