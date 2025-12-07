"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useStoriesStore } from "@/store/story/useStoriesStore";
import { shallow } from "zustand/vanilla/shallow";
import EmptyList from "@/components/shared/EmptyList";
import { useTranslation } from "next-i18next";
import AvailableStoryCard from "@/components/user/moment/AvailableStoryCard";
import AvailableStoryCardSkeleton from "@/components/user/moment/AvailableStoryCardSkeleton";
import {Story} from "@/types/moment";

const SCROLL_THRESHOLD = 100;

interface Props {
    selectedStory: Story | null;
    onSelectStory: (story: Story) => void;
}

const SelectStoryContent = ({ selectedStory, onSelectStory }: Props) => {
    const { t: u } = useTranslation("user");
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const {
        availableStories,
        availableStoriesHasNext,
        isFetchingAvailableStories,
        availableStoriesHasFetchedOnce,
        fetchAvailableStories,
    } = useStoriesStore(
        (state) => ({
            availableStories: state.availableStories,
            availableStoriesHasNext: state.availableStoriesHasNext,
            isFetchingAvailableStories: state.isFetchingAvailableStories,
            availableStoriesHasFetchedOnce: state.availableStoriesHasFetchedOnce,
            fetchAvailableStories: state.fetchAvailableStories,
        }),
        shallow
    );

    // fetch lần đầu
    useEffect(() => {
        if (!availableStoriesHasFetchedOnce) {
            void fetchAvailableStories();
        }
    }, [fetchAvailableStories, availableStoriesHasFetchedOnce]);

    // scroll handler cho div
    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container || isFetchingAvailableStories) return;

        const { scrollTop, clientHeight, scrollHeight } = container;
        const isNearEnd = scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD;

        if (isNearEnd && availableStoriesHasNext) {
            void fetchAvailableStories();
        }
    }, [fetchAvailableStories, availableStoriesHasNext, isFetchingAvailableStories]);

    return (
        <div
            ref={scrollContainerRef}
            className={
                "drawer-content !gap-0 h-full overflow-y-auto px-3 py-2"
            }
            onScroll={handleScroll}
        >
            {!availableStoriesHasFetchedOnce && isFetchingAvailableStories ? (
                Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                        <AvailableStoryCardSkeleton/>
                    </div>
                ))
            ) : availableStories.length === 0 ? (
                <EmptyList message={u("story.empty")} />
            ) : (
                <>
                    {availableStories.map((story) => (
                        <div key={story.id}>
                            <AvailableStoryCard
                                onClick={() => onSelectStory(story)}
                                selectedStory={selectedStory}
                                story={story}
                            />
                        </div>
                    ))}
                    {isFetchingAvailableStories && availableStoriesHasNext && (
                        <AvailableStoryCardSkeleton />
                    )}
                </>
            )}
        </div>
    );
};

export default SelectStoryContent;
