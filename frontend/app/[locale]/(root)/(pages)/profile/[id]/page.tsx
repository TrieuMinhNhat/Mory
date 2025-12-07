"use client"

import {useParams, useRouter} from "next/navigation";
import React, {useCallback, useEffect, useRef, useState} from "react";
import MenuTriangle from "@/components/shared/icons/MenuTriangle";
import Image from "next/image";
import {useTranslation} from "next-i18next";
import {ROUTES} from "@/constants/routes";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import {Skeleton} from "@/components/ui/skeleton";
import MomentImageGridItem from "@/components/user/moment/MomentImageGridItem";
import EmptyList from "@/components/shared/EmptyList";
import {useMomentCarouselStore} from "@/store/moment/useMomentCarouselStore";
import {Moment} from "@/types/moment";
import {useUserProfileStore} from "@/store/profie/useUserProfileStore";
import {ChevronLeft} from "lucide-react";
import {useConnectionDrawerStore} from "@/store/connection/useConnectionDrawerStore";
import {UserPreview} from "@/types/user";
import {ConnectionStatus, ConnectionType} from "@/types/connections";
import {useSendConnectionRequestDialogStore} from "@/store/connection/useSendConnectionRequestDialogStore";
import Person from "@/components/user/icons/Person";
import Star from "@/components/user/icons/Star";
import Heart from "@/components/user/icons/Heart";

const SCROLL_THRESHOLD = 50;

