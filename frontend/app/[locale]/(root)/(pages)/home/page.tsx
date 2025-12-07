"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {useSwipe} from "@/hooks/useSwipe";
import OGrid from "@/components/shared/icons/OGrid";
import OMenuDot from "@/components/shared/icons/OMenuDot";
import {Moment, Story, StoryType} from "@/types/moment";
import VerticalSlide from "@/components/user/home/VerticalSlide";
import HorizontalSlide from "@/components/user/home/HorizontalSlide";
import {useHomeFeedsStore} from "@/store/useHomeFeedsStore";
import EmptyList from "@/components/shared/EmptyList";
import {useTranslation} from "next-i18next";
import {useMomentDrawerStore} from "@/store/moment/useMomentDrawerStore";
import {useSearchParams} from "next/navigation";
import {shallow} from "zustand/vanilla/shallow";
import ReactionButtonHome from "@/components/user/moment/reaction/ReactionButtonHome";
import VerticalSlideSkeleton from "@/components/user/home/VerticalSlideSkeleton";
import {useAuthStore} from "@/store/useAuthStore";
import Stars from "@/components/user/moment/icons/Stars";
import Image from "next/image";
import MomentReactionsDrawer from "@/components/user/moment/reaction/MomentReactionsDrawer";
import {useMomentReactionsDrawerStore} from "@/store/moment/useMomentReactionsDrawerStore";
import UsersDropdown from "@/components/user/home/UsersDropdown";
import PreventPullToRefresh from "@/components/shared/PreventPullToRefresh";
import {useAudioPlayerStore} from "@/store/moment/useAudioPlayerStore";
import MomentGridView from "@/components/user/moment/MomentGridView";
import {useStoryDrawerStore} from "@/store/story/useStoryDrawerStore";

