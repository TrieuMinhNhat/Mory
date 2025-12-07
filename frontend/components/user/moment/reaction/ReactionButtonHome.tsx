"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ReactionPlus from "@/components/user/moment/icons/ReactionPlus";
import {Moment, ReactionType, Story} from "@/types/moment";
import { getReactionEmoji } from "@/utils/moment";
import { useHomeFeedsStore } from "@/store/useHomeFeedsStore";
import { shallow } from "zustand/vanilla/shallow";
import { useMomentStore } from "@/store/moment/useMomentStore";
import { useDebouncedCallback } from "use-debounce";

interface ReactionButtonProps {
    isDelaying?: boolean;
}

const ReactionButtonHome = ({isDelaying}: ReactionButtonProps) => {
    const { slides, currentSlideIndex, subSlideMap } = useHomeFeedsStore(
        (state) => ({
            slides: state.slides,
            currentSlideIndex: state.currentSlideIndex,
            subSlideMap: state.subSlideMap,
        }),
        shallow
    );

    const toggleReaction = useMomentStore((state) => state.toggleReaction);

    const currentMoment = useMemo(() => {
        const slide = slides[currentSlideIndex];
        if (!slide) return null;
        if (slide.type === "vertical") return slide.content as Moment;

        const currentSubIndex = subSlideMap[slide.id] ?? 0;
        return slide.subSlides?.[currentSubIndex] as Moment;
    }, [slides, currentSlideIndex, subSlideMap]);
    
    const currentStory = useMemo(() => {
        const slide = slides[currentSlideIndex];
        if (!slide) return null;
        if (slide.type === "vertical") return null;
        if (slide.type === "horizontal") return slide.content as Story;
    }, [currentSlideIndex, slides])

    const currentReaction = currentMoment?.myReaction ?? null;

    const debouncedToggleReaction = useDebouncedCallback(
        async (momentId: string, reactionType: ReactionType | null, currentReaction: ReactionType | null) => {
            if (reactionType === currentReaction) return;
            if (!reactionType) {
                if (!currentReaction) return;
                reactionType = currentReaction;
            }
            const result = await toggleReaction(momentId, reactionType, currentStory?.id);
            if (result.success) {
                setDisplayedReaction(result.data as ReactionType);
            } else {
                if (currentMoment?.myReaction) setDisplayedReaction(currentMoment?.myReaction);
            }
        },
        2000
    );

    useEffect(() => {
        debouncedToggleReaction.flush();
    }, [currentMoment?.id, debouncedToggleReaction]);

    useEffect(() => {
        const delay = setTimeout(() => {
            setDisplayedReaction(currentMoment?.myReaction ?? null);
        }, 250);
        return () => clearTimeout(delay);
    }, [currentMoment?.id, currentMoment?.myReaction]);

    const [showReactions, setShowReactions] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [displayedReaction, setDisplayedReaction] = useState<ReactionType | null>(currentReaction);

    const handleMouseEnter = () => setShowReactions(true);
    const handleMouseLeave = () => setShowReactions(false);

    const handleTouchStart = () => {
        timeoutRef.current = setTimeout(() => setShowReactions(true), 400);
    };

    const handleTouchEnd = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShowReactions(false);
    };


    const handleButtonClick = () => {
        if (!currentMoment) return;

        if (displayedReaction) {

            setDisplayedReaction(null);
            debouncedToggleReaction(currentMoment.id, null, currentReaction);
            setShowReactions(false);
        } else {

            setShowReactions(true);
        }
    };


    const handleReactionClick = (reaction: ReactionType) => {
        if (!currentMoment) return;

        setDisplayedReaction(reaction);
        debouncedToggleReaction(currentMoment.id, reaction, currentReaction);
        setShowReactions(false);
    };

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* 🔘 Nút chính */}
            <button
                disabled={isDelaying}
                className="flex items-center text-foreground-200 justify-center w-12 h-10 rounded-md"
                onClick={handleButtonClick}
            >
                {displayedReaction ? (
                    <Image
                        src={getReactionEmoji(displayedReaction)}
                        alt={displayedReaction}
                        width={32}
                        height={32}
                        className="w-8 h-8 transition-transform duration-200"
                    />
                ) : (
                    <ReactionPlus className="size-8 transition-transform duration-200" />
                )}
            </button>

            <AnimatePresence>
                {showReactions && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="absolute bottom-full right-0 mb-3 bg-background-300 shadow-lg rounded-2xl px-4 py-3 z-50 max-w-[80vw] w-max"
                    >
                        <div className="grid grid-cols-5 gap-2 place-items-center">
                            {Object.values(ReactionType)
                                .filter((type) => type !== displayedReaction)
                                .map((type) => (
                                    <motion.button
                                        key={type}
                                        onClick={() => handleReactionClick(type)}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-8 h-8 flex items-center justify-center"
                                    >
                                        <Image
                                            src={getReactionEmoji(type)}
                                            alt={type}
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                    </motion.button>
                                ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReactionButtonHome;
