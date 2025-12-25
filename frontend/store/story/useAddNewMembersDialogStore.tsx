"use client"

import { create } from "zustand"
import { Story } from "@/types/moment"

interface AddNewMembersDialogStore {
    open: boolean
    selectedStory: Story | null
    openDialog: (story: Story) => void
    closeDialog: () => void
}


export const useAddNewMembersDialogStore = create<AddNewMembersDialogStore>((set) => ({
    open: false,
    selectedStory: null,

    openDialog: (story) => set({ open: true, selectedStory: story }),
    closeDialog: () => set({ open: false, selectedStory: null }),
}))
