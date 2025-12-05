import {useTranslation} from "next-i18next";
import {usePathname} from "next/navigation";
import {fallbackLng} from "@/lib/i18n/config";
import {enUS, vi} from "date-fns/locale";
import React, {useState} from "react";
import {StoryType, Visibility} from "@/types/moment";
import {useStoriesStore} from "@/store/story/useStoriesStore";
import {shallow} from "zustand/vanilla/shallow";
import {CreateChallengeStoryRequestBody} from "@/lib/services/stories.service";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {getVisibilityIcon, getVisibilityLabel} from "@/utils/moment";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {addDays, format} from "date-fns";
import {Calendar} from "@/components/ui/calendar";
import ContentWithLoader from "@/components/shared/ContentWithLoader";

interface Props {
    closeDialog: () => void;
}

const CreateChallengeStoryView = ({closeDialog}: Props) => {
    const {t: u} = useTranslation("user");
    const {t: ts} = useTranslation("toast");

    const pathname = usePathname()
    const locale = pathname.split("/")[1] || fallbackLng
    const dateFnsLocale = locale === "vi" ? vi : enUS

    const [visibility, setVisibility] = useState<Visibility>(Visibility.ALL_FRIENDS);
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState<number>(7);
    const [emptyTitleError, setEmptyTitleError] = useState<string | null>(null);
    const [durationError, setDurationError] = useState<string | null>(null);

    const [startDate, setStartDate] = useState<Date>(new Date())
    const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 6))
    const [startOpen, setStartOpen] = useState(false)
    const [endOpen, setEndOpen] = useState(false)

    const {
        isCreatingStory,
        createChallengeStory,
    } = useStoriesStore(
        (state) => ({
            isCreatingStory: state.isCreatingStory,
            createChallengeStory: state.createChallengeStory,
        }),
        shallow
    );

    const handleCreateChallengeStory = async () => {
        if (isCreatingStory) return;
        if (title.trim().length < 5) {
            setEmptyTitleError(u("story.create_story.error.min_length"))
            return;
        }
        const minEndDate = addDays(startDate, duration - 1);

        if (endDate < minEndDate) {
            setDurationError(`End date must be on or after ${format(minEndDate, "dd-MM-yyyy")}`);
            return;
        }
        const data: CreateChallengeStoryRequestBody = {
            type: StoryType.CHALLENGE,
            title: title,
            visibility: visibility,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            duration: duration
        }
        const result = await createChallengeStory(data);
        if (result.success) {
            toast.success(ts("user.create_story.success"));
            closeDialog();
        } else {
            toast.success(ts("user.create_story.error"));
        }
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                void handleCreateChallengeStory();
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
            <div className="flex flex-row items-center gap-2">
                <label className={"text-foreground text-base"}>
                    {u("story.create_story.label.duration")}:
                </label>
                <Select
                    value={String(duration)}
                    onValueChange={(v) => {
                        const newDuration = Number(v);
                        setDuration(newDuration);
                        setEndDate(addDays(startDate, newDuration - 1));
                    }}
                >
                    <SelectTrigger className="w-fit gap-2 h-8 bg-background-200 hover:bg-background-300 rounded-full px-3">
                        <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                        {[7, 14, 30, 60, 90].map((d) => (
                            <SelectItem key={d} value={String(d)}>
                                {d} days
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={visibility}
                    onValueChange={(v: Visibility) => setVisibility(v)}
                >
                    <SelectTrigger className="w-fit h-8 bg-background-200 hover:bg-background-300 rounded-full flex items-center gap-2 px-3">
                        <SelectValue placeholder="Visibility" />
                    </SelectTrigger>

                    <SelectContent>
                        {Object.values(Visibility).map((v) => {
                            const Icon = getVisibilityIcon(v);
                            return (
                                <SelectItem key={v} value={v}>
                                    <div className="flex items-center gap-1">
                                        <Icon className="size-4 text-foreground-300" />
                                        <span>{u(getVisibilityLabel(v))}</span>
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-row items-center gap-2">
                <label className={"text-foreground text-base"}>
                    {u("story.create_story.label.date")}:
                </label>
                {/* Start Date */}
                <Popover open={startOpen} onOpenChange={setStartOpen}>
                    <PopoverTrigger asChild>
                        <button
                            type={"button"}
                            className={"w-fit justify-start bg-background-200 px-3 h-8 rounded-full text-sm"}
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
                                setEndDate(addDays(date, duration - 1))
                                setStartOpen(false)
                                if (durationError) setDurationError(null)
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
                                if (durationError) setDurationError(null)
                            }}
                            disabled={{
                                before: addDays(startDate, duration - 1),
                            }}
                            locale={dateFnsLocale}
                            className="w-full bg-background-300 rounded-xl"
                        />
                    </PopoverContent>
                </Popover>
            </div>
            {durationError && <p className="text-error text-sm ml-12">{durationError}</p>}
            <button
                disabled={isCreatingStory}
                type={"submit"}
                className={"w-full h-10 bg-primary text-primary-foreground rounded-full font-medium hover:bg-opacity-90"}
            >
                <ContentWithLoader isLoading={isCreatingStory}>
                    {u("story.create_story.button.create")}
                </ContentWithLoader>
            </button>
        </form>
    )
}

const formatDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

export default CreateChallengeStoryView;