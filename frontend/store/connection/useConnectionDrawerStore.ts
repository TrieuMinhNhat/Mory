"use client"

import { create } from "zustand"
import { Connection } from "@/types/connections"
import {UserPreview} from "@/types/user";

interface ConnectionDrawerState {
    open: boolean,
    selectedConnection: Connection | null,
    userPreview: UserPreview | null,
    openDrawer: (connection: Connection, user?: UserPreview) => void,
    closeDrawer: () => void
}

export const useConnectionDrawerStore = create<ConnectionDrawerState>((set) => ({
    open: false,
    selectedConnection: null,
    userPreview: null,

    openDrawer: (connection, user) => set({ open: true, selectedConnection: connection, userPreview: user }),
    closeDrawer: () => set({ open: false, selectedConnection: null, userPreview: null }),
}))
