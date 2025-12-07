"use client"

import {useRouter, useSearchParams} from "next/navigation";
import React, {useCallback, useEffect} from "react";
import MenuTriangle from "@/components/shared/icons/MenuTriangle";
import Image from "next/image";
import GoPremiumButton from "@/components/shared/GoPremiumButton";
import {useTranslation} from "next-i18next";
import OShare from "@/components/shared/icons/OShare";
import {ROUTES} from "@/constants/routes";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import {Skeleton} from "@/components/ui/skeleton";
import EmptyList from "@/components/shared/EmptyList";
import {toStoryType} from "@/utils/story";
import {useStoriesStore} from "@/store/story/useStoriesStore";
import {useProfileStore} from "@/store/profie/useProfileStore";
import {useConnectWithMeDialogStore} from "@/store/connection/useConnectWithMeDialogStore";
import StoryCardSkeleton from "@/components/user/story/StoryCardSkeleton";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import StoryTypeFilter from "@/components/user/story/StoryTypeFilter";
import StoryCard from "@/components/user/story/StoryCard";

const SCROLL_THRESHOLD = 100;

const ProfileStoriesPage = () => {
    const {t: u} = useTranslation("user");
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const searchParams = useSearchParams();
    const type = toStoryType(searchParams.get("type") ?? undefined);

    const {
        connectionCount,
        isFetchingProfile,
        profileHasFetchedOnce,
        fetchProfile
    } = useProfileStore(
        (state) => ({
            connectionCount: state.connectionCount,
            isFetchingProfile: state.isFetchingProfile,
            profileHasFetchedOnce: state.profileHasFetchedOnce,
            fetchProfile: state.fetchProfile,
        }),
        shallow
    );
    const {openDialog: openConnectWithMeDialog} = useConnectWithMeDialogStore()

    useEffect(() => {
        if (!profileHasFetchedOnce && !isFetchingProfile) {
            void fetchProfile();
        }
    }, [fetchProfile, isFetchingProfile, profileHasFetchedOnce])

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

    return (
        <div className={"h-full px-2 md:px-6 pt-4 w-full"}>
            <div className={"w-full flex flex-row items-center h-10 justify-end"}>
                <button className={"main-header-button"}>
                    <MenuTriangle className={"size-5 mx-auto"}/>
                </button>
            </div>
            <div className={"flex flex-col w-full items-center"}>
                <button className={"w-32 h-32 border-4 border-primary p-1 rounded-full"}>
                    <div className={"w-[112px] h-[112px] rounded-full relative"}>
                        <Image
                            src={user?.profile?.avatarUrl ?? "/assets/images/avatar.png"}
                            alt={"profile photo"}
                            fill
                            priority
                            sizes={"112px"}
                            className={"object-contain rounded-full"}
                        />
                    </div>

                </button>
                <h2 className={"text-3xl mt-1 font-semibold text-foreground"}>
                    {user?.profile?.displayName}
                </h2>
                {isFetchingProfile
                    ? (
                        <Skeleton className={"w-28 h-6 rounded-full"}/>
                    )
                    : (
                        <h4 className={"text-base font-medium text-foreground-200"}>
                            {!connectionCount || connectionCount === 0
                                ? u("profile.no_connections")
                                : u("profile.connection", { count: connectionCount })}
                        </h4>
                    )
                }
            </div>
            <div className={"flex-col flex w-full items-center mt-4 gap-4"}>
                <GoPremiumButton/>
                <button
                    className={"w-full hover:bg-background-300 justify-between md:max-w-[460px] rounded-full py-2 pl-2 pr-4 bg-background-200 flex flex-row items-center"}
                    onClick={() => openConnectWithMeDialog()}
                >
                    <div className={"w-10 h-10 border-2 border-primary p-[2px] rounded-full"}>
                        <div className={"w-8 h-8 relative"}>
                            <Image
                                src={user?.profile.avatarUrl ?? "/assets/images/avatar.png"}
                                alt={"profile photo"}
                                fill
                                sizes={"32px"}
                                className={"object-contain w-full rounded-full"}
                            />
                        </div>

                    </div>
                    <p className={"text-lg font-medium"}>{u("profile.button.connect_with_me")}</p>
                    <OShare className={"size-6"}/>
                </button>

            </div>
            <div className={"nav-container py-2 border-background-m border-b border-t"}>
                <button
                    className={"nav-button"}
                    onClick={() => router.replace(ROUTES.PROFILE.ME.ROOT)}
                >
                    {u("profile.button.moments")}
                </button>
                <button className={"nav-button !bg-primary !text-fg-light-100"}>
                    {u("profile.button.stories")}
                </button>
                <button
                    className={"nav-button"}
                    onClick={() => router.replace(ROUTES.PROFILE.ME.CONNECTIONS)}
                >
                    {u("profile.button.connections")}
                </button>
            </div>
            <div className="flex flex-col pb-20 md:pb-2">
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
                            <div key={story.id} className={"w-full"}>
                                <StoryCard story={story}/>
                            </div>
                        ))}
                        {isFetchingStories && storiesHasNext && <StoryCardSkeleton/>}
                    </>
                )}
            </div>
        </div>
    )
}

export default ProfileStoriesPage;