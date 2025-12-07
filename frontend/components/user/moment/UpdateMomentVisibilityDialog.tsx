"use client"

import {useTranslation} from "next-i18next";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {ChevronLeft, X} from "lucide-react";
import React, {useCallback, useEffect, useState} from "react";
import {useUpdateMomentVisibilityDialogStore} from "@/store/moment/useUpdateMomentVisibilityDialogStore";
import {Visibility} from "@/types/moment";
import {getVisibilityIcon, getVisibilityLabel} from "@/utils/moment";
import {useMomentStore} from "@/store/moment/useMomentStore";
import {shallow} from "zustand/vanilla/shallow";
import {toast} from "sonner";
import ContentWithLoader from "@/components/shared/ContentWithLoader";

const UpdateMomentVisibilityDialog = () => {
    const {t: u} = useTranslation("user");
    const {t: ts} = useTranslation("toast");

    const {
        open,
        selectedMoment,
        closeDialog
    } = useUpdateMomentVisibilityDialogStore();

    const {
        processingMomentIds,
        updateMomentVisibility,
    } = useMomentStore(
        (state) => ({
            processingMomentIds: state.processingMomentIds,
            updateMomentVisibility: state.updateMomentVisibility,
        }),
        shallow
    )

    const visibilityOptions = Object.values(Visibility);
    const [selected, setSelected] = useState<Visibility>(Visibility.ALL_FRIENDS);

    const handleUpdateMomentVisibility = useCallback(async () => {
        if (!selectedMoment) return;
        if (processingMomentIds.has(selectedMoment.id)) return;
        if (selectedMoment.visibility === selected) {
            closeDialog();
            return;
        }
        const result = await updateMomentVisibility(selectedMoment.id, selected);
        if (result.success) {
            toast.success(ts("user.moment.visibility.success"));
            closeDialog();
        } else {
            toast.error(ts("user.moment.visibility.error"));
        }

    }, [closeDialog, processingMomentIds, selected, selectedMoment, ts, updateMomentVisibility])

    useEffect(() => {
        if (open && selectedMoment) {
            setSelected(selectedMoment.visibility);
        }
    }, [open, selectedMoment]);

    if (!selectedMoment) return;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
            <DialogContent className="w-full !z-[110] md:max-w-lg h-full md:h-fit px-0 flex flex-col md:rounded-xl">
                <div className="flex flex-col w-full h-fit">
                    <div className="w-full flex flex-row items-center">
                        <DialogClose asChild>
                            <button className="block md:hidden rounded-full text-foreground-200 hover:text-foreground p-1 hover:bg-background-200">
                                <ChevronLeft className="size-7"/>
                            </button>
                        </DialogClose>

                        <DialogTitle className="text-2xl md:text-xl w-full pl-1 pr-8 md:pr-0 md:pl-8 font-medium text-left md:text-center">
                            {u("moment.update.visibility.title")}
                        </DialogTitle>
                        <DialogClose asChild>
                            <button className="hidden md:block p-1 rounded-full hover:bg-background-200">
                                <X className="size-6"/>
                            </button>
                        </DialogClose>

                        <DialogDescription />
                    </div>
                </div>

                {/* Options */}
                <div className="flex flex-col items-center h-full md:h-fit pb-2 md:pb-0 w-full gap-2">
                    <div className={"w-full flex flex-col h-full md:h-fit gap-2"}>
                        {visibilityOptions.map((v) => {
                            const isSelected = selected === v;
                            const Icon = getVisibilityIcon(v);
                            return (
                                <button
                                    key={v}
                                    onClick={() => setSelected(v)}
                                    className={`w-full flex flex-row hover:bg-background-200 rounded-full items-center justify-between py-2 px-4`}
                                >
                                    <div className={"flex flex-row items-center gap-1"}>
                                        <Icon className={"size-6"}/>
                                        <p className="text-base font-medium">
                                            {u(getVisibilityLabel(v))}
                                        </p>
                                    </div>
                                    {isSelected ? (
                                        <div className={"rounded-full ring-2 p-0.5 ring-primary"}>
                                            <div className={"size-3  bg-primary rounded-full"}/>
                                        </div>
                                    ) : (
                                        <div className={"rounded-full ring-2 p-0.5 ring-foreground-200 hover:ring-foreground"}>
                                            <div className={"size-3 bg-transparent rounded-full"}/>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div className={"p-2 w-full"}>
                        <button
                            disabled={processingMomentIds.has(selectedMoment.id)}
                            onClick={handleUpdateMomentVisibility}
                            className={"w-full h-10 rounded-full bg-primary hover:bg-primary/80 font-medium text-primary-foreground"}
                        >
                            <ContentWithLoader isLoading={processingMomentIds.has(selectedMoment.id)}>
                                {u("moment.button.update")}
                            </ContentWithLoader>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateMomentVisibilityDialog;
