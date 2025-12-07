"use client"

import React, {useCallback, useEffect, useRef, useState} from "react";
import {useTranslation} from "next-i18next";
import OMenuDot from "@/components/shared/icons/OMenuDot";
import {ChevronLeft, Plus} from "lucide-react";
import {useParams, useRouter} from "next/navigation";
import {Moment, Story, StoryScope, StoryType, Visibility} from "@/types/moment";
import {Skeleton} from "@/components/ui/skeleton";
import EmptyList from "@/components/shared/EmptyList";
import {getStoryStatus, getStoryTypeIcon, StoryStatus} from "@/utils/story";
import {getVisibilityIcon} from "@/utils/moment";
import {toDateString} from "@/utils/time";
import Image from "next/image";
import {ReactCompareSlider, ReactCompareSliderHandle, ReactCompareSliderImage} from "react-compare-slider";
import MomentImageGridItem from "@/components/user/moment/MomentImageGridItem";
import StoryMemberItem from "@/components/user/story/member/StoryMemberItem";
import AddNewMembersDialog from "@/components/user/story/member/AddNewMembersDialog";
import {useAddNewMembersDialogStore} from "@/store/story/useAddNewMembersDialogStore";
import {useStoryDetailsStore} from "@/store/story/useStoryDetailsStore";
import StoryMemberActionsDrawer from "@/components/user/story/member/StoryMemberActionsDrawer";
import {useStoryDrawerStore} from "@/store/story/useStoryDrawerStore";
import {ROUTES} from "@/constants/routes";
import {useMomentCarouselStore} from "@/store/moment/useMomentCarouselStore";
import {shallow} from "zustand/vanilla/shallow";
import {useAuthStore} from "@/store/useAuthStore";
import {getStatusElement} from "@/components/user/story/StoryCard";

const SCROLL_THRESHOLD = 80;

