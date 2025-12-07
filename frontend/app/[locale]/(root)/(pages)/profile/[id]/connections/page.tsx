"use client"

import {useParams, useRouter} from "next/navigation";
import React, {useCallback, useEffect} from "react";
import MenuTriangle from "@/components/shared/icons/MenuTriangle";
import {useTranslation} from "next-i18next";
import {ROUTES} from "@/constants/routes";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import {Skeleton} from "@/components/ui/skeleton";
import EmptyList from "@/components/shared/EmptyList";
import {useUserProfileStore} from "@/store/profie/useUserProfileStore";
import {ChevronLeft} from "lucide-react";
import ConnectionListItemSkeleton from "@/components/user/connections/home/ConnectionListItemSkeleton";
import UserConnectionCard from "@/components/user/profile/UserConnectionCard";
import {useConnectionDrawerStore} from "@/store/connection/useConnectionDrawerStore";
import {UserPreview} from "@/types/user";
import {ConnectionStatus, ConnectionType} from "@/types/connections";
import {useSendConnectionRequestDialogStore} from "@/store/connection/useSendConnectionRequestDialogStore";
import {getProfileAvatarByConnectionType} from "@/app/[locale]/(root)/(pages)/profile/[id]/page";

const SCROLL_THRESHOLD = 50;

