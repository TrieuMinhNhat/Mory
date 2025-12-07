import {useState} from "react";
import Image from "next/image";
import {Moment, Story, StoryPreview, StoryType} from "@/types/moment";
import {getStoryTypeIcon} from "@/utils/story";
import EmptyList from "@/components/shared/EmptyList";
import {useTranslation} from "next-i18next";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/constants/routes";
import {useStoryDetailsStore} from "@/store/story/useStoryDetailsStore";
import {useAuthStore} from "@/store/useAuthStore";

interface Props {
    moment?: Moment,
    story?: Story | StoryPreview,
    onClick?: () => void,
    inHomepage?: boolean,
    showStoryInfo?: boolean,
    showHoverRing?: boolean,
    showCurrentRing?: boolean,
    showUserInfo?: boolean,
    size:number
}

const MomentImageGridItem = ({
                                 moment,
                                 story,
                                 onClick,
                                 inHomepage = false,
                                 showStoryInfo = true,
                                 showHoverRing = false,
                                 showCurrentRing = false,
                                 showUserInfo = true,
                                 size
}: Props) => {
    const {t: c} = useTranslation("common");
    const {t: u} = useTranslation("user");
    const [hasError, setHasError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const user = useAuthStore((state) => state.user);

    const setStory = useStoryDetailsStore((s) => s.setStory)

    const router = useRouter();

    const Icon = getStoryTypeIcon(moment?.story?.type ?? StoryType.JOURNEY);

    if (hasError) {
        return (
            <button
                className="flex flex-col items-center justify-center ring-0 hover:ring-2 hover:ring-foreground-200 bg-background-200 text-foreground-300 cursor-pointer rounded-xl w-full aspect-square"
                onClick={(e) => {
                    e.stopPropagation();
                    setHasError(false);
                    setReloadKey((k) => k + 1);
                }}
            >
                <EmptyList message={""} className={"w-20 h-12"}/>
                <div className={"w-fit rounded-full py-2 px-3 bg-background-m hover:bg-background-300"}>
                    {c("button.reload")}
                </div>
            </button>
        );
    }

    return (
        <div
            tabIndex={0}
            className={`relative rounded-xl hover:cursor-pointer ring-0 group ${showCurrentRing && "ring-2 ring-primary"} ${showHoverRing && "hover:ring-2 hover:ring-foreground-200"}`}
            style={{
                width: size,
                height: size,
            }}
            role={"button"}
            onClick={() => {if (onClick) onClick()}}
        >
            <Image
                key={reloadKey}
                src={moment?.mediaUrl ?? "/assets/images/avatar.png"}
                alt={moment?.caption ?? "image"}
                fill
                sizes={`${size}px`}
                className="object-cover rounded-xl"
                onError={() => setHasError(true)}
            />
            {inHomepage ? (
                <>
                    {moment?.story && showStoryInfo && (
                        <div
                            className={`w-full flex gap-1 flex-row items-center justify-between px-1 pt-1 absolute top-0
                            `}
                        >
                            <button
                                className={"bg-bg-dark-100/70 hover:bg-bg-dark-100 py-1 flex gap-1 items-center flex-row px-2 rounded-full"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (moment?.story) {
                                        setStory(moment.story)
                                        router.push(ROUTES.STORY.DETAILS(moment.story.id))
                                    }
                                }}
                                style={{ maxWidth: size - 44 }}
                            >
                                <Icon className={"size-3 shrink-0 text-fg-light-100"}/>
                                <p
                                    className={"text-xs text-fg-light-100 truncate whitespace-nowrap overflow-hidden"}
                                    style={{ maxWidth: size - 44 }}
                                >
                                    {moment.story.title}
                                </p>
                            </button>
                            {story && "totalMoments" in story && story?.totalMoments && story?.totalMoments > 1 && showStoryInfo && (
                                <div className={"text-xs font-medium text-fg-light-100 rounded-full py-1 pl-1 pr-1.5 bg-bg-dark-100/70"}>
                                    +{story.totalMoments - 1}
                                </div>
                            )}
                        </div>
                    )}
                    {moment && showUserInfo && (
                        <div
                            className={`w-full flex gap-1 flex-row items-center px-1 pb-1 absolute bottom-0
                                    opacity-0 translate-y-2
                                    group-hover:opacity-100 group-hover:translate-y-0
                                    transition-all duration-200
                                `}
                        >
                            <button
                                className={"w-fit h-fit rounded-full hover:ring-1 hover:ring-primary"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (user?.id === moment?.user.id) {
                                        router.push(ROUTES.PROFILE.ME.ROOT)
                                        return;
                                    }
                                    router.push(ROUTES.PROFILE.ROOT(moment?.user.id))
                                }}
                            >
                                <Image
                                    src={moment.user.avatarUrl ?? "/assets/images/avatar.png"}
                                    alt={moment.user.displayName}
                                    sizes={"40px"}
                                    width={40}
                                    height={40}
                                    className={"object-cover rounded-full"}
                                />
                            </button>
                            <button
                                className={"bg-bg-dark-100/70 hover:bg-bg-dark-100 py-1 px-2 rounded-full"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (user?.id === moment?.user.id) {
                                        router.push(ROUTES.PROFILE.ME.ROOT)
                                        return;
                                    }
                                    router.push(ROUTES.PROFILE.ROOT(moment?.user.id))
                                }}
                            >
                                <p
                                    className={"text-sm text-fg-light-100 font-medium truncate whitespace-nowrap overflow-hidden"}
                                    style={{ maxWidth: size - 68 }}
                                >
                                    {moment.user.id === user?.id ? u("home.you") : moment.user.displayName}
                                </p>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <>
                    {showStoryInfo && story && (
                        <div
                            className={`w-full flex gap-1 flex-row items-center px-1 pt-1 absolute top-0 sm:hidden
                                `}
                        >
                            <button
                                className={"bg-bg-dark-100/70 hover:bg-bg-dark-100 py-1 flex gap-1 items-center flex-row px-2 rounded-full"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setStory(story)
                                    router.push(ROUTES.STORY.DETAILS(story.id))
                                }}
                            >
                                <Icon className={"size-3 text-fg-light-100"}/>
                                <p
                                    className={"text-sm text-fg-light-100 font-medium truncate whitespace-nowrap overflow-hidden"}
                                    style={{ maxWidth: size - 40 }}
                                >
                                    {story.title}
                                </p>
                            </button>
                        </div>
                    )}
                    {showStoryInfo && story && (
                        <div
                            className={`w-full hidden sm:flex gap-1 flex-row items-center px-1 pt-1 absolute top-0 
                                    opacity-0 -translate-y-2
                                    group-hover:opacity-100 group-hover:translate-y-0
                                    transition-all duration-200
                                `}
                        >
                            <button
                                className={"bg-bg-dark-100/70 hover:bg-bg-dark-100 py-1 flex gap-1 items-center flex-row px-2 rounded-full"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setStory(story)
                                    router.push(ROUTES.STORY.DETAILS(story.id))
                                }}
                            >
                                <Icon className={"size-3 text-fg-light-100"}/>
                                <p
                                    className={"text-fg-light-100 text-sm font-medium truncate whitespace-nowrap overflow-hidden"}
                                    style={{ maxWidth: size - 40 }}
                                >
                                    {story.title}
                                </p>
                            </button>

                        </div>
                    )}
                    {moment && showUserInfo && (
                        <div
                            className={`w-full flex gap-1 flex-row items-center px-1 pb-1 absolute bottom-0
                                    opacity-0 translate-y-2
                                    group-hover:opacity-100 group-hover:translate-y-0
                                    transition-all duration-200
                                `}
                        >
                            <button
                                className={"w-fit h-fit rounded-full hover:ring-1 hover:ring-primary"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (user?.id === moment?.user.id) {
                                        router.push(ROUTES.PROFILE.ME.ROOT)
                                        return;
                                    }
                                    router.push(ROUTES.PROFILE.ROOT(moment?.user.id))
                                }}
                            >
                                <Image
                                    src={moment.user.avatarUrl ?? "/assets/images/avatar.png"}
                                    alt={moment.user.displayName}
                                    sizes={"40px"}
                                    width={40}
                                    height={40}
                                    className={"object-cover rounded-full"}
                                />
                            </button>

                            <button
                                className={"bg-bg-dark-100/70 hover:bg-bg-dark-100 py-1 px-2 rounded-full"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (user?.id === moment?.user.id) {
                                        router.push(ROUTES.PROFILE.ME.ROOT)
                                        return;
                                    }
                                    router.push(ROUTES.PROFILE.ROOT(moment?.user.id))
                                }}
                            >
                                <p
                                    className={"text-sm text-fg-light-100 font-medium truncate whitespace-nowrap overflow-hidden"}
                                    style={{ maxWidth: size - 68 }}
                                >
                                    {moment.user.id === user?.id ? u("home.you") : moment.user.displayName}
                                </p>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};


export default MomentImageGridItem;