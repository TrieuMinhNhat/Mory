"use client"

import { create } from "zustand"
import {fetchUserInviteLink} from "@/lib/services/connections.service";

interface ConnectWithMeDialogState {
    open: boolean

    inviteLink: string
    error: boolean,
    lastFetchedAt: number | null
    isFetchingInviteLink: boolean

    openDialog: () => Promise<void>
    closeDialog: () => void
}


export const useConnectWithMeDialogStore = create<ConnectWithMeDialogState>((set, get) => ({

    open: false,
    selectedConnection: null,
    inviteLink: "",
    error: false,
    isFetchingInviteLink: false,
    lastFetchedAt: null,

    openDialog: async () => {
        set({
            open: true,
        })
        const { lastFetchedAt } = get()
        const now = Date.now()
        const TEN_MIN = 10 * 60 * 1000

        if (!lastFetchedAt || now - lastFetchedAt >= TEN_MIN) {
            try {
                set({
                    isFetchingInviteLink: true,
                    error: false
                })
                const response = await fetchUserInviteLink();
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (response.success) {
                    set({
                        inviteLink: response.data.link,
                        lastFetchedAt: now
                    })
                }
            } catch {
                set({error: true})
            } finally {
                set({isFetchingInviteLink: false})
            }
        }
    },

    closeDialog: () => set({
        open: false
    })
}))
