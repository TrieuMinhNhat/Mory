"use client";

import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {Story, StoryScope, StoryType, Visibility} from "@/types/moment";
import Image from "next/image";
import {timeAgo} from "@/utils/time";
import {useTranslation} from "next-i18next";
import {Slide} from "@/store/useHomeFeedsStore";
import OMenuDot from "@/components/shared/icons/OMenuDot";
import {getStoryTypeIcon} from "@/utils/story";
import {ReactCompareSlider, ReactCompareSliderHandle, ReactCompareSliderImage} from "react-compare-slider";
import {getVisibilityIcon} from "@/utils/moment";
import {getStatusElement} from "@/components/user/story/StoryCard";
import {useMomentDrawerStore} from "@/store/moment/useMomentDrawerStore";
import {useAuthStore} from "@/store/useAuthStore";
import AudioPlayer from "@/components/user/moment/AudioPlayer";
import {useAudioPlayerStore} from "@/store/moment/useAudioPlayerStore";
import StoryAvatars from "@/components/user/story/StoryAvatars";
import MilestoneFilled from "@/components/user/moment/icons/MilestoneFilled";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/constants/routes";
import {useStoryDetailsStore} from "@/store/story/useStoryDetailsStore";

interface HorizontalSlideRenderProps {
    slide: Slide;
    currentSub: number;
    currentSlideId?: string
}

