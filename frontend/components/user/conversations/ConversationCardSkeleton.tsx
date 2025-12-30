import React from "react";
import {Skeleton} from "@/components/ui/skeleton";

const ConversationCard = () => {
    const random = Math.random() < 0.5;
    return (
        <button
            className={`w-full p-2 flex rounded-xl hover:bg-background-200 flex-row items-center gap-2`}
        >
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
                className={"w-full h-full flex flex-col gap-1 justify-center items-center overflow-hidden"}
            >
                <div className="flex flex-row w-full items-center gap-2">
                    <div className="flex-1 truncate font-medium text-left">
                        <Skeleton className={"w-28 h-4 rounded-full"}></Skeleton>
                    </div>
                    <Skeleton className={"w-12 h-4 rounded-full"}></Skeleton>
                </div>
                <div className="flex flex-row justify-between w-full items-center gap-2">
                    <Skeleton className={"w-36 h-4 rounded-full"}/>
                    {random ? (
                        <Skeleton className={"size-2.5 rounded-full"}/>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </button>
    )
}




export default ConversationCard;

