"use client"

import {Plus, Search} from "lucide-react";
import React, {useCallback, useEffect, useState} from "react";
import {useTranslation} from "next-i18next";
import {Input} from "@/components/ui/input";
import {useStoriesStore} from "@/store/story/useStoriesStore";
import {shallow} from "zustand/vanilla/shallow";
import StoryCard from "@/components/user/story/StoryCard";
import StoryCardSkeleton from "@/components/user/story/StoryCardSkeleton";
import EmptyList from "@/components/shared/EmptyList";
import CreateStoryDialog from "@/components/user/story/create/CreateStoryDialog";
import {useSearchParams} from "next/navigation";
import {toStoryType} from "@/utils/story";
import StoryTypeFilter from "@/components/user/story/StoryTypeFilter";


const SCROLL_THRESHOLD = 100;

const StoryPage = () => {
    const {t: u} = useTranslation("user")

    const searchParams = useSearchParams();
    const type = toStoryType(searchParams.get("type") ?? undefined);


    const {
        stories,
        storiesHasNext,
        isFetchingStories,
        storiesHasFetchedOnce,
        fetchStories,
        typeFilter
    } = useStoriesStore(
        (state) => ({
            stories: state.stories,
            storiesHasNext: state.storiesHasNext,
            isFetchingStories: state.isFetchingStories,
            storiesHasFetchedOnce: state.storiesHasFetchedOnce,
            fetchStories: state.fetchStories,
            typeFilter: state.typeFilter,
        }),
        shallow
    );

    
    useEffect(() => {
        if (isFetchingStories || (typeFilter === type && storiesHasFetchedOnce)) return;
        void fetchStories(undefined, {type: type, reset: true});
    }, [fetchStories, isFetchingStories, stories.length, storiesHasFetchedOnce, type, typeFilter]);


    const handleScroll = useCallback(() => {
        if (isFetchingStories) return;

        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        const isNearEnd = scrollTop + viewportHeight >= fullHeight - SCROLL_THRESHOLD;

        if (isNearEnd && storiesHasNext) {
            void fetchStories(undefined, {type: type, reset: false});
        }
    }, [isFetchingStories, storiesHasNext, fetchStories, type]);


    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);


    const [isCreateStoryDialogOpen, setIsCreateStoryDialogOpen] = useState(false);


    return (
        <div className={"h-full px-2 md:px-6 pt-2 w-full"}>
            <div className={"w-full flex flex-row items-center h-10 justify-between"}>
                <h1 className={"main-header-title"}>{u("story.home.title")}</h1>
                <button
                    onClick={() => setIsCreateStoryDialogOpen(true)}
                    className={"text-foreground-200 h-8 w-8 bg-background-200 hover:bg-background-300 rounded-full hover:text-foreground"}
                >
                    <Plus className={"size-5 mx-auto"}/>
                </button>
            </div>
            <div className="relative py-2 border-b border-background-m">
                <button
                    type="button"
                    className={"absolute left-3 top-1/2 -translate-y-1/2 text-foreground-200"}
                >
                    <Search className={"size-5"}/>
                </button>

                <Input
                    required
                    className={"shadow-none ring-1 ring-transparent focus:!ring-foreground-200 text-base font-normal px-10 text-foreground border-background-m bg-background-100 placeholder:text-foreground-200 h-10 rounded-full"}
                    placeholder={"Search"}
                    autoComplete={"new-password"}
                />

                <div
                    className={"absolute right-2 top-1/2 -translate-y-1/2 rounded-full"}
                >
                    <StoryTypeFilter/>
                </div>

            </div>

            <div className="flex flex-col py-3 pb-20 md:pb-2">
                {!storiesHasFetchedOnce && isFetchingStories ? (
                    Array.from({ length: 7 }).map((_, i) => (
                        <div key={i}>
                            <StoryCardSkeleton
                                key={i}
                            />
                        </div>
                    ))
                ) : stories.length === 0 ? (
                    <EmptyList message={u("story.empty")}/>
                ) : (
                    <>
                        {stories.map((story) => (
                            <div key={story.id}>
                                <StoryCard key={story.id} story={story}/>
                            </div>
                        ))}
                        {isFetchingStories && storiesHasNext && <StoryCardSkeleton/>}
                    </>
                )}
            </div>

            
            {isCreateStoryDialogOpen && <CreateStoryDialog isOpen={isCreateStoryDialogOpen} onIsOpenChange={setIsCreateStoryDialogOpen}/>}
        </div>
    )
}

export default StoryPage;