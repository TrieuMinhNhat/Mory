"use client"

import Image from "next/image";
import React from "react";
import {UserPreview} from "@/types/user";
import {CheckCheck} from "lucide-react";

interface Props {
    readers: UserPreview[];
    index: number;
    messagesLength: number;
    lastReadMessageIndex: number;
}

const ReadersRow = ({
    readers,
    index,
    messagesLength,
    lastReadMessageIndex,
}: Props) => {
    return (
        <>
            {(readers.length > 0 || index === messagesLength - 1) && (
                <div className={"flex flex-row self-end gap-0.5 max-w-[80%]"}>
                    {(index > lastReadMessageIndex && index === messagesLength - 1) && (
                        <div className={"size-[18px] rounded-full ring-1 ring-background-m flex justify-center items-center"}>
                            <CheckCheck className={"size-4 text-foreground-200"}/>
                        </div>
                    )}
                    {readers.slice(0, 6).map(u => (
                        <div key={u.id} className={"relative size-[18px] rounded-full"}>
                            <Image
                                src={u.avatarUrl || "/assets/images/avatar.png"}
                                alt={u.displayName ?? "unknow"}
                                sizes={"16px"}
                                fill
                                className="rounded-full object-cover"
                            />
                        </div>
                    ))}

                    {readers.length > 6 && (
                        <>
                            {(readers.length === 7) ? (
                                <div key={readers[6].id}
                                     className={"relative size-[18px] rounded-full"}
                                >
                                    <Image
                                        src={readers[6].avatarUrl || "/assets/images/avatar.png"}
                                        alt={readers[6].displayName ?? "unknown"}
                                        sizes={"16px"}
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div
                                    key={readers[7].id}
                                    className={"relative size-[18px] items-center justify-center flex rounded-full bg-background-200 text-xs"}
                                >
                                    +{readers.length - 6}
                                </div>
                            )
                            }
                        </>
                    )}

                </div>
            )}
        </>
    )
}

export default ReadersRow;