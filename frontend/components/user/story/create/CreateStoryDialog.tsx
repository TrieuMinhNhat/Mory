import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {ChevronLeft, X} from "lucide-react";
import React, {useState} from "react";
import {useTranslation} from "next-i18next";
import {CreateStoryView} from "@/types/story";
import CreateJourneyStoryView from "@/components/user/story/create/CreateJourneyStoryView";
import CreateChallengeStoryView from "@/components/user/story/create/CreateChallengeStoryView";
import CreateBeforeAfterStoryView from "@/components/user/story/create/CreateBeforeAfterStoryView";
import CreateAlbumStoryView from "@/components/user/story/create/CreateAlbumStoryView";
import SelectStoryTypeView from "@/components/user/story/SelectStoryTypeView";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface Props {
    isOpen: boolean;
    onIsOpenChange: (isOpen: boolean) => void;
}

const CreateStoryDialog = ({ isOpen, onIsOpenChange }: Props) => {
    const {t: u} = useTranslation("user");

    const [view, setView] = useState(CreateStoryView.SELECTION);

    const renderContent = () => {
        switch (view) {
            case CreateStoryView.SELECTION:
                return <SelectStoryTypeView onSelect={setView}/>
            case CreateStoryView.JOURNEY:
                return <CreateJourneyStoryView closeDialog={() => onIsOpenChange(false)}/>
            case CreateStoryView.BEFORE_AFTER:
                return <CreateBeforeAfterStoryView closeDialog={() => onIsOpenChange(false)}/>
            case CreateStoryView.CHALLENGE:
                return <CreateChallengeStoryView closeDialog={() => onIsOpenChange(false)}/>
            case CreateStoryView.ALBUM:
                return <CreateAlbumStoryView closeDialog={() => onIsOpenChange(false)}/>
            default:
                return <SelectStoryTypeView onSelect={setView}/>
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onIsOpenChange}>
            <DialogContent className="w-full md:max-w-[500px] h-full md:h-fit md:max-h-[90vh] !py-2 md:!pb-4 flex flex-col md:rounded-xl">
                <div className={"w-full flex flex-row border-b border-background-m pb-2 md:pt-1 items-center"}>
                    <DialogClose asChild>
                        <button className={"block md:hidden rounded-full text-foreground-200 hover:text-foreground p-1 hover:bg-background-200"}>
                            <ChevronLeft className={"size-7"}/>
                        </button>
                    </DialogClose>
                    <DialogTitle className={"text-xl w-full pl-1 pr-8 md:pr-0 md:pl-8 font-medium text-left md:text-center"}>
                        {u("story.create_story.title")}
                    </DialogTitle>
                    <DialogClose asChild>
                        <button className={" hidden md:block p-1 rounded-full hover:bg-background-200"}>
                            <X className={"size-6"}/>
                        </button>
                    </DialogClose>
                    <DialogDescription></DialogDescription>
                </div>
                {/*Here*/}
                <div className={"w-full flex flex-col gap-3"}>
                    {view !== CreateStoryView.SELECTION && (
                        <>
                            <div className={"flex flex-row items-center gap-2"}>
                                <label className={"text-foreground text-base"}>
                                    {u("story.create_story.label.type")}:
                                </label>
                                <Select
                                    value={view}
                                    onValueChange={(v) => setView(v as CreateStoryView)}
                                >
                                    <SelectTrigger className="w-fit bg-background-200 gap-2 rounded-full">
                                        <SelectValue placeholder={u("story.create_story.select_type")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={CreateStoryView.JOURNEY}>
                                            {u("story.create_story.selection.journey.title")}
                                        </SelectItem>
                                        <SelectItem value={CreateStoryView.BEFORE_AFTER}>
                                            {u("story.create_story.selection.before_after.title")}
                                        </SelectItem>
                                        <SelectItem value={CreateStoryView.CHALLENGE}>
                                            {u("story.create_story.selection.challenge.title")}
                                        </SelectItem>
                                        <SelectItem value={CreateStoryView.ALBUM}>
                                            {u("story.create_story.selection.album.title")}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                    {renderContent()}
                </div>

            </DialogContent>
        </Dialog>
    )
}


export default CreateStoryDialog;