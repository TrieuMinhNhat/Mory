"use client";

import {
    Dialog, DialogClose,
    DialogContent, DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "next-i18next";
import { shallow } from "zustand/shallow";
import React, { useEffect, useRef, useCallback } from "react";
import { useUserConnectionsStore } from "@/store/connection/useConnectionsStore";
import SentConnectionRequestItem from "@/components/user/connections/requests/SentConnectionRequestItem";
import EmptyList from "@/components/shared/EmptyList";
import {ChevronLeft, X} from "lucide-react";
import SentConnectionRequestItemSkeleton
    from "@/components/user/connections/requests/SentConnectionRequestItemSkeleton";

const SCROLL_THRESHOLD = 100;

interface SentConnectionRequestsDialogProps {
    isOpen: boolean;
    onIsOpenChange: (isOpen: boolean) => void;
}

const SentConnectionRequestsDialog = ({ isOpen, onIsOpenChange }: SentConnectionRequestsDialogProps) => {
    const { t: u } = useTranslation("user");

    const {
        sentRequests,
        sentRequestsHasNext,
        isFetchingSentRequest,
        sentRequestsHasFetchedOnce,
        fetchSentRequest,
    } = useUserConnectionsStore(
        (state) => ({
            sentRequests: state.sentRequests,
            sentRequestsHasNext: state.sentRequestsHasNext,
            isFetchingSentRequest: state.isFetchingSentRequest,
            sentRequestsHasFetchedOnce: state.sentRequestsHasFetchedOnce,
            fetchSentRequest: state.fetchSentRequest,
        }),
        shallow
    );

    const scrollRef = useRef<HTMLDivElement | null>(null);
    
    useEffect(() => {
        if (isOpen && !sentRequestsHasFetchedOnce && !isFetchingSentRequest) {
            void fetchSentRequest();
        }
    }, [isOpen, fetchSentRequest, sentRequestsHasFetchedOnce, isFetchingSentRequest]);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        const { scrollTop, clientHeight, scrollHeight } = el;
        const isNearEnd = scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD;

        if (isNearEnd && sentRequestsHasNext && !isFetchingSentRequest) {
            void fetchSentRequest();
        }
    }, [fetchSentRequest, sentRequestsHasNext, isFetchingSentRequest]);

    return (
        <Dialog open={isOpen} onOpenChange={onIsOpenChange}>
            <DialogContent className="w-full md:max-w-[650px] h-full md:h-[80vh] px-0 flex flex-col md:rounded-xl">
                <div className={"flex flex-col w-full h-fit"}>
                    <div className={"w-full flex flex-row items-center"}>
                        <DialogClose asChild>
                            <button className={"block md:hidden rounded-full text-foreground-200 hover:text-foreground p-1 hover:bg-background-200"}>
                                <ChevronLeft className={"size-7"}/>
                            </button>
                        </DialogClose>
                        <DialogTitle className={"text-2xl md:text-xl w-full pl-1 pr-8 md:pr-0 md:pl-8 font-medium text-left md:text-center"}>
                            {u("connections.requests.sent.title")}
                        </DialogTitle>
                        <DialogClose asChild>
                            <button className={" hidden md:block p-1 rounded-full hover:bg-background-200"}>
                                <X className={"size-6"}/>
                            </button>
                        </DialogClose>
                        <DialogDescription></DialogDescription>
                    </div>
                    <div className={"border-b h-2 w-full border-background-m"}/>
                </div>


                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className={`flex flex-col gap-2 h-full p-2 scrollbar-thumb-only 
                        ${
                        !sentRequestsHasFetchedOnce && isFetchingSentRequest
                            ? "overflow-hidden"
                            : "overflow-y-auto"
                    }`}
                >
                    {!sentRequestsHasFetchedOnce && isFetchingSentRequest ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <SentConnectionRequestItemSkeleton key={i} />
                        ))
                    ) : sentRequests.length === 0 ? (
                        <EmptyList message={u("connections.requests.sent.empty")}/>
                    ) : (
                        <>
                            {sentRequests.map((r) => (
                                <SentConnectionRequestItem
                                    key={r.id}
                                    request={r}
                                />
                            ))}
                            {isFetchingSentRequest && sentRequestsHasNext && (
                                <SentConnectionRequestItemSkeleton />
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SentConnectionRequestsDialog;
