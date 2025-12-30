"use client"

import { create } from "zustand"
import {Moment} from "@/types/moment";

interface ReplyToMessageDrawerState {
    open: boolean,
    selectedMoment: Moment | null,
    openDrawer: (moment: Moment) => void,
    closeDrawer: () => void
}

export const useReplyToMomentDrawerStore = create<ReplyToMessageDrawerState>((set) => ({
    open: false,
    selectedMoment: null,

    openDrawer: (moment) => set({ open: true, selectedMoment: moment }),
    closeDrawer: () => set({ open: false, selectedMoment: null }),
}))
