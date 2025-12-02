"use client"

import React, {useCallback, useEffect, useState} from "react";
import {useTranslation} from "next-i18next";
import {Search} from "lucide-react";
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore";
import {shallow} from "zustand/shallow";
import ConnectionListItemSkeleton from "@/components/user/connections/home/ConnectionListItemSkeleton";
import ConnectionListItem from "@/components/user/connections/home/ConnectionListItem";
import {useRouter, useSearchParams} from "next/navigation";
import {ROUTES} from "@/constants/routes";
import {ConnectionStatus} from "@/types/connections";
import EmptyList from "@/components/shared/EmptyList";
import {useConnectWithMeDialogStore} from "@/store/connection/useConnectWithMeDialogStore";
import {toConnectionType} from "@/utils/connection";
import {Input} from "@/components/ui/input";
import ConnectionTypeFilter from "@/components/user/connections/ConnectionTypeFilter";
import {AnimatePresence, motion} from "framer-motion";

const SCROLL_THRESHOLD = 100;

const ConnectionHomePage = () => {
    const {t: u} = useTranslation("user");
    const router = useRouter();

    const searchParams = useSearchParams();
    const type = toConnectionType(searchParams.get("type") ?? undefined);

    const [searchBarOpen, setSearchBarOpen] = useState(false);
    
    const {
        connections,
        typeFilter,
        connectionsHasNext,
        isFetchingConnections,
        connectionsHasFetchedOnce,
        fetchConnections,
    } = useUserConnectionsStore(
        (state) => ({
            connections: state.connections,
            typeFilter: state.typeFilter,
            connectionsHasNext: state.connectionsHasNext,
            isFetchingConnections: state.isFetchingConnections,
            connectionsHasFetchedOnce: state.connectionsHasFetchedOnce,
            fetchConnections: state.fetchConnections,
        }),
        shallow
    );

    const {openDialog: openConnectWithMeDialog} = useConnectWithMeDialogStore()

    useEffect(() => {
        if (isFetchingConnections || (typeFilter === type && connectionsHasFetchedOnce)) return;
        void fetchConnections({status: ConnectionStatus.CONNECTED, type: type, reset: true});
    }, [fetchConnections, connectionsHasFetchedOnce, isFetchingConnections, typeFilter, type]);

    const handleScroll = useCallback(() => {
        if (isFetchingConnections) return;

        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        const isNearEnd = scrollTop + viewportHeight >= fullHeight - SCROLL_THRESHOLD;

        if (isNearEnd && connectionsHasNext) {
            void fetchConnections({status: ConnectionStatus.CONNECTED, type: type});
        }
    }, [isFetchingConnections, connectionsHasNext, fetchConnections, type]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    return (
        <div className={"h-full px-2 md:px-6 pt-2 w-full"}>
            <div className={"w-full flex flex-row items-center h-10 justify-between"}>
                <h1 className={"main-header-title"}>{u("connections.home.title")}</h1>
                <button
                    onClick={() => setSearchBarOpen((pre) => !pre)}
                    className={`main-header-button ${searchBarOpen && " bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-background"}`}
                >
                    <Search className={"size-5 mx-auto"}/>
                </button>
            </div>
            <AnimatePresence initial={false}>
                {searchBarOpen && (
                    <motion.div
                        key="search-bar"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden px-1"
                    >
                        <div className="relative py-2 border-b border-background-m">
                            <button
                                type="button"
                                className={"absolute left-3 top-1/2 -translate-y-1/2 text-foreground-200"}
                            >
                                <Search className={"size-5"} />
                            </button>

                            <Input
                                required
                                className={
                                    "shadow-none ring-1 ring-transparent focus:!ring-foreground-200 text-base font-normal px-10 text-foreground border-background-m bg-background-100 placeholder:text-foreground-200 h-10 rounded-full"
                                }
                                placeholder="Search"
                                autoComplete="new-password"
                            />

                            <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full">
                                <ConnectionTypeFilter />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className={"nav-container pb-2 border-background-m border-b"}>
                <button
                    className={"nav-button"}
                    onClick={() => openConnectWithMeDialog()}
                >
                    {u("connections.home.nav_button.connect_with_me")}
                </button>
                <button
                    className={"nav-button"}
                    onClick={() => router.push(ROUTES.CONNECTIONS.REQUESTS)}
                >
                    {u("connections.home.nav_button.requests")}
                </button>
                <button
                    className={"nav-button"}
                    onClick={() => router.push(ROUTES.CONNECTIONS.SUGGESTIONS)}
                >
                    {u("connections.home.nav_button.suggestions")}
                </button>
                <button
                    className={"nav-button"}
                    onClick={() => router.push(ROUTES.CONNECTIONS.BLOCKED)}
                >
                    {u("connections.home.nav_button.blocked")}
                </button>
            </div>
            <div
                className={"flex flex-col gap-1 h-fit pt-2 pb-20 md:pb-2"}
            >
                {!connectionsHasFetchedOnce && isFetchingConnections ? (
                    Array.from({ length: 7 }).map((_, i) => (
                        <ConnectionListItemSkeleton key={i}/>
                    ))
                ) : connections.length === 0 ? (
                    <EmptyList message={u("connections.home.empty")}/>
                ) : (
                    <>
                        {connections.map((c) => (
                            <ConnectionListItem key={c.id} connection={c} />
                        ))}
                        {isFetchingConnections && connectionsHasNext && (
                            <ConnectionListItemSkeleton/>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default ConnectionHomePage;