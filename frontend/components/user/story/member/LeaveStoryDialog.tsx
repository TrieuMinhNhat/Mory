"use client"

import {useTranslation} from "next-i18next";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {X} from "lucide-react";
import React, {useCallback} from "react";
import {useLeaveStoryDialogStore} from "@/store/story/useLeaveStoryDialogStore";
import {toast} from "sonner";
import {useStoriesStore} from "@/store/story/useStoriesStore";
import {shallow} from "zustand/vanilla/shallow";
import {LeaveStoryAction} from "@/types/story";
import ContentWithLoader from "@/components/shared/ContentWithLoader";

const LeaveStoryDialog = () => {
    const {t: u} = useTranslation("user");
    const { t: ts } = useTranslation("toast")

    const { open, selectedStory, action: leaveAction, closeDialog } = useLeaveStoryDialogStore();
    const {
        processingStoryIds,
        leaveStory
    } = useStoriesStore(
        (state) => ({
            processingStoryIds: state.processingStoryIds,
            leaveStory: state.leaveStory,
        }),
        shallow
    )

    const handleLeave = useCallback(async (action: LeaveStoryAction) => {
        if (!selectedStory) return;
        if (processingStoryIds.has(selectedStory.id)) return;
        const result = await leaveStory(selectedStory.id, action);
        if (result.success) {
            toast.success(ts("user.story.leave.success", {name: selectedStory.title}));
            closeDialog()
            if (leaveAction) leaveAction(); 
        } else {
            toast.error(ts("user.story.leave.error", {name: selectedStory.title}));
        }
    }, [closeDialog, leaveAction, leaveStory, processingStoryIds, selectedStory, ts])

    if (!selectedStory) return;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
            <DialogContent className="w-full md:max-w-lg h-fit px-0 flex flex-col rounded-xl">
                <div className={"flex flex-col w-full h-fit"}>
                    <div className={"w-full flex flex-row items-center"}>
                        <DialogTitle className={"text-2xl md:text-xl w-full pl-8 font-medium text-center"}>
                            {selectedStory.title}
                        </DialogTitle>
                        <DialogClose asChild>
                            <button className={"p-1 rounded-full hover:bg-background-200"}>
                                <X className={"size-6"}/>
                            </button>
                        </DialogClose>
                        <DialogDescription></DialogDescription>
                    </div>
                </div>
                <div className={"flex flex-col p-2 gap-2 items-center"}>
                    <p className={"mb-4 text-center px-2"}>
                        {u("story.home.leave_story_prompt")}
                    </p>
                    <button
                        className={"w-full h-12 hover:bg-background-200 border border-background-m hover:border-background-200 rounded-full"}
                        disabled={processingStoryIds.has(selectedStory.id)}
                        onClick={() => handleLeave(LeaveStoryAction.KEEP_AS_INDEPENDENT_MOMENTS)}
                    >
                        <ContentWithLoader isLoading={processingStoryIds.has(selectedStory.id)}>
                            {u("story.home.leave_story_action.keep_as_independent_moments")}
                        </ContentWithLoader>
                    </button>
                    <button
                        className={"w-full h-12 hover:bg-background-200 border border-background-m hover:border-background-200 rounded-full"}
                        onClick={() => handleLeave(LeaveStoryAction.REMOVE_MOMENTS)}
                        disabled={processingStoryIds.has(selectedStory.id)}
                    >
                        <ContentWithLoader isLoading={processingStoryIds.has(selectedStory.id)}>
                            {u("story.home.leave_story_action.remove_moments")}
                        </ContentWithLoader>
                    </button>
                    <button
                        className={"w-full h-12 hover:bg-background-200 border border-background-m hover:border-background-200 rounded-full"}
                        onClick={() => handleLeave(LeaveStoryAction.CREATE_PERSONAL_STORY)}
                        disabled={processingStoryIds.has(selectedStory.id)}
                    >
                        <ContentWithLoader isLoading={processingStoryIds.has(selectedStory.id)}>
                            {u("story.home.leave_story_action.create_personal_story")}
                        </ContentWithLoader>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
export default LeaveStoryDialog;