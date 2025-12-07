import Image from "next/image";
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {timeAgo} from "@/utils/time";
import {useTranslation} from "next-i18next";
import {Moment, Visibility} from "@/types/moment";
import {getVisibilityIcon} from "@/utils/moment";
import {useAuthStore} from "@/store/useAuthStore";
import MilestoneFilled from "@/components/user/moment/icons/MilestoneFilled";
import AudioPlayer from "@/components/user/moment/AudioPlayer";

const MomentCarouselItem = ({ moment }: { moment: Moment }) => {
    const {t: u} = useTranslation("user");

    const user = useAuthStore((state) => state.user);

    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState(0);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize(Math.min(width, height));
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const spanRef = useRef<HTMLSpanElement>(null);
    const [captionWidth, setCaptionWidth] = useState(150);

    useLayoutEffect(() => {
        if (!spanRef.current || !ref.current) return;
        const outerWidth = ref.current.getBoundingClientRect().width;
        const span = spanRef.current;
        const rect = span.getBoundingClientRect();
        const padding = 24;
        const newWidth = Math.min(Math.max(rect.width + padding, 0), outerWidth - 44);
        setCaptionWidth(newWidth);
    }, [size, moment.caption]);


    return (
        <div className={"w-full h-full pt-[120px]"}>
            <div className={"w-full h-full flex flex-col pb-16 md:px-2 pt-4"}>
                <div className={"mx-auto w-fit h-fit flex flex-row items-center gap-2"}>
                    <div className={"w-12 h-12 rounded-full relative"}>
                        <Image
                            src={moment.user?.avatarUrl ?? "/assets/images/avatar.png"}
                            alt="avatar"
                            fill
                            sizes={"48px"}
                            className="rounded-full object-cover"
                        />
                    </div>
                    <div className={"flex flex-col gap-1"}>
                        <h3 className={"font-medium leading-none"}>
                            {user?.id === moment.user.id ? u("home.you") : moment.user?.displayName}
                        </h3>
                        <div className={"text-foreground-200 flex flex-row gap-1 text-sm font-medium leading-none"}>
                        <span>
                            {(() => {
                                const { key, count } = timeAgo(moment?.createdAt);
                                return count ? u(key, { count }) : u(key);
                            })()}
                        </span>
                            {getVisibilityElement(moment.visibility)}
                        </div>
                    </div>
                </div>

                <div className="mt-2 flex overflow-hidden w-full h-full">
                    <div ref={ref}
                         className="flex-shrink-0 w-full items-center justify-center flex relative"
                    >
                        {size > 0 && (
                            <div style={{ width: size, height: size }} className="m-auto items-center  relative">
                                <Image
                                    src={moment?.mediaUrl ?? "/assets/images/avatar.png"}
                                    alt="avatar"
                                    className="object-cover rounded-2xl"
                                    fill
                                    priority
                                    sizes={`${size}px`}
                                />
                                {moment.milestone && (
                                    <div
                                        className={"absolute top-1 size-10 right-1 flex items-center justify-center rounded-full text-fg-light-100 bg-bg-dark-100 bg-opacity-50"}
                                    >
                                        <MilestoneFilled className={"size-6"}/>
                                    </div>
                                )}
                                {moment.audioUrl && (
                                    <div className={"absolute bottom-2 w-full px-4"}>
                                        <AudioPlayer src={moment.audioUrl}/>
                                    </div>
                                )}
                                {(moment.caption && !moment.audioUrl) && (
                                    <div className="absolute bottom-2 w-full px-4">
                                        <div
                                            className="relative flex items-center justify-center mx-auto"
                                            style={{ width: `${captionWidth}px` }}
                                        >
                                            <div
                                                className="inline-block bg-bg-dark-100 bg-opacity-50 rounded-2xl px-3 py-2 font-medium text-base leading-5 text-fg-light-100 text-center break-all whitespace-pre-wrap overflow-hidden"
                                                style={{
                                                    outline: "none",
                                                }}
                                            >
                                                {moment.caption}
                                            </div>
                                            <span
                                                ref={spanRef}
                                                className="absolute invisible px-3 whitespace-pre text-base leading-5 font-sans font-medium"
                                            >
                                                {moment.caption}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

const getVisibilityElement = (visibility: Visibility): React.ReactNode => {
    const Icon = getVisibilityIcon(visibility);
    return (
        <Icon className={"size-4 text-foreground"} />
    );
}

export default MomentCarouselItem;