const UserProfileConnectionsPage = () => {
    const {t: u} = useTranslation("user");
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    const {openDrawer: openConnectionDrawer} = useConnectionDrawerStore();

    const { openDialog } = useSendConnectionRequestDialogStore();
 
    const {
        userDetails,
        error,
        currentUserId,
        isFetchingUserDetails,
        userDetailsHasFetchedOnce,
        fetchUserDetails,

        userConnections,
        isFetchingUserConnections,
        userConnectionsHasNext,
        userConnectionsHasFetchedOnce,
        fetchUserConnections
    } = useUserProfileStore(
        (state) => ({
            userDetails: state.userDetails,
            error: state.error,
            currentUserId: state.currentUserId,
            isFetchingUserDetails: state.isFetchingUserDetails,
            userDetailsHasFetchedOnce: state.userDetailsHasFetchedOnce,
            fetchUserDetails: state.fetchUserDetails,

            userConnections: state.userConnections,
            isFetchingUserConnections: state.isFetchingUserConnections,
            userConnectionsHasNext: state.userConnectionsHasNext,
            userConnectionsHasFetchedOnce: state.userConnectionsHasFetchedOnce,
            fetchUserConnections: state.fetchUserConnections,
        }),
        shallow
    );

    useEffect(() => {
        if (id === user?.id) router.replace(ROUTES.PROFILE.ME.ROOT)
    }, [id, router, user?.id]);

    useEffect(() => {
        if (id === user?.id) return;
        if (error && id === currentUserId) return;
        if ((currentUserId === id && userDetailsHasFetchedOnce) || isFetchingUserDetails) return;
        void fetchUserDetails(id);
    }, [currentUserId, error, fetchUserDetails, id, isFetchingUserDetails, user?.id, userDetailsHasFetchedOnce])

    useEffect(() => {
        if (id === user?.id) return;
        if (error) return;
        if (userConnectionsHasFetchedOnce || isFetchingUserConnections) return;
        if (userDetails && userDetails?.connection?.status !== ConnectionStatus.CONNECTED) return;
        void fetchUserConnections(id);
    }, [currentUserId, error, fetchUserConnections, id, userDetails, isFetchingUserConnections, user, userConnectionsHasFetchedOnce]);
    

    const handleFetchMoreConnections = useCallback(async () => {
        if (!userConnectionsHasNext || isFetchingUserConnections || !user) return;
        void fetchUserConnections(id)
    }, [fetchUserConnections, id, isFetchingUserConnections, user, userConnectionsHasNext])

    const handleScrollConnections = useCallback(() => {
        if (isFetchingUserConnections) return;

        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        const isNearEnd = scrollTop + viewportHeight >= fullHeight - SCROLL_THRESHOLD;

        if (isNearEnd) {
            void handleFetchMoreConnections()
        }
    }, [isFetchingUserConnections, handleFetchMoreConnections]);

    useEffect(() => {
        window.addEventListener("scroll", handleScrollConnections, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScrollConnections);
        };
    }, [handleScrollConnections]);

    if (error) {
        return (
            <div className={"h-full px-2 md:px-6 pt-4 w-full"}>
                <div className={"w-full flex flex-row items-center h-10 justify-start"}>
                    <button
                        className={"main-header-button"}
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className={"size-7 mx-auto"}/>
                    </button>
                </div>
                <div className={"mx-auto"}>
                    <EmptyList message={u("profile.access_denied")} className={"w-24 h-16 md:w-32 md:h-20 "}/>
                </div>
            </div>
        )
    }

    return (
        <div className={"h-full px-2 md:px-6 pt-4 w-full"}>
            <div className={"w-full flex flex-row items-center h-10 justify-between"}>
                <button
                    className={"main-header-button"}
                    onClick={() => router.back()}
                >
                    <ChevronLeft className={"size-7 mx-auto"}/>
                </button>
                <button
                    className={"main-header-button"}
                    disabled={isFetchingUserDetails}
                    onClick={() => {
                        if (userDetails) {
                            const userPreview: UserPreview = {
                                id: id,
                                displayName: userDetails?.displayName ?? "",
                                avatarUrl: userDetails?.avatarUrl
                            }
                            openConnectionDrawer(userDetails?.connection, userPreview)
                        }
                    }}
                >
                    <MenuTriangle className={"size-5 mx-auto"}/>
                </button>
            </div>
            <div className={"flex flex-col w-full items-center"}>
                {isFetchingUserDetails ? (
                    <div
                        className={"w-[120px] h-[120px] ring-4 ring-primary p-1 rounded-full"}
                    >
                        <Skeleton className={"w-full h-full rounded-full"}/>
                    </div>
                ) : (
                    userDetails && getProfileAvatarByConnectionType(userDetails?.connection.connectionType, userDetails?.avatarUrl)
                )}
                {isFetchingUserDetails ? (
                    <Skeleton className={"rounded-full mt-2 mb-1 h-7 w-40"}/>
                ) : (
                    <h2 className={"text-3xl mt-1 font-semibold text-foreground"}>
                        {userDetails?.displayName}
                    </h2>
                )}

                {isFetchingUserDetails
                    ? (
                        <Skeleton className={"w-28 h-6 rounded-full"}/>
                    )
                    : (
                        <h4 className={"text-base font-medium text-foreground-200"}>
                            {!userDetails?.connectionCount || userDetails?.connectionCount === 0
                                ? u("profile.no_connections")
                                : u("profile.connection", { count: userDetails.connectionCount })}
                        </h4>
                    )
                }
            </div>
            <div className={"nav-container py-2 border-background-m border-b border-t"}>
                <button
                    className={"nav-button"}
                    onClick={() => router.replace(ROUTES.PROFILE.ROOT(id))}
                >
                    {u("profile.button.moments")}
                </button>
                <button
                    className={"nav-button"}
                    onClick={() => router.replace(ROUTES.PROFILE.STORIES(id))}
                >
                    {u("profile.button.stories")}
                </button>
                <button
                    className={"nav-button !bg-primary !text-fg-light-100"}
                >
                    {u("profile.button.connections")}
                </button>
            </div>
            {(!userDetails?.connection || userDetails.connection.status !== ConnectionStatus.CONNECTED) && !isFetchingUserConnections && userDetailsHasFetchedOnce ? (
                <div className={"flex flex-col items-center gap-2 w-full"}>
                    <EmptyList message={u("profile.connections.access_denied")} className={"w-24 h-16 md:w-32 md:h-20"}/>
                    <button
                        className={"h-10 px-3 font-medium rounded-full bg-primary hover:bg-primary/80 text-primary-foreground"}
                        onClick={() => {
                            if (userDetails) {
                                const userPreview: UserPreview = {
                                    id: id,
                                    displayName: userDetails?.displayName ?? "",
                                    avatarUrl: userDetails?.avatarUrl
                                }
                                openDialog(userPreview, true, undefined, ConnectionType.FRIEND)
                            }
                        }}
                    >
                        {u("profile.button.send_friend_request")}
                    </button>
                </div>
            ) : (
                <div className={"flex flex-col items-center w-full mb-20 md:mb-2"}>
                    {!userConnectionsHasFetchedOnce && isFetchingUserConnections ? (
                        Array.from({ length: 7 }).map((_, i) => (
                            <ConnectionListItemSkeleton key={i}/>
                        ))
                    ) : userConnections.length === 0 ? (
                        <>
                            {!isFetchingUserConnections && !isFetchingUserDetails && (
                                <EmptyList message={u("connections.home.empty")}/>
                            )}
                        </>
                    ) : (
                        <>
                            {userConnections.map((c) => (
                                <UserConnectionCard key={c.id} connection={c} />
                            ))}
                            {isFetchingUserConnections && userConnectionsHasNext && (
                                <ConnectionListItemSkeleton/>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default UserProfileConnectionsPage;