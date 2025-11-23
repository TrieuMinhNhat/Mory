import Cactus from "@/components/shared/icons/Cactus";
import React from "react";

const EmptyList = ({message, className}: {message: string, className?: string}) => {
    return (
        <div className="flex flex-col items-center text-foreground mt-4 gap-1 py-2">
            <Cactus className={`${className ? className : "w-24 h-16"}`}/>
            <p className={"text-center"}>{message}</p>
        </div>
    )
}

export default EmptyList;