const StoryDetailsPage = () => {
    const {t: u} = useTranslation("user");
    const params = useParams();
    const router = useRouter();
    const storyId = params?.id as string;

    const user = useAuthStore((state) => state.user);

    const { openCarousel, appendMomentsAndUpdateHasNext } = useMomentCarouselStore()
    const { open: addNewMembersDialogOpen } = useAddNewMembersDialogStore();

    const { 
        story,
        error,
        isFetchingStory,
        fetchStory,
        connectionStatusMap,
        fetchConnections,
        connectionsHasFetchedOnce,
        isFetchingConnections,
        moments,
        isFetchingMoments,
        fetchStoryMoments,
        momentsHasNext,
        momentsHasFetchedOnce
    } = useStoryDetailsStore(
        (state) => ({
            story: state.story,
            error: state.error,
            isFetchingStory: state.isFetchingStory,
            fetchStory: state.fetchStory,
            connectionStatusMap: state.connectionStatusMap,
            fetchConnections: state.fetchConnections,
            connectionsHasFetchedOnce: state.connectionsHasFetchedOnce,
            isFetchingConnections: state.isFetchingConnections,
            moments: state.moments,
            momentsHasNext: state.momentsHasNext,
            momentsHasFetchedOnce: state.momentsHasFetchedOnce,
            isFetchingMoments: state.isFetchingMoments,
            fetchStoryMoments: state.fetchStoryMoments,
        }),
        shallow
    )

    const { openDrawer } = useStoryDrawerStore();
    const [isMomentTab, setIsMomentTab] = useState(true);

    const openAddMembersDialog = useAddNewMembersDialogStore((state) => state.openDialog);

    const gridRef = useRef<HTMLDivElement>(null);
    const [itemSize, setItemSize] = useState<number>(0);

    useEffect(() => {
        if (!gridRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const width = entry.contentRect.width;
            const gap = 4;
            const colCount = 3;
            const size = (width - gap * (colCount - 1)) / colCount;
            setItemSize(size);
        });

        observer.observe(gridRef.current);
        return () => observer.disconnect();
    }, [isMomentTab]);

    const handleFetchStory = useCallback(async () => {
        if (!storyId || story || isFetchingStory) return;
        void fetchStory(storyId);
    }, [fetchStory, isFetchingStory, story, storyId]);

    useEffect(() => {
        void handleFetchStory();
    }, [handleFetchStory, story]);
    
    useEffect(() => {
        if (isFetchingConnections || !story || connectionsHasFetchedOnce) return;
        if (story.members.length > 0) 
            void fetchConnections(story.members.map((m) => m.id))
    }, [connectionsHasFetchedOnce, fetchConnections, isFetchingConnections, story]);

    useEffect(() => {
        if (momentsHasFetchedOnce || isFetchingMoments || !story) return;
        void fetchStoryMoments(story.id)
    }, [fetchStoryMoments, isFetchingMoments, momentsHasFetchedOnce, story, storyId]);
    
    const handleFetchMoreMoments = useCallback(async () => {
        if (!story) return;
        if (!momentsHasNext) return;
        if (isFetchingMoments) return;
        const result = await fetchStoryMoments(story.id)
        if (result.success && result.data) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            appendMomentsAndUpdateHasNext(result.data.moments as Moment[], result.data.hasNext)
        }
    }, [appendMomentsAndUpdateHasNext, fetchStoryMoments, isFetchingMoments, momentsHasNext, story])

    const handleScrollMoments = useCallback(() => {
        if (!isMomentTab || isFetchingMoments || !momentsHasNext) return;

        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        const isNearEnd = scrollTop + viewportHeight >= fullHeight - SCROLL_THRESHOLD;
        if (isNearEnd) {
            void handleFetchMoreMoments();
        }
    }, [isMomentTab, isFetchingMoments, momentsHasNext, handleFetchMoreMoments]);

    useEffect(() => {
        window.addEventListener("scroll", handleScrollMoments, { passive: true });
        return () => window.removeEventListener("scroll", handleScrollMoments);
    }, [handleScrollMoments]);

    if (error) {
        return (
            <div className={"h-full px-2 md:px-6 pt-2 w-full"}>
                <div className={"w-full flex flex-col items-center justify-center"}>
                    <EmptyList message={u("story.details.error")}/>
                </div>
            </div>
        )
    }

    return (
        <div className={"h-full px-2 md:px-6 pt-2 w-full"}>
            <div className={"w-full flex flex-row items-center md:mt-2 h-10 justify-between"}>
                <button
                    onClick={() => router.back()}
                    className={"text-foreground-200 h-10 w-10 hover:bg-background-200 rounded-full hover:text-foreground"}
                >
                    <ChevronLeft className={"size-7 mx-auto"}/>
                </button>
                <button
                    disabled={isFetchingStory}
                    onClick={() => { if (story) openDrawer(story, () => {router.replace(ROUTES.STORY.ROOT)})}}
                    className={"text-foreground-200 h-10 w-10 hover:bg-background-200 rounded-full hover:text-foreground"}
                >
                    <OMenuDot className={"size-7 mx-auto"}/>
                </button>
            </div>
            {/*Story details*/}
            {isFetchingStory ? (
                <div className={"flex flex-col w-full h-fit items-center gap-2"}>
                    <div className={"w-fit flex flex-row items-center gap-1"}>
                        <Skeleton className={"w-24 h-6 rounded-full"}/>
                        <Skeleton className={"h-6 w-6 rounded-full"}/>
                    </div>

                    <div className={"w-fit flex flex-row items-center gap-1"}>
                        <Skeleton className={"w-36 h-4 rounded-full"}/>
                        <Skeleton className={"h-6 w-6 rounded-full"}/>
                        <Skeleton className={"w-20 h-4 rounded-full"}/>
                    </div>
                    <Skeleton className="w-full h-1 rounded-full"/>
                </div>
            ) : (
                <>
                    {story && (
                        <>
                            <div className={"flex flex-col w-full h-fit items-center gap-2"}>
                                <div className={"w-fit flex flex-row items-center gap-1"}>
                                    <h3 className={"text-2xl font-semibold"}>{story.title}</h3>
                                    <div className={"shrink-0"}>
                                        {getVisibilityElement(story.visibility)}
                                    </div>
                                </div>

                                <div className={"w-fit flex flex-row items-center gap-1"}>
                                    {
                                        story.startDate && story.endDate && (
                                            <div className={"flex flex-row text-sm w-fit items-center gap-1"}>
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
                                    {getStoryTypeElement(story.type, story.duration)}
                                    {getStatusElement(story, u)}
                                </div>
                            </div>
                            {story.scope === StoryScope.GROUP ? (
                                <div className={"nav-container py-2 border-background-m border-t"}>
                                    <button
                                        onClick={() => setIsMomentTab(true)}
                                        className={`nav-button ${isMomentTab && "!bg-primary !text-fg-light-100"}`}
                                    >
                                        {u("story.details.button.moments")}
                                    </button>
                                    <button
                                        onClick={() => setIsMomentTab(false)}
                                        className={`nav-button ${!isMomentTab && "!bg-primary !text-fg-light-100"}`}
                                    >
                                        {u("story.details.button.members")}
                                    </button>
                                </div>
                            ) : (
                                <div className={"w-full flex flex-row gap-2 pt-4 pb-2 items-center justify-center"}>
                                    <button
                                        className={"w-14 h-14 rounded-full relative"}
                                        onClick={() => {
                                            if (user?.id === story?.creator.id) {
                                                router.push(ROUTES.PROFILE.ME.ROOT)
                                                return;
                                            }
                                            router.push(ROUTES.PROFILE.ROOT(story?.creator.id))
                                        }}
                                    >
                                        <Image
                                            src={story.creator?.avatarUrl ?? "/assets/images/avatar.png"}
                                            alt={story.creator?.displayName + " avatar"}
                                            fill
                                            sizes={"56px"}
                                            className={"rounded-full object-cover"}
                                        />
                                    </button>
                                    <button
                                        className={"w-fit"}
                                        onClick={() => {
                                            if (user?.id === story?.creator.id) {
                                                router.push(ROUTES.PROFILE.ME.ROOT)
                                                return;
                                            }
                                            router.push(ROUTES.PROFILE.ROOT(story?.creator.id))
                                        }}
                                    >
                                        <span className={"overflow-hidden truncate text-xl font-medium"}>
                                            {story.creator?.displayName}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/*Progress*/}
            {story && story.type !== StoryType.ALBUM && (
                <div className="w-full mt-2">
                    <div className="w-full h-1 bg-background-200 rounded-full">
                        <div
                            className="h-1 bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${getStoryProgress(story, moments.length)}%` }}
                        />
                    </div>
                </div>
            )}

            {story?.type === StoryType.BEFORE_AFTER && (
                <>
                    {moments.length === 0 && momentsHasFetchedOnce
                        ? (
                            <EmptyList message={u("home.empty")}/>
                        ) : (
                            <div className={"w-full aspect-square py-2"}>
                                {moments.length === 2 && moments[0]?.mediaUrl && moments[1]?.mediaUrl ? (
                                    <ReactCompareSlider
                                        itemOne={<ReactCompareSliderImage src={moments[0]?.mediaUrl} alt={"Before"} className={"object-cover rounded-2xl"}/>}
                                        itemTwo={<ReactCompareSliderImage src={moments[1]?.mediaUrl} alt={"After"} className={"object-cover rounded-2xl"}/>}
                                        className={"rounded-2xl"}
                                        handle={
                                            <ReactCompareSliderHandle
                                                buttonStyle={{
                                                    backdropFilter: "blur(4px)",
                                                    backgroundColor: "rgb(var(--color-brand))",
                                                    border: "2px solid rgb(var(--color-fg-light-100))",
                                                    color: "rgb(240,240,240)",
                                                    boxShadow: "0 0 10px rgba(0,0,0,0.25)",
                                                    width: "40px",
                                                    height: "40px",
                                                }}
                                                linesStyle={{
                                                    width: "2px",
                                                    color: "rgb(var(--color-fg-light-100))",
                                                    strokeWidth: 2,
                                                }}
                                            />
                                        }
                                    />
                                ) : (
                                    <>
                                        {moments[0]?.mediaUrl && (
                                            <div className={"w-full aspect-square relative"}>
                                                <Image
                                                    src={moments[0]?.mediaUrl}
                                                    alt={moments[0]?.caption ?? "moment"}
                                                    fill
                                                    className={"rounded-2xl object-cover"}
                                                />
                                            </div>

                                        )
                                        }
                                    </>
                                )}
                            </div>
                        )
                    }
                </>
            )}

            {/*Moments*/}
            {story?.type !== StoryType.BEFORE_AFTER && (
                <>
                    {isMomentTab ? (
                        <>
                            {moments.length === 0 && momentsHasFetchedOnce
                                ? (
                                    <EmptyList message={u("home.empty")}/>
                                ) : (
                                    <>
                                        <div ref={gridRef} className="grid grid-cols-3 gap-1 pt-2 pb-20 md:pb-2">
                                            {!momentsHasFetchedOnce && isFetchingMoments ? (

                                                Array.from({ length: 9 }).map((_, i) => (
                                                    <Skeleton key={i} className={"w-full aspect-square rounded-xl"}/>
                                                ))
                                            ) : (
                                                <>
                                                    {moments.map((m, index) => (
                                                        <div
                                                            key={m.id}
                                                            className={"relative rounded-xl"}
                                                            style={{
                                                                width: itemSize,
                                                                height: itemSize,
                                                            }}
                                                        >
                                                            <MomentImageGridItem
                                                                moment={m}
                                                                showStoryInfo={false}
                                                                showUserInfo={story?.scope === StoryScope.GROUP}
                                                                showHoverRing={story?.scope !== StoryScope.GROUP}
                                                                onClick={() => {
                                                                    if (story) {
                                                                        openCarousel({
                                                                            moments: moments,
                                                                            storyId: story.id,
                                                                            title: story.title,
                                                                            currentIndex: index,
                                                                            hasNext: momentsHasNext,
                                                                            onFetchMore: handleFetchMoreMoments,
                                                                        })
                                                                    }
                                                                }}
                                                                size={itemSize}
                                                            />
                                                        </div>
                                                    ))}
                                                    {isFetchingMoments && momentsHasNext && (
                                                        <>
                                                            {Array.from(
                                                                { length: (3 - (moments.length % 3)) % 3 || 3 },
                                                                (_, i) => (
                                                                    <Skeleton
                                                                        key={`skeleton-${i}`}
                                                                        className={"w-full aspect-square rounded-xl"}
                                                                    />
                                                                )
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </>
                                )
                            }
                        </>
                    ) : (
                        <div
                            className={"flex flex-col gap-1 h-fit pt-2 pb-20 md:pb-2"}
                        >
                            {story?.members.map((member) => (
                                <StoryMemberItem key={member.id} member={member} connection={connectionStatusMap.get(member.id)} story={story}/>
                            ))}
                            <div className={"w-full flex items-center justify-center"}>
                                <button
                                    disabled={!story || (getStoryStatus(story) !== StoryStatus.UPCOMING && getStoryStatus(story) !== StoryStatus.ONGOING && getStoryStatus(story) !== StoryStatus.NONE)}
                                    className={`w-24 h-10 bg-background-200 hover:bg-background-300 flex items-center justify-center rounded-full
                                        ${(!story || (getStoryStatus(story) !== StoryStatus.UPCOMING && getStoryStatus(story) !== StoryStatus.ONGOING && getStoryStatus(story) !== StoryStatus.NONE)) && "cursor-not-allowed"}
                                    `}
                                    onClick={() => {
                                        if (!!story) {
                                            openAddMembersDialog(story)
                                        }
                                    }}
                                >
                                    <Plus/>
                                </button>
                            </div>
                        </div>
                    )
                    }
                </>
            )}
            {story && story.scope === StoryScope.GROUP && (
                <>
                    <StoryMemberActionsDrawer/>
                    {addNewMembersDialogOpen && <AddNewMembersDialog/>}
                </>
            )}
        </div>
    )
}

const getStoryProgress = (
    story: Story,
    momentsLength: number
): number => {
    if (story.type === StoryType.CHALLENGE) {
        if (!story.duration || story.duration <= 0) return 0;
        const progress = ((story.totalMoments ?? momentsLength) / story.duration) * 100;
        return Math.min(Math.round(progress), 100);
    }

    if (!story.startDate || !story.endDate) return 0;
    const start = new Date(story.startDate).getTime();
    const end = new Date(story.endDate).getTime();
    const now = Date.now();

    if (now <= start) return 0;
    if (now >= end) return 100;

    const progress = ((now - start) / (end - start)) * 100;
    return Math.round(progress);
};

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
    return <Icon className={"size-5 text-foreground"} />;
}

const getVisibilityElement = (visibility: Visibility): React.ReactNode => {
    const Icon = getVisibilityIcon(visibility);
    return (
        <div className={"p-0.5 rounded-full bg-background-200 w-fit"}>
            <Icon className={"size-4 md:size-5 text-foreground"} />
        </div>
    );
}

export default StoryDetailsPage;