export default function Home() {
    const {t: u} = useTranslation("user");
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get("targetUserId") ?? undefined;

    const slidesRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);

    const { triggerStop, resetStop } = useAudioPlayerStore();

    const user = useAuthStore((state) => state.user);

    const openReactionsDrawer = useMomentReactionsDrawerStore((state) => state.openDrawer);

    const {
        slides,
        currentSlideIndex,
        subSlideMap,
        slideHasFetchedOnce,
        isFetchingSlides,
        hasNextPage,
        fetchHomeSlides,
        fetchMoreSubSlides,
        setCurrentSlide,
        setSubSlideIndex,
        targetUserIdStore
    } = useHomeFeedsStore(
        state => ({
            slides: state.slides,
            currentSlideIndex: state.currentSlideIndex,
            subSlideMap: state.subSlideMap,
            slideHasFetchedOnce: state.slideHasFetchedOnce,
            isFetchingSlides: state.isFetchingSlides,
            hasNextPage: state.hasNextPage,
            fetchHomeSlides: state.fetchHomeSlides,
            fetchMoreSubSlides: state.fetchMoreSubSlides,
            setCurrentSlide: state.setCurrentSlide,
            setSubSlideIndex: state.setSubSlideIndex,
            targetUserIdStore: state.targetUserId,
        }),
        shallow
    );
    
    const currentSlide = slides[currentSlideIndex];
    const currentSubIndex = subSlideMap[currentSlide?.id] ?? 0;
    const currentMoment = currentSlide?.type === "vertical"
        ? currentSlide?.content as Moment
        : currentSlide?.subSlides?.[currentSubIndex] as Moment;

    const [delayedMoment, setDelayedMoment] = useState<Moment | null>(null);
    const [isDelaying, setIsDelaying] = useState(false);

    useEffect(() => {
        setIsDelaying(true);
        const timeout = setTimeout(() => {
            setDelayedMoment(currentMoment);
            setIsDelaying(false);
        }, 250);
        return () => clearTimeout(timeout);
    }, [currentMoment]);

    const {openDrawer: openMomentDrawer} = useMomentDrawerStore();

    const {openDrawer: openStoryDrawer} = useStoryDrawerStore();

    useEffect(() => {
        if (isFetchingSlides || (targetUserIdStore === targetUserId && slideHasFetchedOnce)) return;
        void fetchHomeSlides({size: 16, targetUserId: targetUserId, reset: true });
    }, [fetchHomeSlides, isFetchingSlides, slideHasFetchedOnce, slides.length, targetUserId, targetUserIdStore]);

    const headerHeight = 64;

    const userActionRef = useRef(false);
    const scrollLockRef = useRef(false);

    const scrollToSlide = useCallback((index: number, smooth = true) => {
        if (!slidesRef.current || !slides[index]) return;

        triggerStop();

        const container = slidesRef.current;
        const slideEl = container.children[index] as HTMLElement;

        const containerRect = container.getBoundingClientRect();
        const slideRect = slideEl.getBoundingClientRect();

        const topRelative = slideRect.top - containerRect.top + container.scrollTop;

        scrollLockRef.current = true;

        container.scrollTo({
            top: topRelative,
            behavior: smooth ? "smooth" : "instant",
        });

        setTimeout(() => {
            scrollLockRef.current = false;
            resetStop();
        }, smooth ? 400 : 0);


        setCurrentSlide(index);
    }, [resetStop, setCurrentSlide, slides, triggerStop]);


    const slide = slides[currentSlideIndex];
    const swipeHandlers = useSwipe(
        () => {
            if (slide?.type === "horizontal") {
                const currentSub = subSlideMap[slide.id] ?? 0;
                if (currentSub < (slide.subSlides?.length ?? 0) - 1) {
                    setSubSlideIndex(slide.id, currentSub + 1);
                }
            }
        },
        () => {
            if (slide?.type === "horizontal") {
                const currentSub = subSlideMap[slide.id] ?? 0;
                if (currentSub > 0) setSubSlideIndex(slide.id, currentSub - 1);
            }
        },
        () => {
            if (currentSlideIndex < slides.length - 1) scrollToSlide(currentSlideIndex + 1);
            userActionRef.current = true;
        },
        () => {
            if (currentSlideIndex > 0) scrollToSlide(currentSlideIndex - 1);
            userActionRef.current = true;
        }
    );

    const firstLoadVerticalRef = useRef(true);

    useEffect(() => {
        if (!firstLoadVerticalRef.current) return;
        scrollToSlide(currentSlideIndex, false);
        firstLoadVerticalRef.current = false;
    }, [scrollToSlide, currentSlideIndex]);

    useEffect(() => {
        const handleResize = () => {
            scrollToSlide(currentSlideIndex, false);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [currentSlideIndex, slides, subSlideMap, scrollToSlide]);


    // Arrow & wheel navigation
    useEffect(() => {
        let accumulatedDelta = 0;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (isScrollingRef.current) return;

            const slide = slides[currentSlideIndex];

            if (e.key === "ArrowDown" && currentSlideIndex < slides.length - 1) {
                scrollToSlide(currentSlideIndex + 1);
                isScrollingRef.current = true;
                userActionRef.current = true;
            } else if (e.key === "ArrowUp" && currentSlideIndex > 0) {
                scrollToSlide(currentSlideIndex - 1);
                isScrollingRef.current = true;
                userActionRef.current = true;
            }

            if (slide?.type === "horizontal") {
                const currentSub = subSlideMap[slide.id] ?? 0;

                if (e.key === "ArrowRight" && currentSub < (slide.subSlides!.length - 1)) {
                    setSubSlideIndex(slide.id, currentSub + 1);
                    isScrollingRef.current = true;
                } else if (e.key === "ArrowLeft" && currentSub > 0) {
                    setSubSlideIndex(slide.id, currentSub - 1);
                    isScrollingRef.current = true;
                }
            }
        };

        const handleKeyUp = () => {
            isScrollingRef.current = false;
        };


        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (isScrollingRef.current) return;

            accumulatedDelta += e.deltaY;

            if (currentSlideIndex === 0 && accumulatedDelta < 0) accumulatedDelta = 0;
            if (currentSlideIndex === slides.length - 1 && accumulatedDelta > 0) accumulatedDelta = 0;

            const threshold = 400;
            if (accumulatedDelta >= threshold && currentSlideIndex < slides.length - 1) {
                isScrollingRef.current = true;
                accumulatedDelta = 0;
                scrollToSlide(currentSlideIndex + 1);
                userActionRef.current = true;
                setTimeout(() => (isScrollingRef.current = false), 400);
            } else if (accumulatedDelta <= -threshold && currentSlideIndex > 0) {
                isScrollingRef.current = true;
                accumulatedDelta = 0;
                scrollToSlide(currentSlideIndex - 1);
                userActionRef.current = true;
                setTimeout(() => (isScrollingRef.current = false), 400);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        const container = slidesRef.current;
        container?.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            container?.removeEventListener("wheel", handleWheel);
        };
    }, [currentSlideIndex, scrollToSlide, setSubSlideIndex, slides, subSlideMap]);

    useEffect(() => {
        const loadThreshold = 4;
        if (hasNextPage && slides.length - currentSlideIndex <= loadThreshold && slideHasFetchedOnce && slides.length > loadThreshold) {
            void fetchHomeSlides({targetUserId: targetUserId, reset: false});
        }
    }, [currentSlideIndex, slides, hasNextPage, fetchHomeSlides, slideHasFetchedOnce, targetUserId]);


    const scrollSubSlide = useCallback((instant: boolean, subIndex: number) => {
        if (currentSlide.type !== "horizontal") return;
        if (currentSlide.type === "horizontal" && "type" in currentSlide.content && currentSlide.content.type === StoryType.BEFORE_AFTER) return;
        const container = slidesRef.current?.children[currentSlideIndex] as HTMLElement;
        const subSlidesContainer = container.querySelector(".subSlides") as HTMLElement;
        const subSlideEl = subSlidesContainer.children[subIndex] as HTMLElement;

        triggerStop();
        
        if (!subSlideEl) return;

        const paddingLeft = window.innerWidth >= 768 ? 8 : 0;

        subSlidesContainer.scrollTo({
            left: subSlideEl.offsetLeft - paddingLeft,
            behavior: instant ? "instant" : "smooth",
        });

        setTimeout(() => {
            resetStop();
        }, instant ? 0 : 300);
        
    }, [currentSlide?.content, currentSlide?.type, currentSlideIndex, resetStop, triggerStop]);

    const prevSlideIndexRef = useRef<number | null>(null);

    useEffect(() => {
        if (!slide) return;
        const currentSub = subSlideMap[slide.id] ?? 0;
        const instant = prevSlideIndexRef.current !== currentSlideIndex;

        scrollSubSlide(instant, currentSub);

        prevSlideIndexRef.current = currentSlideIndex;
    }, [currentSlideIndex, scrollSubSlide, slide, subSlideMap]);

    useEffect(() => {
        const handleResize = () => {
            const slide = slides[currentSlideIndex];
            if (slide?.type === "horizontal") {
                const currentSub = subSlideMap[slide.id] ?? 0;
                scrollSubSlide(true, currentSub);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [currentSlideIndex, slides, subSlideMap, scrollToSlide, scrollSubSlide]);

    useEffect(() => {
        const loadThreshold = 4;

        const slide = slides[currentSlideIndex];
        if (!slide || slide.type !== "horizontal" || !slide.subSlides) return;

        const currentSub = subSlideMap[slide.id] ?? 0;

        if (
            slide.subSlidesHasNext &&
            !slide.subSlidesLoading &&
            slide.subSlides.length - currentSub <= loadThreshold &&
            slide.subSlides.length >= loadThreshold
        ) {
            void fetchMoreSubSlides(slide.id);
        }
    }, [currentSlideIndex, slides, subSlideMap, fetchMoreSubSlides, scrollSubSlide]);


    useEffect(() => {
        if (userActionRef.current || scrollLockRef.current) {
            userActionRef.current = false;
            return;
        }

        scrollToSlide(currentSlideIndex, false);
    }, [currentSlideIndex, scrollToSlide]);

    const [open, setOpen] = useState(false);

    return (
        <PreventPullToRefresh disabled={open}>
        <div className={"h-full w-full md:max-w-[550px]"}>
            <div
                className={"absolute left-1/2 -translate-x-1/2 w-full md:max-w-[550px]  h-16 bg-transparent  z-50 flex items-center justify-center"}
            >
                <div
                    className={"flex h-full items-center md:max-w-[550px] flex-row px-2 gap-3 text-foreground"}
                    style={{ width: "min(100%, 100vh - 212px)" }}
                >
                    <button
                        disabled={isFetchingSlides}
                        className={`flex items-center justify-center bg-background-200 w-10 h-10 shrink-0 rounded-full ${isFetchingSlides && "cursor-wait"}`}
                        onClick={() => setOpen(true)}
                    >
                        <OGrid className={"size-6"}/>
                    </button>
                    <UsersDropdown/>
                    <button
                        disabled={isFetchingSlides}
                        className={`flex items-center justify-center bg-background-200 hover:bg-background-300 w-10 h-10 shrink-0 rounded-full 
                            ${isFetchingSlides && "cursor-wait"}
                        `}
                        onClick={() => {
                            if (!currentSlide) return;
                            if (currentSlide.type === "vertical") {
                                openMomentDrawer(currentSlide.content as Moment, undefined);
                            } else {
                                openStoryDrawer(currentSlide.content as Story, undefined);
                            }
                        }}
                    >
                        <OMenuDot className={"size-8"}/>
                    </button>
                </div>
            </div>

            {/* Actions */}
            {slideHasFetchedOnce && slides.length > 0 && (
                <div
                    className={"fixed bottom-16 md:bottom-0 left-1/2 -translate-x-1/2 w-full md:max-w-[550px] h-16 gap-2 bg-transparent z-50 flex items-center justify-center"}
                >
                    <div
                        className={`flex flex-row bg-transparent md:max-w-[550px] px-2 items-center justify-center h-full gap-2
                                ${currentSlide?.type === "horizontal" ? "px-2": "px-2"}
                    `}
                        style={{ width: "min(100%, 100dvh - 212px)" }}
                    >
                        {delayedMoment?.user?.id === user?.id ? (
                            <button
                                onClick={() =>
                                    (delayedMoment && delayedMoment?.totalReactions > 3)
                                        ? openReactionsDrawer({ momentId: delayedMoment.id })
                                        : openReactionsDrawer({ reactions: delayedMoment?.reactionPreviews })
                                }
                                disabled={isDelaying}
                                className={"w-fit px-2 flex flex-row items-center gap-3 bg-background-300 h-10 rounded-full"}
                            >
                                <div className={"flex flex-row gap-1 items-center"}>
                                    <Stars className={"size-6"}/>
                                    <p className={"text-base font-medium"}>
                                        {(delayedMoment && delayedMoment?.reactionPreviews?.length > 0)
                                            ? u("home.actions.default")
                                            : u("home.actions.none")
                                        }
                                    </p>
                                </div>
                                <div className={"flex flex-row gap-1 items-center"}>
                                    {delayedMoment?.reactionPreviews?.slice(0, 3).map((reaction) =>  (
                                            <div
                                                key={reaction.user.id}
                                                className={"w-7 h-7 relative rounded-full bg-foreground-200"}
                                            >
                                                <Image
                                                    src={reaction.user.avatarUrl ?? "/assets/images/avatar.png"}
                                                    alt={reaction.user.displayName}
                                                    fill
                                                    sizes={"28px"}
                                                    className={"rounded-full"}
                                                />
                                            </div>
                                        )
                                    )}
                                    {delayedMoment && delayedMoment?.totalReactions > 3 && (
                                        <div
                                            className={"w-7 h-7 relative text-sm font-medium flex items-center justify-center rounded-full bg-background-m"}
                                        >
                                            +{delayedMoment?.totalReactions - 3}
                                        </div>
                                    )}

                                </div>
                            </button>
                        ) : (
                            <>
                                <button
                                    className={"w-full bg-background-300 text-left px-3 h-10 border-none rounded-full"}
                                >
                                    Send message...
                                </button>
                                <ReactionButtonHome isDelaying={isDelaying}/>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Main slides */}
            <main
                className="flex-1 flex justify-center overflow-y-hidden"
                style={{ height: `calc(100dvh - ${headerHeight}px)` }}
            >
                <div
                    className="overflow-hidden mt-0 md:max-w-[550px] overscroll-contain"
                    {...swipeHandlers}
                    ref={slidesRef}
                    style={{
                        width: "min(100%, 100dvh - 196px)",
                        height: `calc(100dvh - ${headerHeight}px)`,
                    }}
                >
                    {!slideHasFetchedOnce && isFetchingSlides
                        ? (
                            <div
                                className={"w-full"}
                                style={{ height: `calc(100dvh - ${headerHeight}px)`, width: "100%" }}
                            >
                                <VerticalSlideSkeleton/>
                            </div>
                        ) : (
                            <>
                                {slideHasFetchedOnce && slides.length === 0
                                    ? (
                                        <div
                                            className={"w-full flex items-center justify-center"}
                                            style={{ height: `calc(100dvh - ${headerHeight}px)`, width: "100%" }}
                                        >
                                            <EmptyList message={u("home.empty")}/>
                                        </div>
                                    ) : (
                                        <>
                                            {slides.map((slide, index) => {
                                                if (currentSlide.type === "vertical" ? Math.abs(currentSlideIndex - index) > 2 : Math.abs(currentSlideIndex - index) > 1) {
                                                    return (
                                                        <section
                                                            key={slide.id}
                                                            className={"w-full h-full"}
                                                            style={{ height: "100%", width: "100%" }}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <div
                                                        key={slide.id}
                                                        className={"w-full"}
                                                        style={{ height: `calc(100dvh - ${headerHeight}px)`, width: "100%" }}
                                                    >
                                                        {slide.type === "vertical" ? (() => {
                                                            const moment = slide.content as Moment;
                                                            return (
                                                                <VerticalSlide moment={moment}/>
                                                            );
                                                        })() : (
                                                            <HorizontalSlide
                                                                slide={slide }
                                                                currentSub={subSlideMap[slide.id] ?? 0}
                                                                currentSlideId={currentSlide.id}
                                                            />
                                                        )}
                                                    </div>
                                                )
                                                }
                                            )}
                                        </>
                                    )
                                }
                            </>
                        )
                    }
                </div>

            </main>
            <MomentReactionsDrawer/>
        </div>
            <MomentGridView open={open} onClose={() => setOpen(false)}/>
        </PreventPullToRefresh>
    );
}
