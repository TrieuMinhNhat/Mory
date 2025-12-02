import React from "react";
import {Skeleton} from "@/components/ui/skeleton";


const ReceivedConnectionRequestItemSkeleton = () => {

    return (
        <div
            className="bg-background-100 hover:bg-background-300 hover:cursor-pointer rounded-xl flex flex-row gap-2 shrink-0 p-2"
        >
            <Skeleton className={"rounded-full shrink-0 w-16 h-16"}/>
            <div className={"flex flex-col w-full"}>
                <div className="flex flex-row w-full justify-between h-4 items-center gap-2">
                    <Skeleton className={"rounded-full w-1/3 h-full"}/>
                    <Skeleton className={"rounded-full w-1/4 h-full"}/>
                </div>
                <div className="flex flex-row w-full items-center gap-1 h-6">
                    <div className="*:data-[slot=avatar]:ring-background flex -space-x-1 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="size-4 rounded-full" />
                        ))}
                    </div>
                    <Skeleton className={"rounded-full w-1/3 h-4"}/>
                </div>
                <div className={`flex flex-row w-full gap-2`}>
                    <Skeleton className={"w-full h-8 rounded-full"}/>
                    <Skeleton className={"w-full h-8 rounded-full"}/>
                </div>
            </div>
        </div>
    )
}

export default ReceivedConnectionRequestItemSkeleton;