"use client"

import React, {useCallback, useEffect} from "react";
import {ROUTES} from "@/constants/routes";
import {ChevronLeft} from "lucide-react";
import OMenuDot from "@/components/shared/icons/OMenuDot";
import {useRouter} from "next/navigation";
import {useTranslation} from "next-i18next";
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore";
import {shallow} from "zustand/shallow";
import SuggestedConnectionItemSkeleton
    from "@/components/user/connections/suggestions/SuggestedConnectionItemSkeleton";
import SuggestedConnectionItem from "@/components/user/connections/suggestions/SuggestedConnectionItem";
import EmptyList from "@/components/shared/EmptyList";

const SCROLL_THRESHOLD = 100;

const ConnectionSuggestionsPage = () => {
    const {t: u} = useTranslation("user");
    const router = useRouter();

    const {
        suggestedConnections,
        suggestedConnectionsHasNext,
        isFetchingSuggestedConnections,
        suggestedConnectionsHasFetchedOnce,
        fetchSuggestedConnections,
    } = useUserConnectionsStore(
        (state) => ({
            suggestedConnections: state.suggestedConnections,
            suggestedConnectionsHasNext: state.suggestedConnectionsHasNext,
            isFetchingSuggestedConnections: state.isFetchingSuggestedConnections,
            suggestedConnectionsHasFetchedOnce: state.suggestedConnectionHasFetchedOnce,
            fetchSuggestedConnections: state.fetchSuggestedConnections,
        }),
        shallow
    );

    useEffect(() => {
        if (!suggestedConnectionsHasFetchedOnce && !isFetchingSuggestedConnections) {
            void fetchSuggestedConnections();
        }
    }, [fetchSuggestedConnections, isFetchingSuggestedConnections, suggestedConnectionsHasFetchedOnce]);

    const handleScroll = useCallback(() => {
        if (isFetchingSuggestedConnections) return;

        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        const isNearEnd = scrollTop + viewportHeight >= fullHeight - SCROLL_THRESHOLD;

        if (isNearEnd && suggestedConnectionsHasNext) {
            void fetchSuggestedConnections();
            console.log("Load more suggestions");
        }
    }, [fetchSuggestedConnections, suggestedConnectionsHasNext, isFetchingSuggestedConnections]);

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
                <h1 className={"main-header-title"}>{u("connections.suggestions.title")}</h1>
                <button className={"main-header-button absolute right-0"}>
                    <OMenuDot className={"size-7 mx-auto"}/>
                </button>
            </div>
            <div className={"w-full h-2 border-b border-background-m"}></div>

            <div
                className={"flex flex-col gap-2 h-fit pt-2 pb-20 md:pb-2"}
            >
                {!suggestedConnectionsHasFetchedOnce && isFetchingSuggestedConnections ? (
                    Array.from({ length: 7 }).map((_, i) => (
                        <SuggestedConnectionItemSkeleton key={i}/>
                    ))
                ) : suggestedConnections.length === 0 ? (
                    <EmptyList message={u("connections.suggestions.empty")}/>
                ) : (
                    <>
                        {suggestedConnections.map((s) => (
                            <SuggestedConnectionItem key={s.user.id} item={s} />
                        ))}
                        {isFetchingSuggestedConnections && suggestedConnectionsHasNext && (
                            <SuggestedConnectionItemSkeleton />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default ConnectionSuggestionsPage;