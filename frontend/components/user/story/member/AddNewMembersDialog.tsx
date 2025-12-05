"use client"

import {useTranslation} from "next-i18next";
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore";
import {shallow} from "zustand/shallow";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Connection, ConnectionStatus, ConnectionTypeStatus, getOtherUserFromConnection} from "@/types/connections";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {ChevronLeft, Plus, X} from "lucide-react";
import EmptyList from "@/components/shared/EmptyList";
import AddMemberItem from "@/components/user/story/member/AddMemberItem";
import Image from "next/image";
import Cancel from "@/components/user/moment/icons/Cancel";
import AddMemberItemSkeleton from "@/components/user/story/member/AddMemberItemSkeleton";
import {useAddNewMembersDialogStore} from "@/store/story/useAddNewMembersDialogStore";
import {useStoriesStore} from "@/store/story/useStoriesStore";
import {toast} from "sonner";
import ContentWithLoader from "@/components/shared/ContentWithLoader";

const SCROLL_THRESHOLD = 100;

const AddNewMembersDialog = () => {
    const {t: u} = useTranslation("user");
    const {t: ts} = useTranslation("toast");

    const [selectedConnections, setSelectedConnections] = useState<Connection[]>([]);
    
    const { open, selectedStory, closeDialog } = useAddNewMembersDialogStore();
    const {
        addStoryMembers,
        processingStoryIds
    } = useStoriesStore(
        (state) => ({
            addStoryMembers: state.addStoryMembers,
            processingStoryIds: state.processingStoryIds,
        }),
        shallow
    )

    const handleMemberRemove = useCallback((id: string) => {
        setSelectedConnections((pre) => pre.filter((c) => c.id !== id));
    }, [])

    const handleAddNewMembers = useCallback(async () => {
        if (!selectedStory || processingStoryIds.has(selectedStory.id)) return;
        const dataMap: Map<string, ConnectionTypeStatus> = new Map();

        selectedConnections.forEach(conn => {
            const userId = getOtherUserFromConnection(conn).id;

            const value: ConnectionTypeStatus = {
                connectionType: conn.connectionType,
                status: conn.status,
                mutualConnections: conn.mutualConnections,
            };

            dataMap.set(userId, value);
        });
        const result = await addStoryMembers(selectedStory.id, dataMap);
        if (result.success) {
            toast.success(
                ts("user.story.add_members.success", {name: selectedStory.title})
            );
            closeDialog();
            Array.from(dataMap.keys()).forEach((memberId) => handleMemberRemove(memberId));
        } else {
            toast.error(
                ts("user.story.add_members.error", {name: selectedStory.title})
            );
        }
    }, [addStoryMembers, closeDialog, handleMemberRemove, processingStoryIds, selectedConnections, selectedStory, ts]);
    
    const handleMemberCheck = (id: string, checked: boolean) => {
        const conn = connections.find((c) => c.id === id);
        if (!conn) return;
        if (checked) {
            if (!selectedConnections.some((c) => c.id === id)) {

                setSelectedConnections((pre) => pre.concat(conn));
            }
        } else {
            setSelectedConnections((pre) => pre.filter((c) => c.id !== id));
        }
    };
    
    const {
        connections,
        connectionsHasNext,
        isFetchingConnections,
        connectionsHasFetchedOnce,
        fetchConnections,
    } = useUserConnectionsStore(
        (state) => ({
            connections: state.connections,
            connectionsHasNext: state.connectionsHasNext,
            isFetchingConnections: state.isFetchingConnections,
            connectionsHasFetchedOnce: state.connectionsHasFetchedOnce,
            fetchConnections: state.fetchConnections,
        }),
        shallow
    );

    useEffect(() => {
        if (open && !connectionsHasFetchedOnce && !isFetchingConnections) {
            void fetchConnections({status: ConnectionStatus.CONNECTED});
        }
    }, [fetchConnections, connectionsHasFetchedOnce, open, isFetchingConnections]);

    const scrollRef = useRef<HTMLDivElement | null>(null);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        const { scrollTop, clientHeight, scrollHeight } = el;
        const isNearEnd = scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD;

        if (isNearEnd && connectionsHasNext && !isFetchingConnections) {
            void fetchConnections({status: ConnectionStatus.CONNECTED});
        }
    }, [connectionsHasNext, fetchConnections, isFetchingConnections]);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
            <DialogContent className="w-full md:max-w-[500px] h-full md:h-[90vh] flex flex-col md:rounded-xl">
                <div className={"h-full w-full relative overflow-hidden pb-20 remove-scrollbar"}>
                    <div className={"flex flex-col w-full h-fit"}>
                        <div className={"w-full flex flex-row items-center"}>
                            <DialogClose asChild>
                                <button className={"block md:hidden rounded-full text-foreground-200 hover:text-foreground p-1 hover:bg-background-200"}>
                                    <ChevronLeft className={"size-7"}/>
                                </button>
                            </DialogClose>
                            <DialogTitle className={"text-2xl md:text-xl w-full pl-1 pr-8 md:pr-0 md:pl-8 font-medium text-left md:text-center"}>
                                {u("story.create_story.add_members.title")}
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
                    {selectedConnections.length > 0 && (
                        <div className={"w-full flex flex-row h-fit gap-2"}>
                            {selectedConnections.map((c) => {
                                const otherUser = getOtherUserFromConnection(c)
                                return (
                                    <button
                                        key={otherUser.id}
                                        onClick={() => handleMemberRemove(c.id)}
                                        className={"w-16 h-16 relative border-2 border-primary flex items-center justify-center rounded-full"}
                                    >
                                        <div className={"w-14 h-14 relative rounded-full"}>
                                            <Image
                                                src={otherUser.avatarUrl ?? "/assets/images/avatar/png"}
                                                alt={"avatar" + otherUser.displayName}
                                                fill
                                                sizes={"56px"}
                                                className={"rounded-full object-cover"}
                                            />
                                        </div>
                                        <div
                                            className="absolute top-0 right-0 w-5 h-5 flex justify-center items-center rounded-full bg-primary text-primary-foreground"
                                        >
                                            <Cancel className={"size-3"}/>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className={`flex flex-col gap-2 h-full p-2 scrollbar-thumb-only 
                        ${
                            !connectionsHasFetchedOnce && isFetchingConnections
                                ? "overflow-hidden"
                                : "overflow-y-auto"
                        }`}
                    >
                        {!connectionsHasFetchedOnce && isFetchingConnections ? (
                            Array.from({ length: 7 }).map((_, i) => (
                                <AddMemberItemSkeleton key={i}/>
                            ))
                        ) : connections
                            .filter((c) => {
                                const user = getOtherUserFromConnection(c);
                                return !selectedStory?.members?.some((m) => m.id === user.id);
                            }).length === 0 ? (
                            <EmptyList message={u("story.create_story.add_members.none")}/>
                        ) : (
                            <>
                                {connections
                                    .filter((c) => {
                                        const user = getOtherUserFromConnection(c);
                                        return !selectedStory?.members?.some((m) => m.id === user.id);
                                    })
                                    .map((c) => (
                                        <AddMemberItem
                                            key={c.id}
                                            connection={c}
                                            checked={selectedConnections.some((connection) => c.id === connection.id)}
                                            onCheckedChange={handleMemberCheck}
                                        />
                                    ))
                                }
                                {isFetchingConnections && connectionsHasNext && (
                                    <AddMemberItemSkeleton/>
                                )}
                            </>
                        )}
                    </div>
                    <button
                        disabled={!selectedStory || processingStoryIds.has(selectedStory.id)}
                        onClick={() => handleAddNewMembers()}
                        className={"absolute bottom-0 w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-10"}
                    >
                        <ContentWithLoader isLoading={processingStoryIds.has(selectedStory?.id ?? "")}>
                            <Plus className={"size-6 mx-auto"}/>
                        </ContentWithLoader>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddNewMembersDialog;