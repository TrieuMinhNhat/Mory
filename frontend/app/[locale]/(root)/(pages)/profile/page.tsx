"use client"

import {useRouter} from "next/navigation";
import React, {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
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
import MomentImageGridItem from "@/components/user/moment/MomentImageGridItem";
import EmptyList from "@/components/shared/EmptyList";
import AvatarCropDialog from "@/components/shared/AvatarCropDialog";
import {toast} from "sonner";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import SetPasswordDialog from "@/components/user/profile/SetPasswordDialog";
import {useMomentCarouselStore} from "@/store/moment/useMomentCarouselStore";
import {Moment} from "@/types/moment";
import {useConnectWithMeDialogStore} from "@/store/connection/useConnectWithMeDialogStore";

const SCROLL_THRESHOLD = 50;

const ProfilePage = () => {
    const {t: u} = useTranslation("user");
    const {t: ts} = useTranslation("toast")
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    // ConnectionCount
    const {
        showCreatePassword,
        connectionCount, 
        isFetchingProfile,
        profileHasFetchedOnce,
        fetchProfile,

        userMoments, 
        isFetchingUserMoments,
        userMomentsHasNext,
        userMomentsHasFetchedOnce,
        fetchUserMoments
    } = useProfileStore(
        (state) => ({
            showCreatePassword: state.showCreatePassword,
            connectionCount: state.connectionCount,
            isFetchingProfile: state.isFetchingProfile,
            profileHasFetchedOnce: state.profileHasFetchedOnce,
            fetchProfile: state.fetchProfile,
            
            userMoments: state.userMoments,
            isFetchingUserMoments: state.isFetchingUserMoments,
            userMomentsHasNext: state.userMomentsHasNext,
            userMomentsHasFetchedOnce: state.userMomentsHasFetchedOnce,
            fetchUserMoments: state.fetchUserMoments,
        }),
        shallow
    );

    const {openDialog: openConnectWithMeDialog} = useConnectWithMeDialogStore()
    

    useEffect(() => {
        if (!profileHasFetchedOnce && !isFetchingProfile) {
            void fetchProfile();
        }
    }, [fetchProfile, isFetchingProfile, profileHasFetchedOnce])
    
    useEffect(() => {
        if (!userMomentsHasFetchedOnce && !isFetchingUserMoments) {
            if (!user) return;
            void fetchUserMoments(user?.id);
        }
    }, [fetchUserMoments, isFetchingUserMoments, user, userMomentsHasFetchedOnce]);

    const { openCarousel, appendMomentsAndUpdateHasNext } = useMomentCarouselStore()

    const handleFetchMoreMoments = useCallback(async () => {
        if (!userMomentsHasNext || isFetchingUserMoments || !user) return;
        const result = await fetchUserMoments(user.id)
        console.log("fetch more")
        if (result.success && result.data) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            appendMomentsAndUpdateHasNext(result.data.moments as Moment[], result.data.hasNext)
        }
    }, [appendMomentsAndUpdateHasNext, fetchUserMoments, isFetchingUserMoments, user, userMomentsHasNext])

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

    const [isSetPasswordDialogOpen, setIsSetPasswordDialogOpen] = useState(false);

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

    //Image input
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {isUpdatingAvatar, updateUserAvatar} = useProfileStore(
        (state) => ({
            isUpdatingAvatar: state.isUpdatingUserAvatar,
            updateUserAvatar: state.updateUserAvatar,
        })
    )

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [openCrop, setOpenCrop] = useState(false);
    const [fileName, setFileName] = useState<string>("");

    const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image")) return;

        setCropSrc(URL.createObjectURL(file));
        setFileName(file.name);

        setOpenCrop(true);

        e.target.value = "";
    };

    const handleCropDone = async (croppedDataUrl: string) => {
        const blob = await fetch(croppedDataUrl).then((r) => r.blob());
        const file = new File([blob], fileName , { type: "image/jpeg" });
        setPreviewUrl(URL.createObjectURL(file));
        const result = await updateUserAvatar({imageFile: file});
        if (result.success) {
            toast.success(ts("user.update_avatar.success"))
        } else {
            toast.error(ts("user.update_avatar.error"))
        }
    };

    const handleCropCancel = () => {
        setOpenCrop(false);
    };

    return (
        <div className={"h-full px-2 md:px-6 pt-4 w-full"}>
            <div className={"w-full flex flex-row items-center h-10 justify-end"}>
                <Popover>
                    <PopoverTrigger asChild>
                        <button className={"main-header-button"}>
                            <MenuTriangle className={"size-5 mx-auto"}/>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full max-w-lg bg-background-300 p-2 rounded-2xl" align={"end"}>
                        <div className={"flex flex-col w-full"}>
                            <button className={"w-full text-left h-10 px-4 hover:bg-background-200 rounded-xl"}>
                                {u("profile.action_menu.edit_profile")}
                            </button>
                            {showCreatePassword && (
                                <button
                                    className={"w-full text-left h-10 px-4 hover:bg-background-200 rounded-xl"}
                                    onClick={() => setIsSetPasswordDialogOpen(true)}
                                >
                                    {u("profile.action_menu.set_password")}
                                </button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div className={"flex flex-col w-full items-center"}>
                <button
                    className={"w-32 h-32 border-4 border-primary p-1 rounded-full"}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUpdatingAvatar}
                >
                    <div className={"w-[112px] h-[112px] rounded-full relative"}>
                        <Image
                            src={(isUpdatingAvatar ? previewUrl : user?.profile?.avatarUrl) ?? "/assets/images/avatar.png"}
                            alt={"profile photo"}
                            fill
                            priority
                            sizes={"112px"}
                            className={"object-contain rounded-full"}
                        />
                        {isUpdatingAvatar && <Skeleton className={"absolute top-0 right-0 w-[112px] h-[112px] rounded-full"}/>}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleSelectFile}
                    />
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
                    onClick={() => openConnectWithMeDialog()}
                    className={"w-full hover:bg-background-300 justify-between md:max-w-[460px] rounded-full py-2 pl-2 pr-4 bg-background-200 flex flex-row items-center"}
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
                <button className={"nav-button !bg-primary !text-fg-light-100"}>
                    {u("profile.button.moments")}
                </button>
                <button
                    className={"nav-button"}
                    onClick={() => router.replace(ROUTES.PROFILE.ME.STORIES)}
                >
                    {u("profile.button.stories")}
                </button>
                <button
                    className={"nav-button"}
                    onClick={() => router.replace(ROUTES.PROFILE.ME.CONNECTIONS)}
                >
                    {u("profile.button.connections")}
                </button>
            </div>
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
            {isSetPasswordDialogOpen &&
                <SetPasswordDialog isOpen={isSetPasswordDialogOpen} onIsOpenChange={setIsSetPasswordDialogOpen}/>
            }
            <AvatarCropDialog
                open={openCrop}
                fileUrl={cropSrc || ""}
                onClose={handleCropCancel}
                onCropDone={(url) => {
                    setOpenCrop(false);
                    void handleCropDone(url);
                }}
            />
        </div>
    )
}

export default ProfilePage;