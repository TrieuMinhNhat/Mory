import {useTranslation} from "next-i18next";
import React, {useEffect, useState} from "react";
import {StoryScope, StoryType, Visibility} from "@/types/moment";
import {UserPreview} from "@/types/user";
import {useStoriesStore} from "@/store/story/useStoriesStore";
import {shallow} from "zustand/vanilla/shallow";
import {CreateAlbumStoryRequestBody} from "@/lib/services/stories.service";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {getVisibilityIcon, getVisibilityLabel} from "@/utils/moment";
import {Plus} from "lucide-react";
import Image from "next/image";
import Cancel from "@/components/user/moment/icons/Cancel";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import AddMembersDialog from "@/components/user/story/create/AddMembersDialog";

interface Props {
    closeDialog: () => void;
}

const CreateAlbumStoryView = ({closeDialog}: Props) => {
    const {t: u} = useTranslation("user");
    const {t: ts} = useTranslation("toast");

    const [isGroup, setIsGroup] = useState(false);
    const [visibility, setVisibility] = useState<Visibility>(Visibility.ALL_FRIENDS);
    const [title, setTitle] = useState("");
    const [emptyTitleError, setEmptyTitleError] = useState<string | null>(null);

    const [members, setMembers] = useState<UserPreview[]>([]);

    const handleMemberRemove = (id: string) => {
        let newMembers = [...members];
        newMembers = newMembers.filter((m) => m.id !== id);
        setMembers(newMembers);
    }

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    useEffect(() => {
        if (isGroup) {
            setVisibility(Visibility.ALL_FRIENDS);
        }
    }, [isGroup]);

    const {
        isCreatingStory,
        createAlbumStory
    } = useStoriesStore(
        (state) => ({
            isCreatingStory: state.isCreatingStory,
            createAlbumStory: state.createAlbumStory,
        }),
        shallow
    );

    const handleCreateAlbumStory = async () => {
        if (isCreatingStory) return;
        if (title.trim().length < 5) {
            setEmptyTitleError(u("story.create_story.error.min_length"))
            return;
        }
        const data: CreateAlbumStoryRequestBody = {
            type: StoryType.ALBUM,
            title: title,
            scope: isGroup ? StoryScope.GROUP : StoryScope.PERSONAL,
            visibility: visibility,
            memberIds: members.map((member) => member.id),
        }
        const result = await createAlbumStory(data);
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
                void handleCreateAlbumStory();
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
                <label
                    htmlFor="group-checkbox"
                    className="flex items-center gap-2 cursor-pointer select-none"
                >
                    <input
                        id="group-checkbox"
                        type="checkbox"
                        checked={isGroup}
                        onChange={(e) => setIsGroup(e.target.checked)}
                        className="hidden"
                    />
                    <span
                        className={`w-4 h-4 flex items-center justify-center rounded-full border transition-all ${
                            isGroup
                                ? "bg-primary border-primary"
                                : "border-background-m bg-transparent"
                        }`}
                    >
                    </span>
                    <span className="text-foreground text-sm">
                        {u("story.create_story.journey.is_group")}
                    </span>
                </label>
                <Select
                    value={visibility}
                    onValueChange={(v: Visibility) => setVisibility(v)}
                    disabled={isGroup}
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
            {isGroup && (
                <div className="flex flex-col gap-2 mt-1">
                    <label className={"text-foreground text-base"}>
                        {u("story.create_story.label.members")}:
                    </label>
                    <div className={"flex flex-row flex-wrap gap-2"}>
                        {/*Tràn*/}
                        <button
                            type={"button"}
                            className={"size-8 border border-foreground-200 rounded-full text-foreground-200 hover:border-foreground hover:text-foreground"}
                            onClick={() => setIsAddDialogOpen(true)}
                        >
                            <Plus className={"size-5 mx-auto"}/>
                        </button>
                        {members.map((m) => (
                            <div
                                key={m.id}
                                className={"flex flex-row gap-1 px-1 h-8 items-center justify-center w-fit border border-foreground-200 rounded-full"}
                            >
                                <div className={"relative w-6 h-6 rounded-full"}>
                                    <Image
                                        src={m.avatarUrl ?? "/assets/images/avatar.png"}
                                        alt={"avatar"}
                                        sizes={"24px"}
                                        fill
                                        className={"rounded-full object-cover"}
                                    />
                                </div>
                                <span className={"text-base text-foreground max-w-36 truncate"}>
                                {m.displayName}
                            </span>
                                <button
                                    onClick={() => handleMemberRemove(m.id)}
                                    className={"size-6 shrink-0 hover:bg-background-300 rounded-full"}
                                >
                                    <Cancel className={"size-4 mx-auto"}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <button
                disabled={isCreatingStory}
                type={"submit"}
                className={"w-full h-10 bg-primary text-primary-foreground rounded-full font-medium hover:bg-opacity-90"}
            >
                <ContentWithLoader isLoading={isCreatingStory}>
                    {u("story.create_story.button.create")}
                </ContentWithLoader>
            </button>
            <AddMembersDialog
                isOpen={isAddDialogOpen}
                onIsOpenChange={setIsAddDialogOpen}
                selectedMembers={members}
                onMembersChange={setMembers}
            />
        </form>
    )
}

export default CreateAlbumStoryView;