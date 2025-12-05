import Image from "next/image";
import React from "react";
import {getOtherUserFromConnection, Connection} from "@/types/connections";


interface AddMemberItemProps {
    connection: Connection,
    checked: boolean,
    onCheckedChange: (id: string, checked: boolean) => void;
}
const AddMemberItem = ({connection, checked, onCheckedChange}: AddMemberItemProps) => {
    const otherUser = getOtherUserFromConnection(connection);
    return (
        <button
            onClick={() => onCheckedChange(connection.id, !checked)}
            key={connection.id}
            className="bg-background-100 h-fit hover:bg-background-200 rounded-full hover:cursor-pointer flex flex-row gap-2 items-center justify-center shrink-0 p-2 pr-4"
        >
            <div className={"w-10 h-10 relative rounded-full shrink-0"}>
                <Image
                    src={otherUser.avatarUrl ?? "/assets/images/avatar.png"}
                    alt={"avatar"}
                    fill
                    sizes={"40px"}
                    className="rounded-full object-cover"
                />
            </div>
            <h2 className={"truncate font-medium w-full text-left"}>
                {otherUser.displayName}
            </h2>
            <div
                className={`w-4 h-4 shrink-0 flex items-center justify-center rounded-full border transition-all ${
                    checked ? "bg-primary border-primary" : "border-background-m bg-transparent"
                }`}
            >
            </div>
        </button>
    )
}

export default AddMemberItem;