const HorizontalSlideRender = ({slide, currentSub, currentSlideId} : HorizontalSlideRenderProps) => {
    const {t: u} = useTranslation("user");
    const story = slide.content as Story;

    const router = useRouter();

    const setStory = useStoryDetailsStore((s) => s.setStory)

    const user = useAuthStore((state) => state.user);

    const { triggerStop, resetStop } = useAudioPlayerStore();

    const openDrawer = useMomentDrawerStore((state) => state.openDrawer);

    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState(0);

    const [isBefore, setIsBefore] = useState(true);

    const handlePositionChange = React.useCallback((pos: number) => {
        if (isBefore && pos > 80) {
            setIsBefore(false);
            triggerStop();
            setTimeout(() => resetStop(), 20);
        } else if (!isBefore && pos < 20) {
            setIsBefore(true);
            triggerStop();
            setTimeout(() => resetStop(), 20);
        }
    }, [isBefore, resetStop, triggerStop]);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver(([entry]: ResizeObserverEntry[]) => {
            const { width, height } = entry.contentRect;
            setSize(Math.min(width, height));
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const totalMoments = slide.subSlides?.length || 0;

    const [showDots, setShowDots] = useState(true);
    const hideTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setShowDots(true);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        hideTimeout.current = setTimeout(() => setShowDots(false), 1000);
    }, [currentSub]);


    const spanRefs = useRef<Record<string, HTMLSpanElement | null>>({});
    const [captionWidths, setCaptionWidths] = useState<Record<string, number>>({});

    useLayoutEffect(() => {
        slide.subSlides?.forEach(sub => {
            const span = spanRefs.current[sub.id];
            if (!span || !ref.current) return;

            const rect = span.getBoundingClientRect();
            const outerWidth = ref.current.getBoundingClientRect().width;

            const padding = 24;
            const newWidth = Math.min(Math.max(rect.width + padding, 0), outerWidth - 44);

            setCaptionWidths(prev => ({
                ...prev,
                [sub.id]: newWidth
            }));
        });
    }, [size, isBefore, slide.subSlides]);

    return (
        <div className={"w-full h-full pt-16 relative"}>
            <div className={"h-full w-full bg-background-200 pt-4 pb-32 md:pb-16 rounded-xl flex flex-col"}>
                <button
                    className={"mx-auto w-fit h-fit flex flex-row items-center gap-2"}
                    onClick={() => {
                        setStory(story);
                        router.push(ROUTES.STORY.DETAILS(story.id));
                    }}
                >
                    <StoryAvatars story={story}/>
                    <div className={"flex flex-col gap-1 h-fit"}>
                        <div className={"flex flex-row gap-1 items-center text-foreground"}>
                            <h3 className={"text-base font-semibold"}>{story.title}</h3>
                            <div className={"shrink-0"}>
                                {getVisibilityElement(story.visibility)}
                            </div>
                        </div>
                        <div className={"flex flex-row items-center gap-1"}>
                            <div className={"flex flex-row gap-1"}>
                                {getStatusElement(story, u)}
                                {getStoryTypeElement(story.type, story.duration)}
                            </div>
                        </div>
                    </div>
                </button>
                {story.type === StoryType.BEFORE_AFTER ? (
                    <div className={"w-full h-full flex overflow-hidden mt-2"}>
                        <div
                            ref={ref}
                            className="w-full flex-shrink-0 items-center justify-center flex relative"
                        >
                            <div style={{ width: size, height: size }} className="m-auto items-center relative">
                                {slide.subSlides?.length === 1 ? (
                                    <>
                                        <Image
                                            src={slide.subSlides[0]?.mediaUrl ?? "/assets/images/avatar.png"}
                                            alt="avatar"
                                            className="object-cover rounded-2xl"
                                            fill
                                            priority
                                            sizes={`${size}px`}
                                        />
                                        {slide.subSlides[0].audioUrl && (
                                            <div className={"absolute bottom-2 w-full px-4"}>
                                                <AudioPlayer src={slide.subSlides[0].audioUrl}/>
                                            </div>
                                        )}
                                        {slide.subSlides?.[0] && slide.subSlides[0].caption && !slide.subSlides[0].audioUrl && (
                                            <Caption
                                                text={slide.subSlides[0].caption}
                                                width={captionWidths[slide.subSlides[0].id]}
                                                setRef={(el) => {
                                                    const id = slide.subSlides?.[0]?.id
                                                    if (id) spanRefs.current[id] = el;
                                                }}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {slide.subSlides?.length === 2 && slide.subSlides[0]?.mediaUrl && slide?.subSlides[1]?.mediaUrl && (
                                            <ReactCompareSlider
                                                onPositionChange={handlePositionChange}
                                                itemOne={<ReactCompareSliderImage src={slide?.subSlides[0]?.mediaUrl} alt={"Before"} className={"object-cover rounded-2xl"}/>}
                                                itemTwo={<ReactCompareSliderImage src={slide?.subSlides[1]?.mediaUrl} alt={"After"} className={"object-cover rounded-2xl"}/>}
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
                                        )}
                                        {slide.subSlides?.length === 2 && slide.subSlides[0]?.mediaUrl && slide?.subSlides[1]?.mediaUrl && (
                                            <>
                                                {isBefore ? (
                                                    <>
                                                        {slide.subSlides[0].audioUrl && (
                                                            <div className={"absolute bottom-2 w-full px-4"}>
                                                                <AudioPlayer src={slide.subSlides[0].audioUrl}/>
                                                            </div>
                                                        )}
                                                        {(slide.subSlides[0].caption && !slide.subSlides[0].audioUrl) && (
                                                            <Caption
                                                                text={slide.subSlides[0].caption}
                                                                width={captionWidths[slide.subSlides[0].id]}
                                                                setRef={(el) => {
                                                                    const id = slide.subSlides?.[0]?.id
                                                                    if (id) spanRefs.current[id] = el;
                                                                }}
                                                            />
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {slide.subSlides[1].audioUrl && (
                                                            <div className={"absolute bottom-2 w-full px-4"}>
                                                                <AudioPlayer src={slide.subSlides[1].audioUrl}/>
                                                            </div>
                                                        )}
                                                        {(slide.subSlides[1].caption && !slide.subSlides[1].audioUrl) && (
                                                            <Caption
                                                                text={slide.subSlides[1].caption}
                                                                width={captionWidths[slide.subSlides[1].id]}
                                                                setRef={(el) => {
                                                                    const id = slide.subSlides?.[1]?.id
                                                                    if (id) spanRefs.current[id] = el;
                                                                }}
                                                            />
                                                        )}
                                                    </>
                                                )}

                                            </>
                                        )}
                                    </>
                                )}

                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="subSlides mt-2 gap-x-4 flex md:px-2 overflow-hidden w-full h-full">
                        {slide.subSlides?.map((sub, i) => {
                            if (currentSlideId === slide.id ? Math.abs(i - currentSub) > 2 : Math.abs(i - currentSub) > 0) {
                                return <div key={sub.id} className="flex-shrink-0 w-full flex" />;
                            }
                            return (
                                <div
                                    key={sub.id}
                                    ref={ref}
                                    className="flex-shrink-0 w-full items-center justify-center flex relative"
                                >
                                    {size > 0 && (
                                        <div style={{ width: size, height: size }} className="m-auto items-center relative">
                                            <div className={"absolute top-1 left-1 gap-1 flex flex-row z-10"}>
                                                {story.scope === StoryScope.GROUP && (
                                                    <button
                                                        onClick={() => {
                                                            if (user?.id === sub.user.id) {
                                                                router.push(ROUTES.PROFILE.ME.ROOT)
                                                                return;
                                                            }
                                                            router.push(ROUTES.PROFILE.ROOT(sub.user.id));
                                                        }}
                                                        className="relative w-12 h-12 rounded-full border-2 border-bg-dark-100/50 border-opacity-80"
                                                    >
                                                        <Image
                                                            src={sub.user.avatarUrl ?? "/assets/images/avatar.png"}
                                                            alt={sub.user.displayName}
                                                            className="object-cover rounded-full"
                                                            fill
                                                            sizes={"48px"}
                                                        />
                                                    </button>
                                                )}
                                                <div className={"bg-bg-dark-100 bg-opacity-50 h-fit py-1 gap-1 px-2 rounded-full flex flex-row"}>
                                                    <button
                                                        className={"w-fit h-fit"}
                                                        onClick={() => {
                                                            if (user?.id === sub.user.id) {
                                                                router.push(ROUTES.PROFILE.ME.ROOT)
                                                                return;
                                                            }
                                                            router.push(ROUTES.PROFILE.ROOT(sub.user.id));
                                                        }}
                                                    >
                                                        <h2 className={"font-medium text-fg-light-100"}>
                                                            {user?.id === sub.user.id ? u("home.you") : sub.user.displayName}
                                                        </h2>
                                                    </button>
                                                    <span className={"font-medium text-fg-light-200"}>
                                                        {(() => {
                                                            const { key, count } = timeAgo(sub?.createdAt);
                                                            return count ? u(key, { count }) : u(key);
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={"absolute top-1 right-1 gap-1 w-8 h-8 flex rounded-full z-10"}>
                                                <button
                                                    className={"w-8 h-8 flex items-center text-fg-light-100 bg-bg-dark-100 bg-opacity-50 hover:bg-opacity-70 rounded-full justify-center"}
                                                    onClick={() => openDrawer(sub, slide.content.id)}
                                                >
                                                    <OMenuDot className={"size-6"}/>
                                                </button>
                                            </div>

                                            <Image
                                                src={sub.mediaUrl ?? "/assets/images/avatar.png"}
                                                alt="avatar"
                                                className="object-cover rounded-2xl"
                                                fill
                                                priority
                                                sizes={`${size}px`}
                                            />
                                            {sub.milestone && (
                                                <div
                                                    className={"absolute top-1 size-10 right-10 flex items-center justify-center rounded-full text-fg-light-100 bg-bg-dark-100 bg-opacity-50"}
                                                >
                                                    <MilestoneFilled className={"size-6"}/>
                                                </div>
                                            )}
                                            {sub.audioUrl && (
                                                <div className={"absolute bottom-2 w-full px-4"}>
                                                    <AudioPlayer src={sub.audioUrl}/>
                                                </div>
                                            )}
                                            {(sub.caption && !sub.audioUrl) && (
                                                <Caption
                                                    text={sub.caption}
                                                    width={captionWidths[sub.id]}
                                                    setRef={(el) => (spanRefs.current[sub.id] = el)}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {story.type !== StoryType.BEFORE_AFTER && (
                <div
                    className={`absolute bottom-1/2 left-1/2 -translate-x-1/2 h-4 rounded-full bg-bg-dark-100 bg-opacity-30 flex overflow-hidden z-20
                transition-all duration-500 ${showDots ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"}`}
                    style={{
                        width: `${Math.min(totalMoments, 5) * 16}px`,
                    }}
                >
                    <div
                        className="flex transition-transform duration-300"
                        style={{
                            transform: `translateX(${
                                (() => {
                                    const maxVisible = 5;
                                    if (totalMoments <= maxVisible) return 0;

                                    const halfVisible = Math.floor(maxVisible / 2);
                                    const maxShift = totalMoments - maxVisible;
                                    let shift = currentSub - halfVisible;

                                    if (shift < 0) shift = 0;
                                    if (shift > maxShift) shift = maxShift;

                                    return -shift;
                                })()
                            }rem)`,
                        }}
                    >
                        {Array.from({ length: totalMoments }).map((_, i) => {
                            const maxVisible = 5;
                            let scale: number;
                            let opacity: number;

                            if (totalMoments <= maxVisible) {
                                if (i === currentSub) {
                                    scale = 1;
                                    opacity = 1;
                                } else {
                                    const diff = Math.abs(i - currentSub);
                                    scale = 1 - Math.min(diff * 0.25, 0.5);
                                    opacity = 1 - Math.min(diff * 0.4, 0.6);
                                }
                            } else {
                                const halfVisible = Math.floor(maxVisible / 2);
                                const start = Math.max(0, Math.min(currentSub - halfVisible, totalMoments - maxVisible));
                                const end = start + maxVisible - 1;

                                if (i < start || i > end) {
                                    scale = 0.6;
                                    opacity = 0;
                                } else {
                                    if (i === currentSub) {
                                        scale = 1;
                                        opacity = 1;
                                    } else {
                                        const diff = Math.abs(i - currentSub);
                                        scale = 1 - Math.min(diff * 0.25, 0.5);
                                        opacity = 1 - Math.min(diff * 0.4, 0.6);
                                    }
                                }
                            }

                            return (
                                <div
                                    key={i}
                                    className={"w-4 h-4 flex items-center justify-center"}
                                >
                                    <div
                                        style={{
                                            transform: `scale(${scale})`,
                                            opacity,
                                            transition: "all 0.3s ease",
                                        }}
                                        className={`w-2 h-2 rounded-full ${i === currentSub ? "bg-fg-light-100" : "bg-fg-light-100"}`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

        </div>
    );
};

const Caption = ({text, width, setRef}: {
    text: string, width?: number, setRef: (el: HTMLSpanElement | null) => void
}) => (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full px-4">
        <div
            className="relative mx-auto flex items-center justify-center"
            style={{ width: `${width ?? 150}px` }}
        >
            <div className="inline-block bg-bg-dark-100 bg-opacity-50 rounded-2xl px-3 py-2 font-medium text-base leading-5 text-fg-light-100 text-center break-all whitespace-pre-wrap overflow-hidden">
                {text}
            </div>
            <span
                ref={setRef}
                className="absolute invisible px-3 text-base font-sans font-medium whitespace-pre"
            >
                {text}
            </span>
        </div>
    </div>
);

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



export default HorizontalSlideRender;
