"use client"

import { create } from "zustand"
import {Moment} from "@/types/moment";
interface UpdateMomentVisibilityDialogState {
    open: boolean
    selectedMoment: Moment | null
    openDialog: (moment: Moment) => void
    closeDialog: () => void,
}

export const useUpdateMomentVisibilityDialogStore = create<UpdateMomentVisibilityDialogState>((set) => ({
    open: false,
    selectedMoment: null,
    openDialog: (moment) => set({ open: true, selectedMoment: moment }),
    closeDialog: () => set({ open: false, selectedMoment: null }),
}))
