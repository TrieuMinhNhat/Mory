import {useTranslation} from "next-i18next";
import React, {useState} from "react";
import {StoryType, Visibility} from "@/types/moment";

import {useStoriesStore} from "@/store/story/useStoriesStore";
import {shallow} from "zustand/vanilla/shallow";
import {CreateBeforeAfterStoryRequestBody} from "@/lib/services/stories.service";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {getVisibilityIcon, getVisibilityLabel} from "@/utils/moment";
import ContentWithLoader from "@/components/shared/ContentWithLoader";

interface Props {
    closeDialog: () => void;
}

const CreateBeforeAfterStoryView = ({closeDialog}: Props) => {
    const {t: u} = useTranslation("user");
    const {t: ts} = useTranslation("toast");

    const [visibility, setVisibility] = useState<Visibility>(Visibility.ALL_FRIENDS);
    const [title, setTitle] = useState("");
    const [emptyTitleError, setEmptyTitleError] = useState<string | null>(null);

    const {
        isCreatingStory,
        createBeforeAfterStory
    } = useStoriesStore(
        (state) => ({
            isCreatingStory: state.isCreatingStory,
            createBeforeAfterStory: state.createBeforeAfterStory,
        }),
        shallow
    );

    const handleCreateBeforeAfterStory = async () => {
        if (isCreatingStory) return;
        if (title.trim().length < 5) {
            setEmptyTitleError(u("story.create_story.error.min_length"))
            return;
        }
        const data: CreateBeforeAfterStoryRequestBody = {
            type: StoryType.BEFORE_AFTER,
            title: title,
            visibility: visibility,
        }
        const result = await createBeforeAfterStory(data);
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
                void handleCreateBeforeAfterStory();
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

export default CreateBeforeAfterStoryView;