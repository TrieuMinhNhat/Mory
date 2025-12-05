"use client"

import StoryTypeButton from "@/components/user/story/StoryTypeButton";
import Journey from "@/components/user/story/icons/Journey";
import BeforeAfter from "@/components/user/story/icons/BeforeAfter";
import Challenge from "@/components/user/story/icons/Challenge";
import Album from "@/components/user/story/icons/Album";
import React from "react";
import {useTranslation} from "next-i18next";
import {CreateStoryView} from "@/types/story";

interface Props {
    onSelect: (c: CreateStoryView) => void;
}

const SelectStoryTypeView = ({ onSelect }: Props) => {
    const {t: u} = useTranslation("user");
    return (
        <div className={"w-full flex flex-col gap-2 items-center"}>
            <p>
                {u("story.create_story.selection.guide")}
            </p>
            <div
                className={"w-full flex flex-col gap-2 items-center"}
            >
                <StoryTypeButton
                    title={u("story.create_story.selection.journey.title")}
                    description={u("story.create_story.selection.journey.des")}
                    icon={Journey}
                    onClick={() => onSelect(CreateStoryView.JOURNEY)}
                />
                <StoryTypeButton
                    title={u("story.create_story.selection.before_after.title")}
                    description={u("story.create_story.selection.before_after.des")}
                    icon={BeforeAfter}
                    onClick={() => onSelect(CreateStoryView.BEFORE_AFTER)}
                />
                <StoryTypeButton
                    title={u("story.create_story.selection.challenge.title")}
                    description={u("story.create_story.selection.challenge.des")}
                    icon={Challenge}
                    onClick={() => onSelect(CreateStoryView.CHALLENGE)}
                />
                <StoryTypeButton
                    title={u("story.create_story.selection.album.title")}
                    description={u("story.create_story.selection.album.des")}
                    icon={Album}
                    onClick={() => onSelect(CreateStoryView.ALBUM)}
                />

            </div>
        </div>
    )
}

export default SelectStoryTypeView;