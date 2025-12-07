"use client"

import React, {useCallback} from "react"
import { useTranslation } from "next-i18next"
import {toast} from "sonner";
import {useAuthStore} from "@/store/useAuthStore";
import {useMomentStore} from "@/store/moment/useMomentStore";
import {shallow} from "zustand/vanilla/shallow";
import {useUpdateMomentVisibilityDialogStore} from "@/store/moment/useUpdateMomentVisibilityDialogStore";
import {Moment} from "@/types/moment";
import CustomDrawer from "@/components/shared/CustomDrawer";

interface Props {
    open: boolean,
    selectedMoment: Moment,
    storyId?: string,
    closeDrawer: () => void,
}

const MomentCarouselActionsDrawer = ({open, selectedMoment, closeDrawer, storyId}: Props) => {
    const { t: u } = useTranslation("user");
    const {t: ts} = useTranslation("toast");
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
        closeDrawer();
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
        closeDrawer();
    }, [closeDrawer, openUpdateVisibilityDialog, selectedMoment, storyId])

    const handleDelete = useCallback(async () => {
        closeDrawer();
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
        closeDrawer();
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
    }, [closeDrawer, selectedMoment.mediaUrl, ts]);

    if (!selectedMoment) return;

    return (
        <CustomDrawer open={open} onClose={closeDrawer}>
            <div className="drawer-content">
                {selectedMoment.user.id === user?.id && (
                    <>
                        <button className="drawer-button" onClick={handleUpdateMilestone}>
                            {selectedMoment.milestone
                                ? u("moment.drawer.milestone.unset")
                                : u("moment.drawer.milestone.set")}
                        </button>

                        {!storyId && !selectedMoment.story && (
                            <button className="drawer-button" onClick={handleUpdateVisibility}>
                                {u("moment.drawer.visibility")}
                            </button>
                        )}

                        <button className="drawer-button" onClick={handleDelete}>
                            {u("moment.drawer.delete")}
                        </button>
                    </>
                )}
                {selectedMoment.user.id !== user?.id && (
                    <></>
                )}
                <button className="drawer-button" onClick={handleDownloadImage}>
                    {u("moment.drawer.download")}
                </button>

                <button
                    className="drawer-button"
                    onClick={closeDrawer}
                >
                    {u("drawer.cancel")}
                </button>
            </div>
        </CustomDrawer>
    )
}

export default MomentCarouselActionsDrawer
