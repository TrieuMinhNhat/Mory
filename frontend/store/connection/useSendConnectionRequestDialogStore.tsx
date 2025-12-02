"use client"

import { create } from "zustand"
import {ConnectionType} from "@/types/connections"
import {UserPreview} from "@/types/user";

interface SendConnectionRequestDialogProps {
    open: boolean
    selectedUser: UserPreview | null
    oldType: ConnectionType | null
    newType: ConnectionType | null
    connect: boolean
    openDialog: (user: UserPreview, connect: boolean, oldType?: ConnectionType, newType?: ConnectionType) => void
    closeDialog: () => void
}

export const useSendConnectionRequestDialogStore = create<SendConnectionRequestDialogProps>((set) => ({
    open: false,
    selectedUser: null,
    oldType: null,
    newType: null,
    connect: false,

    openDialog: (user, connect: boolean, oldType, newType) => set(
        {
            open: true,
            selectedUser: user,
            connect: connect,
            oldType: oldType,
            newType: newType
        }
    ),
    closeDialog: () => set({ open: false, selectedUser: null, oldType: null, newType: null }),
}))
