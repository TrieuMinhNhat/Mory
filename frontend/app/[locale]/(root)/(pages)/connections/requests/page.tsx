"use client"

import React, {useCallback, useEffect, useState} from "react";
import {ChevronLeft} from "lucide-react";
import {useTranslation} from "next-i18next";
import OMenuDot from "@/components/shared/icons/OMenuDot";
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore";
import {shallow} from "zustand/shallow";
import ReceivedConnectionRequestItemSkeleton
    from "@/components/user/connections/requests/ReceivedConnectionRequestItemSkeleton";
import ReceivedConnectionRequestItem
    from "@/components/user/connections/requests/ReceivedConnectionRequestItem";
import SentConnectionRequestsDialog from "@/components/user/connections/requests/SentConnectionRequestDialog";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/constants/routes";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import EmptyList from "@/components/shared/EmptyList";

const SCROLL_THRESHOLD = 100;

const ConnectionRequestsPage = () => {
    const {t: u} = useTranslation("user");
    const router = useRouter();

    const {
        receivedRequests,
        receivedRequestsHasNext,
        isFetchingReceivedRequest,
        receivedRequestHasFetchedOnce,
        fetchReceivedRequest
    } = useUserConnectionsStore(
        (state) => ({
            receivedRequests: state.receivedRequests,
            receivedRequestsHasNext: state.receivedRequestsHasNext,
            isFetchingReceivedRequest: state.isFetchingReceivedRequest,
            receivedRequestHasFetchedOnce: state.receivedRequestsHasFetchedOnce,
            fetchReceivedRequest: state.fetchReceivedRequest
        }),
        shallow
    );

    const [isSentDialogOpen, setIsSentDialogOpen] = useState(false);


    useEffect(() => {
        if (!receivedRequestHasFetchedOnce && !isFetchingReceivedRequest) {
            void fetchReceivedRequest();
        }
    }, [fetchReceivedRequest, isFetchingReceivedRequest, receivedRequestHasFetchedOnce]);

    const handleScroll = useCallback(() => {
        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        const isNearEnd = scrollTop + viewportHeight >= fullHeight - SCROLL_THRESHOLD;

        if (isNearEnd && receivedRequestsHasNext && !isFetchingReceivedRequest) {
            void fetchReceivedRequest();
        }
    }, [fetchReceivedRequest, receivedRequestsHasNext, isFetchingReceivedRequest]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    return (
        <div className={"h-full px-2 md:px-6 pt-2 w-full pb-16 md:pb-0"}>
            <div className={"relative w-full flex flex-row items-center h-10 justify-start gap-2"}>
                <button
                    className={"main-header-button"}
                    onClick={() => router.replace(ROUTES.CONNECTIONS.ROOT)}
                >
                    <ChevronLeft className={"size-7 mx-auto"}/>
                </button>
                <h1 className={"main-header-title"}>{u("connections.requests.title")}</h1>
                <Drawer>
                    <DrawerTrigger asChild>
                        <button className={"main-header-button absolute right-0"}>
                            <OMenuDot className={"size-7 mx-auto"}/>
                        </button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <div className={"drawer-content"}>
                            <DrawerTitle></DrawerTitle>
                            <DrawerDescription></DrawerDescription>
                            <DrawerClose asChild>
                                <button
                                    className={"drawer-button"}
                                    onClick={() => setIsSentDialogOpen(true)}
                                >
                                    {u("connections.requests.drawer.view_sent")}
                                </button>
                            </DrawerClose>
                            <DrawerClose asChild>
                                <button
                                    className={"drawer-button"}
                                >
                                    {u("drawer.cancel")}
                                </button>
                            </DrawerClose>
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>
            <div className={"w-full h-2 border-b border-background-m"}></div>
            <div
                className={"flex flex-col gap-1 h-fit pt-2 pb-20 md:pb-2"}
            >
                {!receivedRequestHasFetchedOnce && isFetchingReceivedRequest ? (
                    Array.from({ length: 7 }).map((_, i) => (
                        <ReceivedConnectionRequestItemSkeleton key={i}/>
                    ))
                ) : receivedRequests.length === 0 ? (
                    <EmptyList message={u("connections.requests.empty")}/>
                ) : (
                    <>
                        {receivedRequests.map((request) => (
                            <ReceivedConnectionRequestItem key={request.id} request={request} />
                        ))}
                        {isFetchingReceivedRequest && receivedRequestsHasNext && (
                            <ReceivedConnectionRequestItemSkeleton/>
                        )}
                    </>
                )}
            </div>
            {isSentDialogOpen && (
                <SentConnectionRequestsDialog
                    isOpen={isSentDialogOpen}
                    onIsOpenChange={setIsSentDialogOpen}
                />
            )}
        </div>
    )
}

export default ConnectionRequestsPage;