import { create } from "zustand";

interface AudioPlayerStore {
    stopAll: boolean;
    triggerStop: () => void;
    resetStop: () => void;
}

export const useAudioPlayerStore = create<AudioPlayerStore>((set) => ({
    stopAll: false,
    triggerStop: () => set({ stopAll: true }),
    resetStop: () => set({ stopAll: false }),
}));
