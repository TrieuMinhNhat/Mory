import {Story, StoryScope, StoryType, Visibility} from "@/types/moment";
import React from "react";
import Image from "next/image";
import {toDateString} from "@/utils/time";
import {getStoryTypeIcon} from "@/utils/story";
import {getVisibilityIcon} from "@/utils/moment";

interface AvailableStoryCardProps {
    story: Story;
    onClick?: () => void;
    selectedStory: Story | null;
}

const AvailableStoryCard = ({ story, onClick, selectedStory }: AvailableStoryCardProps) => {
    return (
        <button
            onClick={onClick}
            className={`w-full p-2 flex rounded-2xl hover:bg-background-200 flex-row items-center gap-2 ${selectedStory?.id === story.id && "bg-background-200"}`}
        >
            {(story.scope === StoryScope.PERSONAL || story.members.length === 1) && (
                <div
                    className={"relative shrink-0 rounded-full w-12 h-12"}
                >
                    <Image
                        src={story.creator.avatarUrl ?? "/assets/images/avatar.png"}
                        alt={story.creator.displayName}
                        fill
                        sizes={"48px"}
                        className="rounded-full object-cover"
                    />
                </div>
            )}
            {story.scope === StoryScope.GROUP &&  (
                <div className={"w-12 h-12 shrink-0 relative"}>
                    {story.members.length === 2 && (
                        <>
                            <div className={"w-8 h-8 absolute bottom-0 left-0 z-10 rounded-full"}>
                                <div className={"w-8 h-8 relative"}>
                                    <Image
                                        src={story.members[0].avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"32px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className={"w-8 h-8 absolute top-0 right-0 rounded-full"}>
                                <div className={"w-8 h-8 relative"}>
                                    <Image
                                        src={story.members[1].avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"32px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    {story.members.length === 3 && (
                        <>
                            <div className={"w-7 h-7 absolute bottom-0 left-0 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={story.members[0].avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className={"w-7 h-7 absolute top-0 left-1/2 -translate-x-1/2 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={story.members[1].avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className={"w-7 h-7 absolute bottom-0 right-0 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={story.members[2].avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    {story.members.length === 4 && (
                        <>
                            <div className={"w-7 h-7 absolute top-0 left-0 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={story.members[0].avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className={"w-7 h-7 absolute bottom-0 left-0 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={story.members[1].avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className={"w-7 h-7 absolute top-0 right-0 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={story.members[2].avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className={"w-7 h-7 absolute bottom-0 right-0 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={story.members[3].avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                    {story.members.length > 4 && (
                        <>
                            <div className={"w-7 h-7 absolute top-0 left-0 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={story.members[0].avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className={"w-7 h-7 absolute bottom-0 left-0 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={story.members[1].avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className={"w-7 h-7 absolute top-0 right-0 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={story.members[2].avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className={"w-7 h-7 absolute bottom-0 right-0 rounded-full"}>
                                <div className={"w-7 h-7 relative"}>
                                    <Image
                                        src={story.members[3].avatarUrl ?? "/assets/images/avatar.png"}
                                        alt="avatar"
                                        fill
                                        sizes={"28px"}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className={"w-7 h-7 absolute bottom-0 right-0 rounded-full"}>
                                <div className={"w-7 h-7 bg-bg-dark-100 flex items-center justify-center z-10 bg-opacity-70"}>
                                    <p className={"text-fg-light-100 font-medium"}>+{story.members.length - 3}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
            <div
                className={"w-full h-full flex flex-col gap-2 justify-center items-center"}
            >
                <div className={"w-full h-fit flex flex-row items-center text-foreground"}>
                    <h3 className={"text-base text-left font-semibold flex-1"}>{story.title}</h3>
                    <div className={"shrink-0"}>
                        {getVisibilityElement(story.visibility)}
                    </div>
                </div>
                <div className={"w-full flex flex-row items-center gap-2"}>
                    <div className={"flex-1 flex flex-row gap-1"}>
                        {getStoryTypeElement(story.type, story.duration)}
                    </div>
                    {
                        story.startDate && story.endDate && (
                            <div className={"hidden sm:flex flex-row text-sm w-fit items-center gap-1"}>
                                {story.startDate && <p className={"text-sm text-foreground-200"}>{toDateString(story.startDate)}</p>}

                                {story.endDate && (
                                    <>
                                        <span className="text-foreground-300">-</span>
                                        <p className={"text-sm text-foreground-200"}>{toDateString(story.endDate)}</p>
                                    </>
                                )}
                            </div>
                        )
                    }
                </div>
            </div>
        </button >
    )
}

const getStoryTypeElement = (type: StoryType, duration?: number): React.ReactNode => {
    const Icon = getStoryTypeIcon(type);
    if (type === StoryType.CHALLENGE) {
        return (
            <div className={"w-fit pb-[1px] px-1 flex flex-row items-center gap-0.5 bg-background-m rounded-full"}>
                <Icon className={"size-4 text-foreground"} />
                {duration && <p className={"text-sm font-medium text-foreground-200"}>{duration}</p>}
            </div>
        )
    }
    return <Icon className={"size-4 text-foreground"} />;
}

const getVisibilityElement = (visibility: Visibility): React.ReactNode => {
    const Icon = getVisibilityIcon(visibility);
    return (
        <div className={"p-0.5 rounded-full bg-background-200 w-fit"}>
            <Icon className={"size-4 md:size-5 text-foreground"} />
        </div>
    );
}

export default AvailableStoryCard;

