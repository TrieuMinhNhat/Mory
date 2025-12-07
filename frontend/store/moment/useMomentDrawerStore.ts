"use client"

import { create } from "zustand"
import {Moment} from "@/types/moment"

interface MomentDrawerState {
    open: boolean
    selectedMoment: Moment | null
    storyId: string | undefined
    openDrawer: (moment: Moment, storyId?: string) => void
    closeDrawer: () => void
}

export const useMomentDrawerStore = create<MomentDrawerState>((set) => ({
    open: false,
    selectedMoment: null,
    storyId: undefined,

    openDrawer: (moment, storyId) => set({ open: true, selectedMoment: moment, storyId: storyId }),
    closeDrawer: () => set({ open: false, selectedMoment: null }),
}))
