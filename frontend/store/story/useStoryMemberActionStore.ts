"use client"


import { create } from "zustand"
import {UserPreview} from "@/types/user";
import {ConnectionTypeStatus} from "@/types/connections";
import {Story} from "@/types/moment";


interface StoryMemberActionState {
    open: boolean
    selectedMember: UserPreview | null,
    selectedStory: Story | null,
    connection: ConnectionTypeStatus | null,
    openDrawer: (member: UserPreview, story: Story, connection?: ConnectionTypeStatus) => void
    closeDrawer: () => void
}

export const useStoryMemberActionStore = create<StoryMemberActionState>((set) => ({
    open: false,
    selectedMember: null,
    selectedStory: null,
    connection: null,

    openDrawer: (member, story, connection) => set({
        open: true,
        selectedMember: member,
        selectedStory: story,
        connection: connection,
    }),
    closeDrawer: () => set({ open: false, selectedMember: null, connection: null }),
}))
