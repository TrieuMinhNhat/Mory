"use client"

import {useReplyToMomentDrawerStore} from "@/store/conversation/useReplyToMomentDrawerStore";
import {Drawer, DrawerContent, DrawerDescription, DrawerTitle} from "@/components/ui/drawer";
import Image from "next/image";
import React, {useState} from "react";
import {useTranslation} from "next-i18next";
import {useWS} from "@/hooks/useWs";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import SmileFace from "@/components/user/conversations/icons/SmileFace";
import {EmojiPicker, EmojiPickerContent, EmojiPickerFooter, EmojiPickerSearch} from "@/components/ui/emoji-picker";
import Send from "@/components/user/conversations/icons/Send";

const ReplyToMomentDrawer = () => {
    const {t: u} = useTranslation("user")
    const {t: ts} = useTranslation("toast")
    const {open, selectedMoment, closeDrawer} = useReplyToMomentDrawerStore();

    const {sendMessage} = useWS();

    const [text, setText] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const handleSendMessage = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (!selectedMoment) return;
        if (!text.trim()) return;
        try {
            const content = {
                recipientId: selectedMoment.user.id,
                text: text.trim(),
                replyToMomentId: selectedMoment.id
            }
            sendMessage(content);
            setText("")
            toast.success(ts("user.reply_moment.success"));
            closeDrawer();
        } catch (error) {
            toast.error(ts("user.reply_moment.error"))
            console.log("Fail to send message", error);
        }
    }

    if (!selectedMoment) return;
    return (
        <Drawer open={open} onOpenChange={(o) => !o && closeDrawer()}>
            <DrawerContent onClick={(e) => e.stopPropagation()}>
                <div className="drawer-content">
                    <DrawerTitle className={"w-full text-center text-base mb-4"}>
                        {u("chat.moment.replying_to", {name: selectedMoment.user.displayName})}
                    </DrawerTitle>
                    <DrawerDescription/>
                    <div className={"size-24 relative rounded-xl mx-auto"}>
                        <Image
                            src={selectedMoment.mediaUrl ?? "/assets/images/avatar.png"}
                            alt={selectedMoment.caption ?? ""}
                            fill
                            sizes={"96"}
                            className={"rounded-xl object-cover"}
                        />
                    </div>
                    <form onSubmit={handleSendMessage} className={"w-full flex flex-row items-center gap-2"}>
                        <div className="relative w-full h-fit py-2">
                            <Input
                                type="text"
                                placeholder="Type a message..."
                                className={"shadow-none ring-1 ring-transparent focus:!ring-foreground text-base font-normal px-5 pl-5 pr-10 text-foreground border-background-m bg-background-200 placeholder:text-foreground-200 w-full rounded-full h-10"}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                            <Popover onOpenChange={setIsOpen} open={isOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type={"button"}
                                        className={`rounded-full absolute right-3 top-1/2 -translate-y-1/2 text-foreground`}
                                    >
                                        <SmileFace className={"size-6"} />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-fit p-0 bg-background-200 border-none" align={"end"}>
                                    <EmojiPicker
                                        className="h-[342px]"
                                        onEmojiSelect={({ emoji }) => {
                                            setText(prev => prev + emoji);
                                            console.log(emoji);
                                        }}
                                    >
                                        <EmojiPickerSearch />
                                        <EmojiPickerContent/>
                                        <EmojiPickerFooter />
                                    </EmojiPicker>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className={`shrink-0 h-10 border border-background-m bg-background-200 rounded-full w-10 flex items-center justify-center ${(text.trim().length > 0 && !isOpen) && "ring-1 ring-foreground"}`}>
                            <button
                                type="submit"
                                className={`rounded-full text-foreground ${(!text.trim()) && "cursor-not-allowed  opacity-60"}`}
                                disabled={!text.trim()}
                            >
                                <Send className={"size-6"} />
                            </button>
                        </div>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default ReplyToMomentDrawer;