"use client"

import {useTranslation} from "next-i18next";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import React, {useEffect, useState} from "react";
import {useUpdateStoryDialogStore} from "@/store/story/useUpdateStoryDialogStore";
import {useStoriesStore} from "@/store/story/useStoriesStore";
import {shallow} from "zustand/vanilla/shallow";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {StoryScope, StoryType, Visibility} from "@/types/moment";
import {Input} from "@/components/ui/input";
import {usePathname} from "next/navigation";
import {fallbackLng} from "@/lib/i18n/config";
import {enUS, vi} from "date-fns/locale";
import {UpdateStoryRequestBody} from "@/lib/services/stories.service";
import {toast} from "sonner";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {getVisibilityIcon} from "@/utils/moment";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar";
import {ChevronLeft, X} from "lucide-react";
import {getStoryStatus, StoryStatus} from "@/utils/story";

const UpdateStoryDialog = () => {
    const {t: u} = useTranslation("user");
    const { t: ts } = useTranslation("toast")

    const pathname = usePathname()
    const locale = pathname.split("/")[1] || fallbackLng
    const dateFnsLocale = locale === "vi" ? vi : enUS

    const { open, selectedStory, closeDialog } = useUpdateStoryDialogStore();
    const {
        processingStoryIds,
        updateStory
    } = useStoriesStore(
        (state) => ({
            processingStoryIds: state.processingStoryIds,
            updateStory: state.updateStory,
        }),
        shallow
    )

    const [visibility, setVisibility] = useState<Visibility>(selectedStory?.visibility ? selectedStory.visibility : Visibility.ALL_FRIENDS);
    const [title, setTitle] = useState<string>(selectedStory?.title ? selectedStory.title : "");
    const [emptyTitleError, setEmptyTitleError] = useState<string | null>(null);

    const [startDate, setStartDate] = useState<Date>(selectedStory?.startDate ? new Date(selectedStory.startDate) : new Date())
    const [endDate, setEndDate] = useState<Date>(selectedStory?.endDate ? new Date(selectedStory.endDate) : new Date())
    const [startOpen, setStartOpen] = useState(false)
    const [endOpen, setEndOpen] = useState(false)

    useEffect(() => {
        if (!selectedStory) return;
        setTitle(selectedStory.title)
        setVisibility(selectedStory.visibility)
        if (selectedStory.startDate) {
            setStartDate(new Date(selectedStory.startDate))
        }
        if (selectedStory.endDate) {
            setEndDate(new Date(selectedStory.endDate))
        }
    }, [selectedStory]);

    const handleUpdateStory = async () => {
        if (!selectedStory) return;
        if (processingStoryIds.has(selectedStory.id)) return;
        if (title.trim().length < 5) {
            setEmptyTitleError(u("story.create_story.error.min_length"))
            return;
        }
        const data: UpdateStoryRequestBody = buildUpdateData(
            selectedStory.type,
            selectedStory.scope,
            title,
            visibility,
            startDate,
            endDate
        )
        const result = await updateStory(selectedStory.id, data);
        if (result.success) {
            toast.success(ts("user.story.update.success"));
            closeDialog();
        } else {
            toast.success(ts("user.story.update.error"));
        }
    }

    if (!selectedStory) return;

    return (
        <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
            <DialogContent className="w-full md:max-w-[500px] h-full md:h-fit md:max-h-[90vh] !py-2 flex flex-col md:rounded-xl">
                <div className={"w-full flex flex-row border-b border-background-m pb-2 md:pt-1 items-center"}>
                    <DialogClose asChild>
                        <button className={"block md:hidden rounded-full text-foreground-200 hover:text-foreground p-1 hover:bg-background-200"}>
                            <ChevronLeft className={"size-7"}/>
                        </button>
                    </DialogClose>
                    <DialogTitle className={"text-xl w-full pl-1 pr-8 md:pr-0 md:pl-8 font-medium text-left md:text-center"}>
                        {selectedStory.title}
                    </DialogTitle>
                    <DialogClose asChild>
                        <button className={" hidden md:block p-1 rounded-full hover:bg-background-200"}>
                            <X className={"size-6"}/>
                        </button>
                    </DialogClose>
                    <DialogDescription></DialogDescription>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void handleUpdateStory();
                    }}
                    className="flex flex-col gap-3"
                >
                    <div className={"flex flex-row items-center gap-2"}>
                        <label className={"text-foreground text-base"}>
                            {u("story.create_story.label.title")}:
                        </label>
                        <Input
                            value={title}
                            onChange={
                                (e) => {
                                    setTitle(e.target.value);
                                    if (emptyTitleError) setEmptyTitleError(null);
                                }
                            }
                            maxLength={25}
                            className={"bg-transparent w-1/2 border border-background-m rounded-full h-8 px-3"}
                        />
                    </div>
                    {emptyTitleError && <p className="text-error text-sm ml-12">{emptyTitleError}</p>}
                    {selectedStory.scope !== StoryScope.GROUP && (
                        <Select
                            value={visibility}
                            onValueChange={(v: Visibility) => setVisibility(v)}
                        >
                            <SelectTrigger className="w-40 h-8 bg-background-200 hover:bg-background-300 rounded-full flex items-center gap-2 px-3">
                                <SelectValue placeholder="Visibility" />
                            </SelectTrigger>

                            <SelectContent>
                                {Object.values(Visibility).map((v) => {
                                    const Icon = getVisibilityIcon(v);
                                    const labelMap: Record<Visibility, string> = {
                                        [Visibility.ALL_FRIENDS]: "All Friends",
                                        [Visibility.CLOSE_FRIENDS]: "Close Friends",
                                        [Visibility.PARTNER_ONLY]: "Partner Only",
                                        [Visibility.ONLY_ME]: "Only Me",
                                    };
                                    return (
                                        <SelectItem key={v} value={v}>
                                            <div className="flex items-center gap-1">
                                                <Icon className="size-4 text-foreground-300" />
                                                <span>{labelMap[v]}</span>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    )}
                    {(selectedStory.type === StoryType.JOURNEY) && (
                        <div className="flex flex-row items-center gap-2">
                            <label className={"text-foreground text-base"}>
                                {u("story.create_story.label.date")}:
                            </label>
                            {/* Start Date */}
                            <Popover open={startOpen} onOpenChange={setStartOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type={"button"}
                                        disabled={
                                            (getStoryStatus(selectedStory) !== StoryStatus.UPCOMING) &&
                                            !(getStoryStatus(selectedStory) === StoryStatus.ONGOING && (!selectedStory.momentsInfo ||selectedStory.momentsInfo?.total === 0))
                                        }
                                        className={`w-fit justify-start bg-background-200 px-3 h-8 rounded-full text-sm
                                            ${
                                                (getStoryStatus(selectedStory) !== StoryStatus.UPCOMING) &&
                                                !(getStoryStatus(selectedStory) === StoryStatus.ONGOING && (!selectedStory.momentsInfo ||selectedStory.momentsInfo?.total === 0)) && "cursor-not-allowed"
                                            }   
                                        `}
                                    >
                                        {startDate ? format(startDate, "dd-MM-yyyy") : "Start date"}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="p-0 z-[9999]"
                                    align="center"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={(date) => {
                                            if (!date) return
                                            setStartDate(date)
                                            if (endDate && date > endDate) {
                                                setEndDate(date)
                                            }
                                            setStartOpen(false)
                                        }}
                                        disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                                        locale={dateFnsLocale}
                                        className="w-full bg-background-300 rounded-xl"
                                    />
                                </PopoverContent>
                            </Popover>

                            <span className="text-foreground">-</span>

                            {/* End Date */}
                            <Popover open={endOpen} onOpenChange={setEndOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type={"button"}
                                        className={"w-fit justify-start bg-background-200 px-3 h-8 rounded-full text-sm"}
                                    >
                                        {endDate ? format(endDate, "dd-MM-yyyy") : "End date"}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0" align="center">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={(date) => {
                                            if (!date) return
                                            setEndDate(date)
                                            setEndOpen(false)
                                        }}
                                        disabled={{
                                            before: startDate
                                                ? new Date(startDate.setHours(0, 0, 0, 0))
                                                : new Date(new Date().setHours(0, 0, 0, 0)),
                                        }}
                                        locale={dateFnsLocale}
                                        className="w-full bg-background-300 rounded-xl"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                    <button
                        disabled={processingStoryIds.has(selectedStory.id)}
                        type={"submit"}
                        className={"w-full h-10 bg-primary text-primary-foreground rounded-full font-medium hover:bg-opacity-90"}
                    >
                        <ContentWithLoader isLoading={processingStoryIds.has(selectedStory.id)}>
                            {u("story.create_story.button.update")}
                        </ContentWithLoader>
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function buildUpdateData(
    type: StoryType,
    scope: StoryScope,
    title: string,
    visibility: Visibility,
    startDate: Date,
    endDate: Date
): UpdateStoryRequestBody {
    switch (type) {
        case StoryType.CHALLENGE:
            return {
                title: title,
                visibility: visibility
            }
        case StoryType.JOURNEY:
            if (scope === StoryScope.GROUP) {
                return {
                    title: title,
                    startDate: formatDate(startDate),
                    endDate: formatDate(endDate)
                }
            } else {
                return {
                    title: title,
                    visibility: visibility,
                    startDate: formatDate(startDate),
                    endDate: formatDate(endDate)
                }
            }

        case StoryType.ALBUM:
            if (scope === StoryScope.GROUP) {
                return {
                    title: title
                }
            } else {
                return {
                    title: title,
                    visibility: visibility,
                }
            }

        case StoryType.BEFORE_AFTER:
            return {
                title,
                visibility
            }
    }
}

const formatDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

export default UpdateStoryDialog;