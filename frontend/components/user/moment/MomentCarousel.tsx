"use client"

import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog"
import { useMomentCarouselStore } from "@/store/moment/useMomentCarouselStore"
import React, {useCallback, useEffect, useRef, useState} from "react"
import { ChevronLeft } from "lucide-react"
import OMenuDot from "@/components/shared/icons/OMenuDot";
import OGrid from "@/components/shared/icons/OGrid";
import MomentCarouselItem from "@/components/user/moment/MomentCarouselItem";
import {useSwipe} from "@/hooks/useSwipe";
import {Moment} from "@/types/moment";
import Stars from "@/components/user/moment/icons/Stars";
import Image from "next/image";
import {useAudioPlayerStore} from "@/store/moment/useAudioPlayerStore";
import {useTranslation} from "next-i18next";
import {useAuthStore} from "@/store/useAuthStore";
import MomentReactionsCarouselDrawer from "@/components/user/moment/reaction/MomentReactionsCarouselDrawer";
import {useMomentReactionsCarouselDrawerStore} from "@/store/moment/useMomentReactionsCarouselStore";
import ReactionButtonMomentsCarousel from "@/components/user/moment/reaction/ReactionButtonMomentsCarousel";
import MomentCarouselActionsDrawer from "@/components/user/moment/MomentCarouselActionsDrawer";

