"use client"

import {useTranslation} from "next-i18next";
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore";
import {shallow} from "zustand/shallow";
import React, {useCallback, useEffect, useRef} from "react";
import {ConnectionStatus, getOtherUserFromConnection} from "@/types/connections";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {ChevronLeft, X} from "lucide-react";
import EmptyList from "@/components/shared/EmptyList";
import AddMemberItem from "@/components/user/story/member/AddMemberItem";
import {UserPreview} from "@/types/user";
import Image from "next/image";
import Cancel from "@/components/user/moment/icons/Cancel";
import AddMemberItemSkeleton from "@/components/user/story/member/AddMemberItemSkeleton";

const SCROLL_THRESHOLD = 100;

interface AddMembersDialogProps {
    isOpen: boolean;
    onIsOpenChange: (isOpen: boolean) => void;
    selectedMembers: UserPreview[];
    onMembersChange: (members: UserPreview[]) => void;
}

const AddMembersDialog = ({isOpen, onIsOpenChange, selectedMembers, onMembersChange}: AddMembersDialogProps) => {
    const {t: u} = useTranslation("user");

    const handleMemberCheck = (id: string, checked: boolean) => {
        const conn = connections.find((c) => c.id === id);
        if (!conn) return;
        const user = getOtherUserFromConnection(conn);
        let newMembers = [...selectedMembers];
        if (checked) {
            if (!newMembers.some((m) => m.id === user.id)) {
                newMembers.push(user);
            }
        } else {
            newMembers = newMembers.filter((m) => m.id !== user.id);
        }
        onMembersChange(newMembers);
    };

    const handleMemberRemove = (id: string) => {
        let newMembers = [...selectedMembers];
        newMembers = newMembers.filter((m) => m.id !== id);
        onMembersChange(newMembers);
    }
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
        if (isOpen && !connectionsHasFetchedOnce) {
            void fetchConnections({status: ConnectionStatus.CONNECTED});
        }
    }, [fetchConnections, connectionsHasFetchedOnce, isOpen]);

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
        <Dialog open={isOpen} onOpenChange={onIsOpenChange}>
            <DialogContent className="w-full md:max-w-[500px] h-full md:h-[90vh] !py-2 flex flex-col md:rounded-xl">
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

                {selectedMembers.length > 0 && (
                    <div className={"w-full flex flex-row h-fit gap-2"}>
                        {selectedMembers.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => handleMemberRemove(m.id)}
                                className={"w-16 h-16 relative border-2 border-primary flex items-center justify-center rounded-full"}
                            >
                                <div className={"w-14 h-14 relative rounded-full"}>
                                    <Image
                                        src={m.avatarUrl ?? "/assets/images/avatar/png"}
                                        alt={"avatar" + m.displayName}
                                        fill
                                        sizes={"56px"}
                                        className={"rounded-full object-cover"}
                                    />
                                </div>
                                <div
                                    className="absolute top-0 right-0 w-5 h-5 flex justify-center items-center rounded-full bg-primary"
                                >
                                    <Cancel className={"size-3"}/>
                                </div>
                            </button>
                        ))}
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
                    ) : connections.length === 0 ? (
                        <EmptyList message={u("story.create_story.add_members.none")}/>
                    ) : (
                        <>
                            {connections.map((c) => (
                                <AddMemberItem
                                    key={c.id}
                                    connection={c}
                                    checked={selectedMembers.some((m) => m.id === getOtherUserFromConnection(c).id)}
                                    onCheckedChange={handleMemberCheck}
                                />
                            ))}
                            {isFetchingConnections && connectionsHasNext && (
                                <AddMemberItemSkeleton/>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddMembersDialog;