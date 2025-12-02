"use client"

import { create } from "zustand"
import {UserPreview} from "@/types/user";
import {ConnectionType} from "@/types/connections";
interface ConnectionLimitReachedDialogStoreDialogState {
    open: boolean,
    selfExceeded: boolean,
    connectionType: ConnectionType | null,
    userPreview: UserPreview | null,
    openDialog: (selfExceeded: boolean, connectionType: ConnectionType, userPreview?: UserPreview) => void
    closeDialog: () => void,
}

export const useConnectionLimitReachedDialogStore = create<ConnectionLimitReachedDialogStoreDialogState>((set) => ({
    open: false,
    selfExceeded: false,
    connectionType: null,
    userPreview: null,
    openDialog: (selfExceeded, connectionType, userPreview) => {
        set({
            open: true,
            selfExceeded: selfExceeded,
            connectionType: connectionType,
            userPreview: userPreview,
        })
    },
    closeDialog: () => set({ open: false, selfExceeded: false, connectionType: null, userPreview: null }),
}))
