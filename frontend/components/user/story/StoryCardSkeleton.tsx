import React from "react";
import {Skeleton} from "@/components/ui/skeleton";


const StoryCardSkeleton = () => {
    const random = Math.random() < 0.5;
    return (
        <div className={"w-full p-2 flex rounded-xl hover:bg-background-200 flex-row items-center gap-2"}>
            {random
                ? (
                    <Skeleton className={"w-16 h-16 relative shrink-0 rounded-full"}>
                    </Skeleton>
                ) : (
                    <div className={"w-16 h-16 shrink-0 relative"}>
                        <Skeleton className={"w-11 h-11 absolute bottom-0 left-0 z-10 rounded-full"}/>
                        <Skeleton className={"w-11 h-11 absolute top-0 right-0 rounded-full"}/>

                    </div>
                )}
            <div
                className={"w-full h-full flex flex-col gap-2 justify-center items-center"}
            >
                <div className={"w-full h-fit flex gap-1 flex-row items-center text-foreground"}>
                    <div className={""}>
                        <Skeleton className={"w-28 h-4 rounded-full"}></Skeleton>
                    </div>
                    <div className={"shrink-0"}>
                        <Skeleton className={"size-4 md:size-5 rounded-full"} />
                    </div>
                </div>
                <div className={"w-full flex flex-row items-center gap-1"}>
                    <Skeleton className={"w-16 h-4 rounded-full"}/>
                    <Skeleton className={"h-4 w-4 rounded-full"} />
                    <Skeleton className={"hidden sm:block w-36 h-4 rounded-full"} />
                </div>
            </div>
            <button className={"p-2 rounded-full"}>
                <Skeleton className={"w-6 h-3 rounded-full"}/>
            </button>
        </div>
    )
}


export default StoryCardSkeleton;

