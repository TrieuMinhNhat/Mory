"use client"

import React, {useCallback} from "react"
import {Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle,} from "@/components/ui/drawer"
import {useTranslation} from "next-i18next"
import {useStoryDrawerStore} from "@/store/story/useStoryDrawerStore"
import {useStoriesStore} from "@/store/story/useStoriesStore";
import {toast} from "sonner";
import {useAuthStore} from "@/store/useAuthStore";
import {useLeaveStoryDialogStore} from "@/store/story/useLeaveStoryDialogStore";
import {shallow} from "zustand/vanilla/shallow";
import {useUpdateStoryDialogStore} from "@/store/story/useUpdateStoryDialogStore";
import {StoryScope} from "@/types/moment";

const StoryActionsDrawer = () => {
    const { t: u } = useTranslation("user");
    const {t: ts} = useTranslation("toast");
    const { open, selectedStory, action, closeDrawer } = useStoryDrawerStore();
    const { openDialog: openUpdateStoryDialog } = useUpdateStoryDialogStore();
    const user = useAuthStore((state) => state.user);

    const openLeaveDialog = useLeaveStoryDialogStore((state) => state.openDialog);

    const {
        processingStoryIds,
        dissolveStory,
        deleteStory,
    } = useStoriesStore(
        (state) => ({
            processingStoryIds: state.processingStoryIds,
            dissolveStory: state.dissolveStory,
            deleteStory: state.deleteStory,
        }),
        shallow
    )
    
    const handleDissolve = useCallback(async () => {
        if (!selectedStory) return;
        if (processingStoryIds.has(selectedStory.id)) return;
        const result = await dissolveStory(selectedStory.id);
        if (result.success) {
            toast.success(ts("user.story.dissolve.success", {name: selectedStory.title}));
            if (action) action();
        } else {
            toast.error(ts("user.story.dissolve.error", {name: selectedStory.title}));
        }
    }, [action, dissolveStory, processingStoryIds, selectedStory, ts])

    const handleDelete = useCallback(async () => {
        if (!selectedStory) return;
        if (processingStoryIds.has(selectedStory.id)) return;
        const result = await deleteStory(selectedStory.id);
        if (result.success) {
            toast.success(ts("user.story.delete.success", {name: selectedStory.title}));
            if (action) action();
        } else {
            toast.error(ts("user.story.delete.error", {name: selectedStory.title}));
        }
    }, [action, deleteStory, processingStoryIds, selectedStory, ts])

    const handleEdit = () => {
        if (!selectedStory) return;
        openUpdateStoryDialog(selectedStory);
        closeDrawer()
    }

    if (!selectedStory) return null
    
    return (
        <Drawer open={open} onOpenChange={(o) => !o && closeDrawer()}>
            <DrawerContent onClick={(e) => e.stopPropagation()}>
                <div className="drawer-content">
                    <DrawerTitle className={"w-full text-center mb-4"}>{selectedStory.title}</DrawerTitle>
                    <DrawerDescription />

                    {selectedStory.creator.id === user?.id && (
                        <>
                            <DrawerClose asChild>
                                <button className="drawer-button" onClick={handleEdit}>
                                    {u("story.home.drawer.edit")}
                                </button>
                            </DrawerClose>

                            <DrawerClose asChild>
                                <button className="drawer-button" onClick={handleDissolve}>
                                    {u("story.home.drawer.dissolve")}
                                </button>
                            </DrawerClose>

                            <DrawerClose asChild>
                                <button className="drawer-button" onClick={handleDelete}>
                                    {u("story.home.drawer.delete")}
                                </button>
                            </DrawerClose>
                        </>
                    )}
                    {user && selectedStory.scope === StoryScope.GROUP && selectedStory.members.map((m) => m.id).includes(user?.id) && selectedStory.creator.id !== user?.id && (
                        <DrawerClose asChild>
                            <button
                                className="drawer-button"
                                onClick={() => openLeaveDialog(selectedStory, action)}
                            >
                                {u("story.home.drawer.leave")}
                            </button>
                        </DrawerClose>
                    )}

                    <DrawerClose asChild>
                        <button className="drawer-button">{u("drawer.cancel")}</button>
                    </DrawerClose>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default StoryActionsDrawer
