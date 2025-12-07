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
import {useProfileStore} from "@/store/profie/useProfileStore";
import {shallow} from "zustand/vanilla/shallow";
import {Skeleton} from "@/components/ui/skeleton";
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore";
import {ConnectionStatus} from "@/types/connections";
import ConnectionListItemSkeleton from "@/components/user/connections/home/ConnectionListItemSkeleton";
import ConnectionListItem from "@/components/user/connections/home/ConnectionListItem";
import EmptyList from "@/components/shared/EmptyList";
import {useConnectWithMeDialogStore} from "@/store/connection/useConnectWithMeDialogStore";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import ConnectionTypeFilter from "@/components/user/connections/ConnectionTypeFilter";
import {toConnectionType} from "@/utils/connection";

const SCROLL_THRESHOLD = 100;

const ProfileConnectionsPage = () => {
    const {t: u} = useTranslation("user");
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const searchParams = useSearchParams();
    const type = toConnectionType(searchParams.get("type") ?? undefined);
    
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

    const {
        connections,
        typeFilter,
        connectionsHasNext,
        isFetchingConnections,
        connectionsHasFetchedOnce,
        fetchConnections,
    } = useUserConnectionsStore(
        (state) => ({
            connections: state.connections,
            typeFilter: state.typeFilter,
            connectionsHasNext: state.connectionsHasNext,
            isFetchingConnections: state.isFetchingConnections,
            connectionsHasFetchedOnce: state.connectionsHasFetchedOnce,
            fetchConnections: state.fetchConnections,
        }),
        shallow
    );
    
    useEffect(() => {
        if (!profileHasFetchedOnce && !isFetchingProfile) {
            void fetchProfile();
        }
    }, [fetchProfile, isFetchingProfile, profileHasFetchedOnce])

    useEffect(() => {
        if (isFetchingConnections || (typeFilter === type && connectionsHasFetchedOnce)) return;
        void fetchConnections({status: ConnectionStatus.CONNECTED, type: type, reset: true});
    }, [fetchConnections, connectionsHasFetchedOnce, isFetchingConnections, typeFilter, type]);

    const handleScroll = useCallback(() => {
        if (isFetchingConnections) return;

        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        const isNearEnd = scrollTop + viewportHeight >= fullHeight - SCROLL_THRESHOLD;

        if (isNearEnd && connectionsHasNext) {
            void fetchConnections({status: ConnectionStatus.CONNECTED, type: type});
        }
    }, [isFetchingConnections, connectionsHasNext, fetchConnections, type]);

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
                <button
                    className={"nav-button"}
                    onClick={() => router.replace(ROUTES.PROFILE.ME.STORIES)}
                >
                    {u("profile.button.stories")}
                </button>
                <button
                    className={"nav-button !bg-primary !text-fg-light-100"}
                >
                    {u("profile.button.connections")}
                </button>
            </div>

            <div
                className={"flex flex-col gap-1 h-fit pb-20 md:pb-2"}
            >
                <div className="relative py-2 border-b border-background-m">
                    <button
                        type="button"
                        className={"absolute left-3 top-1/2 -translate-y-1/2 text-foreground-200"}
                    >
                        <Search className={"size-5"} />
                    </button>

                    <Input
                        required
                        className={
                            "shadow-none ring-1 ring-transparent focus:!ring-foreground-200 text-base font-normal px-10 text-foreground border-background-m bg-background-100 placeholder:text-foreground-200 h-10 rounded-full"
                        }
                        placeholder="Search"
                        autoComplete="new-password"
                    />

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full">
                        <ConnectionTypeFilter />
                    </div>
                </div>
                {!connectionsHasFetchedOnce && isFetchingConnections ? (
                    Array.from({ length: 7 }).map((_, i) => (
                        <ConnectionListItemSkeleton key={i}/>
                    ))
                ) : connections.length === 0 ? (
                    <EmptyList message={u("connections.home.empty")}/>
                ) : (
                    <>
                        {connections.map((c) => (
                            <ConnectionListItem key={c.id} connection={c} />
                        ))}
                        {isFetchingConnections && connectionsHasNext && (
                            <ConnectionListItemSkeleton/>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default ProfileConnectionsPage;