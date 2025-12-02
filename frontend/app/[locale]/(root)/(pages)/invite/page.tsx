"use client"

import Image from "next/image";
import React, {useCallback, useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {UserProfile} from "@/types/user";
import {fetchUserProfileByInviteToken} from "@/lib/services/connections.service";
import {Skeleton} from "@/components/ui/skeleton";
import {useTranslation} from "next-i18next";
import {ChevronLeft} from "lucide-react";
import {useAuthStore} from "@/store/useAuthStore";
import {ROUTES} from "@/constants/routes";
import {toast} from "sonner";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import Cactus from "@/components/shared/icons/Cactus";
import {useUserConnectionsStore} from "@/store/connection/useConnectionsStore";

const InvitePage = () => {
    const {t: u} = useTranslation("user");
    const {t: ts} = useTranslation("toast")
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get("id");
    const code = searchParams.get("code");

    // --- Fetch profile ---
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!userId || !code) {
            setError("Invalid invite link.");
            setIsFetching(false);
            return;
        }
        try {
            setIsFetching(true);
            const response = await fetchUserProfileByInviteToken({ code, userId });
            await new Promise((resolve) => setTimeout(resolve, 1500));
            if (response.success) {
                setProfile(response.data);
            } else {
                setError(response.message);
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: unknown) {
            setError("Failed to fetch invite profile.");
        } finally {
            setIsFetching(false);
        }
    }, [code, userId]);

    useEffect(() => {
        void fetchProfile();
    }, [userId, code, fetchProfile]);

    // --- Message input ---
    const [message, setMessage] = useState("");
    const MAX_LENGTH = 100;

    // --- Send request ---
    const [isSendingRequest, setIsSendingRequest] = useState<boolean>(false);

    const sendRequest = useUserConnectionsStore((state) => state.sendRequest)
    const handleSendConnectRequest = useCallback(async () => {
        try {
            if (!userId || !code) return;
            setIsSendingRequest(true);
           const result = await sendRequest(
               userId,
               code,
               message.trim()
           );
            if (result.success) {
                toast.success(ts("user.connections.request.send.success", {name: profile?.displayName}));
                router.replace(ROUTES.HOME)
            } else {
                toast.error(ts("user.connections.request.send.error", {name: profile?.displayName}));
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err: unknown) {
            toast.error(ts("user.connections.request.send.error"));
        } finally {
            setIsSendingRequest(false);
        }
    }, [code, message, profile?.displayName, router, sendRequest, ts, userId])

    useEffect(() => {
        if (user?.id === userId) {
            router.replace(ROUTES.HOME);
        }
    }, [user?.id, userId, router]);


    if (error) {
        return (
            <div className={"flex flex-col items-center gap-2 justify-center w-full px-2 md:px-6 pt-4"}>
                <div className={"w-full flex flex-row items-center h-10 justify-start"}>
                    <button
                        className={"main-header-button"}
                        onClick={() => router.replace(ROUTES.HOME)}
                        disabled={isFetching || isSendingRequest}
                    >
                        <ChevronLeft className={"size-7 mx-auto"}/>
                    </button>
                </div>
                <Cactus className={"w-24 h-16"}/>
                <p className={"text-center text-base"}>
                    {u("invite.error")}
                </p>
            </div>
        );
    }

    return (
        <div className={"h-full px-2 md:px-6 pt-4 w-full"}>
            <div className={"w-full flex flex-row items-center h-10 justify-start"}>
                <button
                    className={"main-header-button"}
                    onClick={() => router.replace(ROUTES.HOME)}
                    disabled={isFetching || isSendingRequest}
                >
                    <ChevronLeft className={"size-7 mx-auto"}/>
                </button>
            </div>
            <div className={"flex flex-col w-full items-center"}>
                <div
                    className={"w-32 h-32 border-4 border-primary p-1 rounded-full"}
                >
                    <div className={"w-[112px] h-[112px] rounded-full relative"}>
                        {!isFetching && !error && (
                            <Image
                                src={profile?.avatarUrl ?? "/assets/images/avatar.png"}
                                alt={"profile photo"}
                                fill
                                priority
                                sizes={"112px"}
                                className={"object-contain rounded-full"}
                            />
                        )}
                        {isFetching ?? <Skeleton className={"absolute top-0 right-0 w-[112px] h-[112px] rounded-full"}/>}
                    </div>
                </div>
                {!isFetching && !error && (
                    <h2 className={"text-3xl mt-1 font-semibold text-foreground"}>
                        {profile?.displayName}
                    </h2>
                )}
                {isFetching && <Skeleton className={"w-36 h-9 mt-2 rounded-full"}/>}
            </div>
            <div className={"w-full flex flex-col items-center gap-2 mt-8"}>
                <div className="w-full relative">
                    <textarea
                        className={"bg-transparent resize-none border border-background-m rounded-2xl focus:!ring-foreground-200 w-full min-h-16 px-3 py-2 text-base custom-scrollbar overflow-y-auto"}
                        placeholder={"Message"}
                        maxLength={MAX_LENGTH}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <span className="absolute bottom-2 right-2 text-xs text-foreground-400">
                        {message.length}/{MAX_LENGTH}
                    </span>
                </div>
                <button
                    className={"button-filled bg-primary text-primary-foreground h-12 w-full rounded-full"}
                    onClick={() => handleSendConnectRequest()}
                    disabled={isFetching || isSendingRequest}
                >
                    <ContentWithLoader isLoading={isFetching || isSendingRequest}>
                        {u("connections.button.send_request")}
                    </ContentWithLoader>
                </button>
                <button
                    className={"auth-form-button-outline h-12 w-full rounded-full"}
                    onClick={() => router.replace(ROUTES.HOME)}
                    disabled={isFetching || isSendingRequest}
                >
                    <ContentWithLoader isLoading={isFetching || isSendingRequest}>
                        {u("connections.button.cancel")}
                    </ContentWithLoader>
                </button>
            </div>
        </div>
    )
}

export default InvitePage;