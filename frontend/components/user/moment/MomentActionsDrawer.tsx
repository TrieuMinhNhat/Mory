"use client"

import React, {useCallback} from "react"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
} from "@/components/ui/drawer"
import { useTranslation } from "next-i18next"
import {toast} from "sonner";
import {useAuthStore} from "@/store/useAuthStore";
import {useMomentDrawerStore} from "@/store/moment/useMomentDrawerStore";
import {useMomentStore} from "@/store/moment/useMomentStore";
import {shallow} from "zustand/vanilla/shallow";
import {useUpdateMomentVisibilityDialogStore} from "@/store/moment/useUpdateMomentVisibilityDialogStore";

const MomentActionsDrawer = () => {
    const { t: u } = useTranslation("user");
    const {t: ts} = useTranslation("toast");
    const { open, selectedMoment, closeDrawer, storyId } = useMomentDrawerStore();
    const { openDialog: openUpdateVisibilityDialog } = useUpdateMomentVisibilityDialogStore();
    const user = useAuthStore((state) => state.user);

    const {
        processingMomentIds,
        updateMomentMilestone,
        deleteMoment
    } = useMomentStore(
        (state) => ({
            processingMomentIds: state.processingMomentIds,
            updateMomentMilestone: state.updateMomentMilestone,
            deleteMoment: state.deleteMoment,
        }),
        shallow
    )

    const handleUpdateMilestone = useCallback(async () => {
        if (!selectedMoment) return;
        if (processingMomentIds.has(selectedMoment.id)) return;
        const result = await updateMomentMilestone(selectedMoment.id, !selectedMoment.milestone, storyId);
        if (result.success) {
            toast.success(
                ts(
                    !selectedMoment.milestone
                        ? "user.moment.milestone.set.success"
                        : "user.moment.milestone.unset.success"
                )
            );
            closeDrawer();
        } else {
            toast.error(
                ts(
                    !selectedMoment.milestone
                        ? "user.moment.milestone.set.error"
                        : "user.moment.milestone.unset.error"
                )
            );
        }
    }, [closeDrawer, processingMomentIds, selectedMoment, storyId, ts, updateMomentMilestone])
    
    const handleUpdateVisibility = useCallback(() => {
        if (!selectedMoment || storyId) return;
        openUpdateVisibilityDialog(selectedMoment);
    }, [openUpdateVisibilityDialog, selectedMoment, storyId])

    const handleDelete = useCallback(async () => {
        if (!selectedMoment) return;
        if (processingMomentIds.has(selectedMoment.id)) return;
        const result = await deleteMoment(selectedMoment.id, storyId);
        if (result.success) {
            toast.success(ts("user.moment.delete.success"));
            closeDrawer()
        } else {
            toast.error(ts("user.moment.delete.error"));
        }
    }, [closeDrawer, deleteMoment, processingMomentIds, selectedMoment, storyId, ts])

    const handleDownloadImage = useCallback(async () => {
        if (!selectedMoment?.mediaUrl) {
            toast.error(ts("user.moment.download.no_image"));
            return;
        }

        try {
            const response = await fetch(selectedMoment.mediaUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "moment-image.jpg";
            a.click();

            window.URL.revokeObjectURL(url);
            toast.success(ts("user.moment.download.success"));
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            toast.error(ts("user.moment.download.error"));
        }
    }, [selectedMoment, ts]);

    if (!selectedMoment) return;

    return (
        <Drawer open={open} onOpenChange={(o) => !o && closeDrawer()}>
            <DrawerContent onClick={(e) => e.stopPropagation()}>
                <div className="drawer-content">
                    <DrawerTitle></DrawerTitle>
                    <DrawerDescription />

                    {selectedMoment.user.id === user?.id && (
                        <>
                            <DrawerClose asChild>
                                <button className="drawer-button" onClick={handleUpdateMilestone}>
                                    {selectedMoment.milestone
                                        ? u("moment.drawer.milestone.unset")
                                        : u("moment.drawer.milestone.set")}
                                </button>
                            </DrawerClose>

                            {!storyId && !selectedMoment.story && (
                                <DrawerClose asChild>
                                    <button className="drawer-button" onClick={handleUpdateVisibility}>
                                        {u("moment.drawer.visibility")}
                                    </button>
                                </DrawerClose>
                            )}
                            <DrawerClose asChild>
                                <button className="drawer-button" onClick={handleDelete}>
                                    {u("moment.drawer.delete")}
                                </button>
                            </DrawerClose>
                        </>
                    )}
                    {selectedMoment.user.id !== user?.id && (
                        <></>
                    )}
                    <DrawerClose asChild>
                        <button className="drawer-button" onClick={handleDownloadImage}>
                            {u("moment.drawer.download")}
                        </button>
                    </DrawerClose>

                    <DrawerClose asChild>
                        <button className="drawer-button">{u("drawer.cancel")}</button>
                    </DrawerClose>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default MomentActionsDrawer
