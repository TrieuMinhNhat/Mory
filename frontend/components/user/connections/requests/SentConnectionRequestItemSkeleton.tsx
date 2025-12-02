import React from "react";
import {Skeleton} from "@/components/ui/skeleton";

const SentConnectionRequestItemSkeleton = () => {
    return (
        <div
            className="bg-background-100 h-fit rounded-lg flex flex-row gap-2 items-center justify-center shrink-0 p-2"
        >
            <Skeleton className="rounded-full shrink-0 w-16 h-16"/>
            <div className={"flex flex-col gap-1 w-full"}>
                <div className="flex flex-row w-full h-4 items-center gap-2">
                    <Skeleton className={"rounded-full w-1/3 h-full"}/>
                </div>
                <div className="flex flex-row h-6 w-full items-center">
                    <div className="*:data-[slot=avatar]:ring-background flex -space-x-1 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="size-4 rounded-full" />
                        ))}
                    </div>
                    <Skeleton className={"rounded-full w-1/3 h-4"}/>
                </div>
            </div>
            <Skeleton className={"w-[200px] h-9 button-filled bg-background-300 rounded-full"}/>
        </div>
    )
}

export default SentConnectionRequestItemSkeleton;