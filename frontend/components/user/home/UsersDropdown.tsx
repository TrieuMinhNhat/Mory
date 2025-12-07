"use client";

import React, { useEffect } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {ChevronDown, ChevronRight} from "lucide-react";
import { useUserConnectionsStore } from "@/store/connection/useConnectionsStore";
import {ConnectionStatus, getOtherUserFromConnection} from "@/types/connections";
import { useSearchParams, useRouter } from "next/navigation";
import {shallow} from "zustand/vanilla/shallow";
import {cn} from "@/lib/utils";
import Image from "next/image";
import {useTranslation} from "next-i18next";
import Users from "@/components/shared/icons/Users";
import {useAuthStore} from "@/store/useAuthStore";

interface Props {
    disabled?: boolean;
}

const UsersDropdown = ({disabled}: Props) => {
    const {t: u} = useTranslation("user");
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTargetUserId = searchParams.get("targetUserId") ?? undefined;

    const user = useAuthStore((state) => state.user);
    const {
        connections,
        fetchConnections,
        connectionsHasFetchedOnce,
        isFetchingConnections,
    } = useUserConnectionsStore(
        (state) => ({
            connections: state.connections,
            fetchConnections: state.fetchConnections,
            connectionsHasFetchedOnce: state.connectionsHasFetchedOnce,
            isFetchingConnections: state.connectionsHasFetchedOnce,
        }),
        shallow
    );
    const [selectedUserId, setSelectedUserId] = React.useState<string | undefined>(initialTargetUserId);

    useEffect(() => {
        setSelectedUserId(initialTargetUserId);
    }, [initialTargetUserId]);

    useEffect(() => {
        if (!connectionsHasFetchedOnce && !isFetchingConnections) {
            void fetchConnections({status: ConnectionStatus.CONNECTED});
        }
    }, [fetchConnections, connectionsHasFetchedOnce, isFetchingConnections]);

    const selectedName = React.useMemo(() => {
        if (!selectedUserId) return u("connections.dropdown.all");
        
        if (selectedUserId === user?.id) return u("home.you")

        const conn = connections.find((c) => getOtherUserFromConnection(c)?.id === selectedUserId);
        if (!conn) return u("connections.dropdown.all");

        const otherUser = getOtherUserFromConnection(conn);
        return otherUser?.displayName ?? u("connections.dropdown.all");
    }, [selectedUserId, user?.id, u, connections]);

    const onSelectUser = (userId: string | undefined) => {
        setSelectedUserId(userId);
        const params = new URLSearchParams(searchParams.toString());

        if (userId) {
            params.set("targetUserId", userId);
        } else {
            params.delete("targetUserId");
        }

        router.push(`${window.location.pathname}?${params.toString()}`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    disabled={disabled}
                    className={`flex w-full items-center justify-center gap-1 rounded-full bg-background-200 px-4 py-2 text-lg font-medium !ring-0 focus:ring-0 hover:bg-background-300
                        ${disabled && "cursor-not-allowed bg-background-300 text-foreground-200"}
                    `}
                >
                    {selectedName}
                    <ChevronDown className="h-5 w-5" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn(
                    "w-[100vw] max-h-[50vh] !p-0 md:w-[434px] !bg-background-200 overflow-y-auto overflow-x-hidden border-none rounded-[29px]",
                    "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                )}
            >
                <DropdownMenuItem
                    onSelect={() => onSelectUser(undefined)}
                    className={`rounded-full hover:!bg-background-300 ${!selectedUserId ? "bg-background-300" : "!bg-background-200"}`}
                >
                    <div
                        className={"p-0.5 flex w-full flex-row items-center gap-2"}
                    >
                        <div
                            className={"w-10 h-10 flex items-center justify-center bg-background-200 shrink-0 relative rounded-full"}
                        >
                            <Users className={"size-6 text-foreground"}/>
                        </div>
                        <p className={"text-base w-full text-left"}>
                            {u("connections.dropdown.all")}
                        </p>
                        <ChevronRight className={"text-foreground-200 size-8"}/>
                    </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onSelect={() => onSelectUser(user?.id)}
                    className={`rounded-full ${selectedUserId === user?.id ? "bg-background-300" : "!bg-background-200"} hover:!bg-background-300`}
                >
                    <div
                        className={"p-0.5 flex w-full flex-row items-center gap-2"}
                    >
                        <div
                            className={"w-10 h-10 shrink-0 relative rounded-full"}
                        >
                            <Image
                                src={user?.profile?.avatarUrl ?? "/assets/images/avatar.png"}
                                alt={user?.profile?.displayName ?? "unknow"}
                                fill
                                sizes={"32px"}
                                className={"rounded-full"}
                            />
                        </div>
                        <p className={"text-base w-full text-left"}>
                            {u("home.you")}
                        </p>
                        <ChevronRight className={"text-foreground-200 size-8"}/>
                    </div>
                </DropdownMenuItem>
                {connections.map((conn) => {
                    const otherUser = getOtherUserFromConnection(conn);
                    return (
                        <DropdownMenuItem
                            key={conn.id}
                            onSelect={() => onSelectUser(otherUser?.id ?? null)}
                            className={`rounded-full ${selectedUserId === otherUser?.id ? "bg-background-300" : "!bg-background-200"} hover:!bg-background-300`}
                        >
                            <div
                                className={"p-0.5 flex w-full flex-row items-center gap-2"}
                            >
                                <div
                                    className={"w-10 h-10 shrink-0 relative rounded-full"}
                                >
                                    <Image
                                        src={otherUser?.avatarUrl ?? "/assets/images/avatar.png"}
                                        alt={otherUser?.displayName}
                                        fill
                                        sizes={"32px"}
                                        className={"rounded-full"}
                                    />
                                </div>
                                <p className={"text-base w-full text-left"}>
                                    {otherUser?.displayName ?? "Unknown"}
                                </p>
                                <ChevronRight className={"text-foreground-200 size-8"}/>
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UsersDropdown;
