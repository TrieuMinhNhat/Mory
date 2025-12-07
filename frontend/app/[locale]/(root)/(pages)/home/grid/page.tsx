"use client"

import {ChevronLeft} from "lucide-react";
import OMenuDot from "@/components/shared/icons/OMenuDot";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useHomeFeedsStore} from "@/store/useHomeFeedsStore";
import {shallow} from "zustand/vanilla/shallow";
import EmptyList from "@/components/shared/EmptyList";
import {Skeleton} from "@/components/ui/skeleton";
import MomentImageGridItem from "@/components/user/moment/MomentImageGridItem";
import {useTranslation} from "next-i18next";
import {Moment, Story} from "@/types/moment";
import {ROUTES} from "@/constants/routes";
import UsersDropdown from "@/components/user/home/UsersDropdown";

const SCROLL_THRESHOLD = 100;

const HomeGridPage = () => {
    const router = useRouter();
    const {t: u} = useTranslation("user");
    
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get("targetUserId") ?? undefined;

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
    }, []);

    const {
        slides,
        currentSlideIndex,
        slideHasFetchedOnce,
        isFetchingSlides,
        hasNextPage,
        fetchHomeSlides,
        setCurrentSlide,
        targetUserIdStore
    } = useHomeFeedsStore(
        state => ({
            slides: state.slides,
            currentSlideIndex: state.currentSlideIndex,
            slideHasFetchedOnce: state.slideHasFetchedOnce,
            isFetchingSlides: state.isFetchingSlides,
            hasNextPage: state.hasNextPage,
            fetchHomeSlides: state.fetchHomeSlides,
            setCurrentSlide: state.setCurrentSlide,
            targetUserIdStore: state.targetUserId,
        }),
        shallow
    );

    useEffect(() => {
        if (targetUserIdStore === targetUserId && slides.length > 0) return;
        void fetchHomeSlides({ targetUserId: targetUserId, size: 15, reset: true });
    }, [fetchHomeSlides, slides.length, targetUserId, targetUserIdStore]);

    const handleScrollMoments = useCallback(() => {
        if (isFetchingSlides) return;

        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        const isNearEnd = scrollTop + viewportHeight >= fullHeight - SCROLL_THRESHOLD;

        if (isNearEnd && hasNextPage) {
            void fetchHomeSlides({targetUserId: targetUserId, reset: false});
            console.log("Load more slide");
        }
    }, [fetchHomeSlides, hasNextPage, isFetchingSlides, targetUserId]);

    useEffect(() => {
        window.addEventListener("scroll", handleScrollMoments, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScrollMoments);
        };
    }, [handleScrollMoments]);

    useEffect(() => {
        if (!gridRef.current) return;
        if (currentSlideIndex == null || currentSlideIndex < 0) return;
        const grid = gridRef.current;
        const timeout = setTimeout(() => {
            const slideElement = grid.children[currentSlideIndex] as HTMLElement | undefined;
            if (slideElement) {
                const rect = slideElement.getBoundingClientRect();
                const scrollTop = window.scrollY + rect.top - 128;
                window.scrollTo({ top: scrollTop, behavior: "instant" });
            }
        }, 50);

        return () => clearTimeout(timeout);
    }, [currentSlideIndex]);


    return (
        <div className={"flex flex-col h-fit w-full md:max-w-[550px]"}>
            <div
                className={"fixed left-1/2 -translate-x-1/2 w-full md:max-w-[550px]  h-16 bg-transparent  z-50 flex items-center justify-center"}
            >
                <div
                    className={"flex h-full items-center md:max-w-[550px] flex-row px-2 gap-3 text-foreground"}
                    style={{ width: "min(100%, 100vh - 212px)" }}
                >
                    <button
                        disabled={isFetchingSlides}
                        className={`flex items-center justify-center bg-background-200 w-10 h-10 shrink-0 rounded-full ${isFetchingSlides && "cursor-wait"}`}
                        onClick={() => router.push(`${ROUTES.HOME}?${searchParams.toString()}`)}
                    >
                        <ChevronLeft className={"size-6"}/>
                    </button>
                    <UsersDropdown/>
                    <button
                        className={"flex items-center justify-center bg-background-200 hover:bg-background-300 w-10 h-10 shrink-0 rounded-full"}
                    >
                        <OMenuDot className={"size-8"}/>
                    </button>
                </div>
            </div>
            <div className={"w-full pt-16 px-2"}>
                {slides.length === 0 && slideHasFetchedOnce
                    ? (
                        <EmptyList message={u("home.empty")}/>
                    ) : (
                        <div ref={gridRef} className="grid grid-cols-3 gap-1 pb-20 md:pb-2">
                            {!slideHasFetchedOnce && isFetchingSlides ? (
                                Array.from({ length: 9 }).map((_, i) => (
                                    <Skeleton key={i} className={"w-full aspect-square rounded-xl"}/>
                                ))
                            ) : (
                                <>
                                    {slides.map((s, index) => (
                                        <div
                                            key={s.id}
                                            className={"relative rounded-xl"}
                                            style={{
                                                width: itemSize,
                                                height: itemSize,
                                            }}
                                        >
                                            <MomentImageGridItem
                                                moment={s.type === "vertical" ? (s.content as Moment) : (s.subSlides && s.subSlides[0])}
                                                story={s.type === "horizontal" ? s.content as Story : undefined}
                                                onClick={() => {
                                                    setCurrentSlide(index);
                                                    router.push(`${ROUTES.HOME}?${searchParams.toString()}`);
                                                }}
                                                inHomepage={true}
                                                showCurrentRing={currentSlideIndex === index}
                                                showHoverRing={true}
                                                size={itemSize}
                                            />
                                        </div>
                                    ))}
                                    {isFetchingSlides && hasNextPage && (
                                        <>
                                            {Array.from(
                                                { length: (3 - (slides.length % 3)) % 3 || 3 },
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
                    )}
            </div>
        </div>
    )
}

export default HomeGridPage;