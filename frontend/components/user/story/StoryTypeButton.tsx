import React, {ElementType} from "react";
import QuestionMark from "@/components/shared/icons/QuestionMark";

interface Props {
    title: string;
    description: string;
    icon: ElementType;
    onClick: () => void;
}

const StoryTypeButton = ({title, description, icon: Icon, onClick}: Props) => {
    return (
        <div
            className={"w-full h-16 flex flex-row items-center gap-1 px-3 bg-background-200 hover:bg-background-300 has-[button:hover]:bg-background-200 rounded-full"}
            tabIndex={0}
            role={"button"}
            onClick={onClick}
        >
            <div className={"px-1 w-fit shrink-0"}>
                <Icon className={"size-8 shrink-0"}/>
            </div>
            <div className={"flex-1 flex flex-col"}>
                <p className={"text-left overflow-hidden truncate"}>
                    {title}
                </p>
                <p className={"text-left text-sm text-foreground-200 overflow-hidden truncate"}>
                    {description}
                </p>
            </div>
            <button
                className={"p-2 hover:bg-background-300 rounded-full"}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <QuestionMark className={"size-4"}/>
            </button>
        </div>
    )
}

export default StoryTypeButton;