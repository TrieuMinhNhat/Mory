import React from "react";
import {Skeleton} from "@/components/ui/skeleton";

const AddMemberItemSkeleton = () => {
    return (
        <button
            className="bg-background-100 h-fit hover:bg-background-200 rounded-full hover:cursor-pointer flex flex-row gap-2 items-center justify-center shrink-0 p-2 pr-4"
        >
            <Skeleton className={"w-10 h-10 relative rounded-full shrink-0"}/>
            <div className={"w-full"}>
                <Skeleton className={"h-6 w-32 rounded-full"}/>
            </div>
            <Skeleton className={`w-4 h-4 shrink-0 rounded-full`}/>
        </button>
    )
}

export default AddMemberItemSkeleton;