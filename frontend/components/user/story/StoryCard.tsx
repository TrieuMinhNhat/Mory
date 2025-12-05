import {Story, StoryType, Visibility} from "@/types/moment";
import React from "react";
import {toDateString} from "@/utils/time";
import {getStoryStatus, getStoryTypeIcon, StoryStatus} from "@/utils/story";
import {getVisibilityIcon} from "@/utils/moment";
import OMenuDotHorizontal from "@/components/shared/icons/OMenuDotHorizontal";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/constants/routes";
import {useStoryDrawerStore} from "@/store/story/useStoryDrawerStore";
import {useStoriesStore} from "@/store/story/useStoriesStore";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {useStoryDetailsStore} from "@/store/story/useStoryDetailsStore";
import StoryAvatars from "@/components/user/story/StoryAvatars";
import {useTranslation} from "next-i18next";
import {TFunction} from "i18next";

interface StoryCardProps {
    story: Story;
}

const StoryCard = ({story}: StoryCardProps) => {
    const router = useRouter();
    const {t: u} = useTranslation("user");

    const processingStoryIds = useStoriesStore((state) => state.processingStoryIds);

    const { openDrawer } = useStoryDrawerStore();
    const setStory = useStoryDetailsStore((s) => s.setStory)

    return (
        <div
            tabIndex={0}
            role={"button"}
            onClick={() => {
                if (processingStoryIds.has(story.id)) return;
                setStory(story);
                router.push(ROUTES.STORY.DETAILS(story.id))
            }}
            className={`w-full p-2 flex rounded-xl hover:bg-background-200 ${processingStoryIds.has(story.id) ? "hover:cursor-wait" : "hover:cursor-pointer"} flex-row items-center gap-2 has-[button:hover]:bg-background-100`}
        >
            <StoryAvatars story={story}/>
            <div
                className={"w-full h-full flex flex-col gap-2 justify-center items-center"}
            >
                <div className={"w-full h-fit flex flex-row gap-1 items-center text-foreground"}>
                    <h3 className={"text-base font-semibold"}>{story.title}</h3>
                    <div className={"shrink-0"}>
                        {getVisibilityElement(story.visibility)}
                    </div>
                </div>
                <div className={"w-full flex flex-row items-center gap-1"}>
                    <div className={"flex flex-row gap-1"}>
                        {getStatusElement(story, u)}
                        {getStoryTypeElement(story.type, story.duration)}
                    </div>
                    {
                        story.startDate && story.endDate && (
                            <div className={"hidden sm:flex flex-row text-sm w-fit items-center gap-1"}>
                                {story.startDate && <p className={"text-sm text-foreground-200"}>{toDateString(story.startDate)}</p>}

                                {story.endDate && (
                                    <>
                                        <span className="text-foreground-300">-</span>
                                        <p className={"text-sm text-foreground-200"}>{toDateString(story.endDate)}</p>
                                    </>
                                )}
                            </div>
                        )
                    }
                </div>
            </div>
            <button
                className={"p-2 rounded-full bg-transparent hover:bg-background-300 shrink-0"}
                disabled={processingStoryIds.has(story.id)}
                onClick={(e) => {
                    e.stopPropagation()
                    openDrawer(story)
                }}
            >
                <ContentWithLoader isLoading={processingStoryIds.has(story.id)} spinnerSize={4}>
                    <OMenuDotHorizontal className={"size-6"}/>
                </ContentWithLoader>
            </button>
        </div>
    )
}

const getStoryTypeElement = (type: StoryType, duration?: number): React.ReactNode => {
    const Icon = getStoryTypeIcon(type);
    if (type === StoryType.CHALLENGE) {
        return (
            <div className={"w-fit pb-[1px] px-1 flex flex-row items-center gap-0.5 bg-background-m rounded-full"}>
                <Icon className={"size-4 text-foreground"} />
                {duration && <p className={"text-sm font-medium text-foreground-200"}>{duration}</p>}
            </div>
        )
    }
    return <Icon className={"size-4 text-foreground"} />;
}

const getVisibilityElement = (visibility: Visibility): React.ReactNode => {
    const Icon = getVisibilityIcon(visibility);
    return (
        <div className={"p-0.5 rounded-full bg-background-200 w-fit"}>
            <Icon className={"size-4 md:size-5 text-foreground"} />
        </div>
    );
}

export const getStatusElement = (story: Story, u: TFunction): React.ReactNode => {
    const status = getStoryStatus(story);
    switch (status) {
        case StoryStatus.ONGOING:
            return (
                <div className={"w-fit flex flex-row items-center gap-1 h-4"}>
                    <div className={"size-3 rounded-full bg-green-300"}/>
                    <p className={"text-sm"}>{u("story.status.ongoing")}</p>
                </div>
            )
        case StoryStatus.ENDED:
            return (
                <div className={"w-fit flex flex-row items-center gap-1 h-4"}>
                    <div className={"size-3 rounded-full bg-background-m"}/>
                    <p className={"text-sm"}>{u("story.status.ended")}</p>
                </div>
            )
        case StoryStatus.UPCOMING:
            return (
                <div className={"w-fit flex flex-row items-center gap-1 h-4"}>
                    <div className={"size-3 rounded-full bg-orange-300"}/>
                    <p className={"text-sm"}>{u("story.status.upcoming")}</p>
                </div>
            )
        case StoryStatus.FAILED:
            return (
                <div className={"w-fit flex flex-row items-center gap-1 h-4"}>
                    <div className={"size-3 rounded-full bg-error"}/>
                    <p className={"text-sm"}>{u("story.status.failed")}</p>
                </div>
            )
        case StoryStatus.COMPLETED:
            return (
                <div className={"w-fit flex flex-row items-center gap-1 h-4"}>
                    <div className={"size-3 rounded-full bg-close"}/>
                    <p className={"text-sm"}>{u("story.status.completed")}</p>
                </div>
            )
        case StoryStatus.NONE:
            return (
                <div className={"w-fit flex flex-row items-center gap-1 h-4"}>
                    <p className={"text-sm"}>
                        {(story.totalMoments ?? 0) === 0
                            ? u("story.no_moment")
                            : u("story.moment", {count: story.totalMoments})
                        }
                    </p>
                </div>
            )
    }
}


export default StoryCard;