export default function MomentCarousel() {
    const {t: u} = useTranslation("user");
    const user = useAuthStore((state) => state.user);
    const {
        open,
        closeCarousel,
        moments,
        storyId,
        title,
        currentIndex: curIndexStore,
        hasNext,
        onFetchMore,
    } = useMomentCarouselStore()

    const { triggerStop, resetStop } = useAudioPlayerStore();

    const openReactionsDrawer = useMomentReactionsCarouselDrawerStore((state) => state.openDrawer);

    const [actionsDrawerOpen, setActionsDrawerOpen] = useState(false);
    
    const slidesRef = useRef<HTMLDivElement>(null);

    const [currentIndex, setCurrentIndex] = useState(0);

    const currentMoment = moments[currentIndex];
    
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

    useEffect(() => {
        if (curIndexStore) setCurrentIndex(curIndexStore)
    }, [curIndexStore]);

    const scrollLockRef = useRef(false);
    const userActionRef = useRef(false);
    
    const scrollToSlide = useCallback((index: number, smooth = true) => {
        if (!slidesRef.current || !moments[index]) return;

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


        setCurrentIndex(index)
    }, [moments, resetStop, triggerStop]);

    useEffect(() => {
        if (curIndexStore) {
            setTimeout(() => {
                scrollToSlide(curIndexStore)
            }, 200)
        }
        // eslint-disable-next-line
    }, [curIndexStore]);

    const swipeHandlers = useSwipe(
        () => {
        },
        () => {
        },
        () => {
            if (currentIndex < moments.length - 1) scrollToSlide(currentIndex + 1);
            userActionRef.current = true;
        },
        () => {
            if (currentIndex > 0) scrollToSlide(currentIndex - 1);
            userActionRef.current = true;
        }
    );

    useEffect(() => {
        const handleResize = () => {
            scrollToSlide(currentIndex, false);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [currentIndex, scrollToSlide]);

    const isScrollingRef = useRef(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isScrollingRef.current) return;
            
            if (e.key === "ArrowDown" && currentIndex < moments.length - 1) {
                scrollToSlide(currentIndex + 1);
                isScrollingRef.current = true;
                userActionRef.current = true;
            } else if (e.key === "ArrowUp" && currentIndex > 0) {
                scrollToSlide(currentIndex - 1);
                isScrollingRef.current = true;
                userActionRef.current = true;
            }
        };

        const handleKeyUp = () => {
            isScrollingRef.current = false;
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [open, currentIndex, moments.length, scrollToSlide]);

    useEffect(() => {
        let accumulatedDelta = 0;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (isScrollingRef.current) return;

            accumulatedDelta += e.deltaY;

            if (currentIndex === 0 && accumulatedDelta < 0) accumulatedDelta = 0;
            if (currentIndex === moments.length - 1 && accumulatedDelta > 0) accumulatedDelta = 0;

            const threshold = 400;
            if (accumulatedDelta >= threshold && currentIndex < moments.length - 1) {
                isScrollingRef.current = true;
                userActionRef.current = true;
                accumulatedDelta = 0;
                scrollToSlide(currentIndex + 1);
                setTimeout(() => (isScrollingRef.current = false), 400);
            } else if (accumulatedDelta <= -threshold && currentIndex > 0) {
                isScrollingRef.current = true;
                userActionRef.current = true;
                accumulatedDelta = 0;
                scrollToSlide(currentIndex - 1);
                setTimeout(() => (isScrollingRef.current = false), 400);
            }
        };

        const attachListener = () => {
            const container = slidesRef.current;
            if (!container) return;
            container.addEventListener("wheel", handleWheel, { passive: false });
            clearInterval(interval);
        };

        const interval = setInterval(attachListener, 50);

        return () => {
            clearInterval(interval);
            // eslint-disable-next-line react-hooks/exhaustive-deps
            slidesRef.current?.removeEventListener("wheel", handleWheel);
        };
    }, [open, currentIndex, moments.length, scrollToSlide]);

    useEffect(() => {
        const loadThreshold = 4;
        if (currentIndex > moments.length - loadThreshold && hasNext && onFetchMore) {
            void onFetchMore();
        }
    }, [currentIndex, hasNext, moments.length, onFetchMore]);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && closeCarousel()}>
            <DialogContent className="w-full !border-none !ring-0 !outline-none shadow-none md:max-w-[550px] h-full !p-0 flex flex-col md:rounded-xl">
                <div className={"w-full ring-0 h-full relative overflow-hidden md:rounded-xl"}>
                    <div className={"w-full flex flex-row z-10 bg-background-100 absolute top-0 left-0 items-center h-14 px-2"}>
                        <DialogClose asChild>
                            <button className={"rounded-full ring-0 text-foreground-200 hover:text-foreground p-1 hover:bg-background-200"}>
                                <ChevronLeft className={"size-7"}/>
                            </button>
                        </DialogClose>
                        <DialogTitle className={"text-xl w-full font-medium text-center"}>
                            {title}
                        </DialogTitle>
                        <button className={"ring-0 p-1 rounded-full hover:bg-background-200"}>
                            <OMenuDot className={"size-7"}/>
                        </button>
                        <DialogDescription></DialogDescription>
                    </div>
                    <div className={"h-16 w-full z-10 absolute top-14 left-0 flex flex-row px-2 justify-between items-center"}>
                        <button
                            className={`flex items-center justify-center bg-background-200 w-10 h-10 shrink-0 rounded-full 
                            
                            `}
                        >
                            <OGrid className={"size-6"}/>
                        </button>
                        <button
                            className={`flex items-center justify-center bg-background-200 hover:bg-background-300 w-10 h-10 shrink-0 rounded-full 
                          
                            `}
                            onClick={() => setActionsDrawerOpen(true)}
                        >
                            <OMenuDot className={"size-8"}/>
                        </button>
                    </div>

                    <div
                        className="overflow-hidden ring-0 w-full h-full mt-0 md:max-w-[550px] overscroll-contain"
                        {...swipeHandlers}
                        ref={slidesRef}
                        style={{ height: "100%", width: "100%" }}
                    >
                        {moments.map((moment, index) => {
                            if (Math.abs(index - currentIndex) > 2) {
                                return (
                                    <section
                                        key={moment.id}
                                        className={"w-full h-full"}
                                        style={{ height: "100%", width: "100%" }}
                                    />
                                );
                            }
                            return (
                                <div
                                    key={moment.id}
                                    className={"w-full h-full"}
                                    style={{ height: "100%", width: "100%" }}
                                >
                                    <MomentCarouselItem moment={moment}/>
                                </div>
                            )
                        })}
                    </div>

                    {/*  Actions  */}
                    <div className={"h-16 w-full absolute bottom-0"}>
                        <div className={"flex flex-row items-center justify-center gap-2 px-2 h-full"}>
                            {delayedMoment?.user?.id === user?.id ? (
                                <button
                                    onClick={() =>
                                        (delayedMoment && delayedMoment?.totalReactions > 3)
                                            ? openReactionsDrawer({ momentId: delayedMoment.id })
                                            : openReactionsDrawer({ reactions: delayedMoment?.reactionPreviews })
                                    }
                                    disabled={isDelaying || !delayedMoment}
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
                                    <ReactionButtonMomentsCarousel isDelaying={isDelaying} currentMoment={currentMoment}/>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <MomentCarouselActionsDrawer
                    open={actionsDrawerOpen}
                    selectedMoment={currentMoment}
                    storyId={storyId}
                    closeDrawer={() => setActionsDrawerOpen(false)}
                />
                <MomentReactionsCarouselDrawer/>
            </DialogContent>
        </Dialog>
    )
}