const UserProfilePage = () => {
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

        userMoments,
        isFetchingUserMoments,
        userMomentsHasNext,
        userMomentsHasFetchedOnce,
        fetchUserMoments
    } = useUserProfileStore(
        (state) => ({
            userDetails: state.userDetails,
            error: state.error,
            currentUserId: state.currentUserId,
            isFetchingUserDetails: state.isFetchingUserDetails,
            userDetailsHasFetchedOnce: state.userDetailsHasFetchedOnce,
            fetchUserDetails: state.fetchUserDetails,

            userMoments: state.userMoments,
            isFetchingUserMoments: state.isFetchingUserMoments,
            userMomentsHasNext: state.userMomentsHasNext,
            userMomentsHasFetchedOnce: state.userMomentsHasFetchedOnce,
            fetchUserMoments: state.fetchUserMoments,
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
        if (userMomentsHasFetchedOnce || isFetchingUserMoments) return;
        if (userDetails &&  userDetails?.connection?.status !== ConnectionStatus.CONNECTED) return;
        void fetchUserMoments(id);
    }, [currentUserId, error, fetchUserMoments, id, isFetchingUserMoments, user, userDetails, userMomentsHasFetchedOnce]);

    const { openCarousel, appendMomentsAndUpdateHasNext } = useMomentCarouselStore()

    const handleFetchMoreMoments = useCallback(async () => {
        if (!userMomentsHasNext || isFetchingUserMoments || !user) return;
        const result = await fetchUserMoments(id)
        if (result.success && result.data) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            appendMomentsAndUpdateHasNext(result.data.moments as Moment[], result.data.hasNext)
        }
    }, [appendMomentsAndUpdateHasNext, fetchUserMoments, id, isFetchingUserMoments, user, userMomentsHasNext])

    const handleScrollMoments = useCallback(() => {
        if (isFetchingUserMoments) return;

        const scrollTop = window.scrollY;
        const viewportHeight = window.innerHeight;
        const fullHeight = document.documentElement.scrollHeight;

        const isNearEnd = scrollTop + viewportHeight >= fullHeight - SCROLL_THRESHOLD;

        if (isNearEnd) {
            void handleFetchMoreMoments()
        }
    }, [isFetchingUserMoments, handleFetchMoreMoments]);

    useEffect(() => {
        window.addEventListener("scroll", handleScrollMoments, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScrollMoments);
        };
    }, [handleScrollMoments]);

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
    }, [error]);

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
                <button className={"nav-button !bg-primary !text-fg-light-100"}>
                    {u("profile.button.moments")}
                </button>
                <button
                    className={"nav-button"}
                    onClick={() => router.replace(ROUTES.PROFILE.STORIES(id))}
                >
                    {u("profile.button.stories")}
                </button>
                <button
                    className={"nav-button"}
                    onClick={() => router.replace(ROUTES.PROFILE.CONNECTIONS(id))}
                >
                    {u("profile.button.connections")}
                </button>
            </div>
            {(!userDetails?.connection || userDetails.connection.status !== ConnectionStatus.CONNECTED) && !isFetchingUserMoments && userDetailsHasFetchedOnce && (
                <div className={"flex flex-col items-center gap-2 w-full"}>
                    <EmptyList message={u("profile.moments.access_denied")} className={"w-24 h-16 md:w-32 md:h-20"}/>
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
            )}
            {userMoments.length === 0 && userMomentsHasFetchedOnce
                ? (
                    <EmptyList message={u("home.empty")}/>
                ) : (
                    <div ref={gridRef} className="grid grid-cols-3 gap-1 pt-2 pb-20 md:pb-2">
                        {!userMomentsHasFetchedOnce && isFetchingUserMoments ? (
                            Array.from({ length: 9 }).map((_, i) => (
                                <Skeleton key={i} className={"w-full aspect-square rounded-xl"}/>
                            ))
                        ) : (
                            <>
                                {userMoments.map((m, index) => (
                                    <div
                                        key={m.id}
                                        className={"relative rounded-xl"}
                                        style={{
                                            width: itemSize,
                                            height: itemSize,
                                        }}
                                    >
                                        <MomentImageGridItem
                                            moment={m}
                                            story={m.story}
                                            showUserInfo={false}
                                            showHoverRing={true}
                                            size={itemSize}
                                            onClick={() => {
                                                if (user) {
                                                    openCarousel({
                                                        moments: userMoments,
                                                        title: user?.profile.displayName,
                                                        currentIndex: index,
                                                        hasNext: userMomentsHasNext,
                                                        onFetchMore: handleFetchMoreMoments
                                                    })
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                                {isFetchingUserMoments && userMomentsHasNext && (
                                    <>
                                        {Array.from(
                                            { length: (3 - (userMoments.length % 3)) % 3 || 3 },
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
    )
}

export function getProfileAvatarByConnectionType(connectionType: ConnectionType, avatarUrl?: string): React.ReactNode {
    switch (connectionType) {
        case ConnectionType.FRIEND:
            return (
                <div
                    className={"w-[120px] h-[120px] ring-4 ring-foreground-200 p-1 rounded-full"}
                >
                    <div className={"w-[112px] h-[112px] rounded-full relative"}>
                        <Image
                            src={avatarUrl ?? "/assets/images/avatar.png"}
                            alt={"profile photo"}
                            fill
                            priority
                            sizes={"112px"}
                            className={"object-contain rounded-full"}
                        />
                        <div className={"absolute z-10 bottom-0 right-0 bg-foreground-200 rounded-full p-0.5"}>
                            <Person className={"size-7 text-background-200"}/>
                        </div>
                    </div>

                </div>
            )
        case ConnectionType.CLOSE_FRIEND:
            return (
                <div
                    className={"w-[120px] h-[120px] ring-4 ring-close p-1 rounded-full"}
                >
                    <div className={"w-[112px] h-[112px] rounded-full relative"}>
                        <Image
                            src={avatarUrl ?? "/assets/images/avatar.png"}
                            alt={"profile photo"}
                            fill
                            priority
                            sizes={"112px"}
                            className={"object-contain rounded-full"}
                        />
                        <div className={"absolute z-10 bottom-0 right-0 bg-close rounded-full p-0.5"}>
                            <Star className={"size-7 text-fg-light-100"}/>
                        </div>
                    </div>

                </div>
            )
        case ConnectionType.SPECIAL:
            return (
                <div
                    className={"w-[120px] h-[120px] ring-4 ring-primary p-1 rounded-full"}
                >
                    <div className={"w-[112px] h-[112px] rounded-full relative"}>
                        <Image
                            src={avatarUrl ?? "/assets/images/avatar.png"}
                            alt={"profile photo"}
                            fill
                            priority
                            sizes={"112px"}
                            className={"object-contain rounded-full"}
                        />
                        <div className={"absolute z-10 bottom-0 right-0 bg-primary rounded-full p-0.5"}>
                            <Heart className={"size-7 text-primary-foreground"}/>
                        </div>
                    </div>
                </div>
            )
        default:
            return (
                <div
                    className={"w-[120px] h-[120px] ring-4 ring-primary p-1 rounded-full"}
                >
                    <div className={"w-[112px] h-[112px] rounded-full relative"}>
                        <Image
                            src={avatarUrl ?? "/assets/images/avatar.png"}
                            alt={"profile photo"}
                            fill
                            priority
                            sizes={"112px"}
                            className={"object-contain rounded-full"}
                        />
                    </div>
                </div>
            )
    }
}

export default UserProfilePage;