import React from "react";
import {Skeleton} from "@/components/ui/skeleton";


const AvailableStoryCardSkeleton = () => {
    const random = Math.random() < 0.5;
    return (
        <div className={"w-full p-2 flex rounded-2xl hover:bg-background-200 flex-row items-center gap-2"}>
            {random
                ? (
                    <Skeleton className={"w-12 h-12 relative shrink-0 rounded-full"}>
                    </Skeleton>
                ) : (
                    <div className={"w-12 h-12 shrink-0 relative"}>
                        <Skeleton className={"w-8 h-8 absolute bottom-0 left-0 z-10 rounded-full"}/>
                        <Skeleton className={"w-8 h-8 absolute top-0 right-0 rounded-full"}/>

                    </div>
                )}
            <div
                className={"w-full h-full flex flex-col gap-2 justify-center items-center"}
            >
                <div className={"w-full h-fit flex flex-row items-center text-foreground"}>
                    <div className={"flex-1"}>
                        <Skeleton className={"w-28 h-4 rounded-full"}></Skeleton>
                    </div>
                    <div className={"shrink-0"}>
                        <Skeleton className={"size-4 md:size-5 rounded-full"} />
                    </div>
                </div>
                <div className={"w-full flex flex-row items-center gap-2"}>
                    <div className={"flex-1"}>
                        <Skeleton className={"h-4 w-4 rounded-full"} />
                    </div>
                </div>
            </div>
        </div>
    )
}


export default AvailableStoryCardSkeleton;

