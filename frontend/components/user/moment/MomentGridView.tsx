import {Dialog, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {ChevronLeft} from "lucide-react";
import OMenuDot from "@/components/shared/icons/OMenuDot";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useHomeFeedsStore} from "@/store/useHomeFeedsStore";
import {shallow} from "zustand/vanilla/shallow";
import {useTranslation} from "next-i18next";
import UsersDropdown from "@/components/user/home/UsersDropdown";
import EmptyList from "@/components/shared/EmptyList";
import {Skeleton} from "@/components/ui/skeleton";
import MomentImageGridItem from "@/components/user/moment/MomentImageGridItem";
import {Moment, Story} from "@/types/moment";

interface Props {
    open: boolean;
    onClose: () => void;
}

const MomentGridView = ({open, onClose}: Props) => {
    const {t: u} = useTranslation("user");

    const {
        slides,
        currentSlideIndex,
        slideHasFetchedOnce,
        isFetchingSlides,
        hasNextPage,
        fetchHomeSlides,
        setCurrentSlide,
        targetUserId
    } = useHomeFeedsStore(
        state => ({
            slides: state.slides,
            currentSlideIndex: state.currentSlideIndex,
            slideHasFetchedOnce: state.slideHasFetchedOnce,
            isFetchingSlides: state.isFetchingSlides,
            hasNextPage: state.hasNextPage,
            fetchHomeSlides: state.fetchHomeSlides,
            setCurrentSlide: state.setCurrentSlide,
            targetUserId: state.targetUserId,
        }),
        shallow
    );

    const scrollRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [itemSize, setItemSize] = useState<number>(0);

    useEffect(() => {
        if (!open) return;

        const timeoutId = setTimeout(() => {
            if (!gridRef.current) return;

            const observer = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (!entry) return;
                const width = entry.contentRect.width;
                const gap = 4;
                const colCount = 3;
                const padding = 2;
                const size = (width - gap * (colCount - 1) - padding * 2) / colCount;
                setItemSize(size);
            });

            observer.observe(gridRef.current);

            // cleanup
            return () => {
                observer.disconnect();
            };
        }, 5);

        return () => clearTimeout(timeoutId);
    }, [open]);


    const handleScroll = useCallback(() => {
        if (isFetchingSlides || !hasNextPage) return
        const el = scrollRef.current;
        if (!el || isFetchingSlides) return;
        const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
        if (nearBottom) {
            void fetchHomeSlides({targetUserId, reset: false});
        }
    }, [isFetchingSlides, hasNextPage, fetchHomeSlides, targetUserId]);

    useEffect(() => {
        if (!open || currentSlideIndex == null) return;

        const tryScroll = () => {
            const grid = gridRef.current;
            const scrollEl = scrollRef.current;
            if (!grid || !scrollEl) return;
            const target = grid.children[currentSlideIndex] as HTMLElement;
            if (!target) return;

            scrollEl.scrollTop = target.offsetTop - scrollEl.clientHeight / 2 + target.clientHeight / 2;
        };

        const timeout = setTimeout(tryScroll, 150);

        return () => clearTimeout(timeout);
    }, [currentSlideIndex, open]);

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="w-full !border-none !ring-0 !outline-none shadow-none md:max-w-[550px] h-full !p-0 flex flex-col md:rounded-xl">
                <DialogTitle className={"hidden"}></DialogTitle>
                <DialogDescription className={"hidden"}></DialogDescription>
                <div className={"w-full h-full relative overflow-hidden"}>
                    <div
                        className={"absolute w-full h-16 bg-transparent z-50 flex items-center justify-center"}
                    >
                        <div
                            className={"flex h-full w-full items-center flex-row px-2 gap-3 text-foreground"}
                        >
                            <button
                                disabled={isFetchingSlides}
                                className={`flex items-center justify-center bg-background-200 w-10 h-10 shrink-0 rounded-full ${isFetchingSlides && "cursor-wait"}`}
                                onClick={() => onClose()}
                            >
                                <ChevronLeft className={"size-6"}/>
                            </button>
                            <UsersDropdown disabled={true}/>
                            <button
                                className={"flex items-center justify-center bg-background-200 hover:bg-background-300 w-10 h-10 shrink-0 rounded-full"}
                            >
                                <OMenuDot className={"size-8"}/>
                            </button>
                        </div>
                    </div>
                    <div
                        className="w-full h-full pt-16"
                    >
                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className={"w-full h-full z-10  overflow-y-auto px-2 custom-scrollbar"}
                        >
                            {slides.length === 0 && slideHasFetchedOnce
                                ? (
                                    <EmptyList message={u("home.empty")}/>
                                ) : (
                                    <div ref={gridRef} className="grid grid-cols-3 gap-1 pt-2 pb-2">
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
                                                                onClose();
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
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default MomentGridView;