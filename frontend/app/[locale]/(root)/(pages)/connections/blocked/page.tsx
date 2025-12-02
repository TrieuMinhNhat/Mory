"use client"

import React, {useCallback, useEffect} from "react";
import {useTranslation} from "next-i18next";
import {ChevronLeft} from "lucide-react";
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore";
import {shallow} from "zustand/shallow";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/constants/routes";
import EmptyList from "@/components/shared/EmptyList";
import OMenuDot from "@/components/shared/icons/OMenuDot";
import BlockedConnectionItem from "@/components/user/connections/blocked/BlockedConnectionItem";
import BlockedConnectionItemSkeleton from "@/components/user/connections/blocked/BlockedConnectionItemSkeleton";

const SCROLL_THRESHOLD = 100;

const BlockedConnectionPage = () => {
    const {t: u} = useTranslation("user");
    const router = useRouter();
    const {
        blockedConnections,
        blockedConnectionsHasNext,
        isFetchingBlockedConnections,
        blockedConnectionsHasFetchedOnce,
        fetchBlockedConnections,
    } = useUserConnectionsStore(
        (state) => ({
            blockedConnections: state.blockedConnections,
            blockedConnectionsHasNext: state.blockedConnectionsHasNext,
            isFetchingBlockedConnections: state.isFetchingBlockedConnections,
            blockedConnectionsHasFetchedOnce: state.blockedConnectionsHasFetchedOnce,
            fetchBlockedConnections: state.fetchBlockedConnections,
        }),
        shallow
    );

    useEffect(() => {
        if (!blockedConnectionsHasFetchedOnce && !isFetchingBlockedConnections) {
            void fetchBlockedConnections();
        }
    }, [blockedConnectionsHasFetchedOnce, fetchBlockedConnections, isFetchingBlockedConnections]);

    const handleScroll = useCallback(() => {
        if (isFetchingBlockedConnections) return;

        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        const isNearEnd = scrollTop + viewportHeight >= fullHeight - SCROLL_THRESHOLD;

        if (isNearEnd && blockedConnectionsHasNext) {
            void fetchBlockedConnections();
            console.log("Load more blockedConnections");
        }
    }, [blockedConnectionsHasNext, fetchBlockedConnections, isFetchingBlockedConnections]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    return (
        <div className={"h-full px-2 md:px-6 pt-2 w-full"}>
            <div className={"relative w-full flex flex-row items-center h-10 justify-start gap-2"}>
                <button
                    className={"main-header-button"}
                    onClick={() => router.replace(ROUTES.CONNECTIONS.ROOT)}
                >
                    <ChevronLeft className={"size-7 mx-auto"}/>
                </button>
                <h1 className={"main-header-title"}>{u("connections.blocked.title")}</h1>
                <button className={"main-header-button absolute right-0"}>
                    <OMenuDot className={"size-7 mx-auto"}/>
                </button>
            </div>
            <div className={"w-full h-2 border-b border-background-m"}></div>
            
            <div
                className={"flex flex-col gap-1 h-fit pt-2 pb-20 md:pb-2"}
            >
                {!blockedConnectionsHasFetchedOnce && isFetchingBlockedConnections ? (
                    Array.from({ length: 7 }).map((_, i) => (
                        <BlockedConnectionItemSkeleton key={i}/>
                    ))
                ) : blockedConnections.length === 0 ? (
                    <EmptyList message={u("connections.blocked.empty")}/>
                ) : (
                    <>
                        {blockedConnections.map((c) => (
                            <BlockedConnectionItem key={c.id} connection={c} />
                        ))}
                        {isFetchingBlockedConnections && blockedConnectionsHasNext && (
                            <BlockedConnectionItemSkeleton/>
                        )}
                    </>
                )}
            </div>

        </div>
    )
}

export default BlockedConnectionPage;