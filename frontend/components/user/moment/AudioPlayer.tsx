"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Play from "@/components/user/moment/icons/Play";
import Pause from "@/components/user/moment/icons/Pause";
import Download from "@/components/user/moment/icons/Download";
import { useAudioPlayerStore } from "@/store/moment/useAudioPlayerStore";

interface AudioPlayerProps {
    src: string;
    disabled?: boolean;
    fileName?: string;
}

const AudioPlayer = ({ src, disabled = false, fileName = "audio.webm" }: AudioPlayerProps) => {
    const waveformRef = useRef<HTMLDivElement | null>(null);
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const playButtonRef = useRef<HTMLButtonElement | null>(null);

    const stopAll = useAudioPlayerStore((state) => state.stopAll);

    useEffect(() => {
        if (!waveformRef.current || !src) return;

        let ws: WaveSurfer | null = null;

        const init = async () => {
            try {
                ws = WaveSurfer.create({
                    container: waveformRef.current!,
                    waveColor: "rgb(240,240,240)",
                    progressColor: "rgb(205,93,103)",
                    height: 36,
                    barWidth: 3,
                    barGap: 2,
                    barRadius: 3,
                });

                await ws.load(src);
                ws.on("play", () => setIsPlaying(true));
                ws.on("pause", () => setIsPlaying(false));
                ws.on("finish", () => setIsPlaying(false));

                setWavesurfer(ws);
            } catch (err) {
                console.warn("WaveSurfer init failed:", err);
            }
        };

        void init();

        return () => {
            try {
                ws?.destroy();
            } catch {
            }
        };
    }, [src]);

    useEffect(() => {
        if (stopAll && wavesurfer) {
            wavesurfer.stop();
            wavesurfer.seekTo(0);
            setIsPlaying(false);
            playButtonRef.current?.blur();
        }
    }, [stopAll, wavesurfer]);

    return (
        <div className="flex items-center gap-2 h-16 rounded-md">
            <a
                href={disabled ? undefined : src}
                download={disabled ? undefined : fileName}
                className={`rounded-full w-fit p-3 bg-bg-dark-100 bg-opacity-80 text-fg-light-100 hover:bg-opacity-90 ${
                    disabled && "cursor-not-allowed"
                }`}
            >
                <Download className="size-6" />
            </a>

            <div
                className={
                    "flex flex-row items-center rounded-full bg-bg-dark-100 bg-opacity-80 gap-1 w-full h-12 pl-0 pr-4"
                }
            >
                <button
                    ref={playButtonRef}
                    className="rounded-full w-fit p-3 bg-bg-dark-100 bg-opacity-0 text-fg-light-100 hover:bg-opacity-90"
                    onClick={() => wavesurfer?.playPause()}
                    disabled={disabled}
                >
                    {isPlaying ? (
                        <Pause className="size-6" />
                    ) : (
                        <Play className="size-6" />
                    )}
                </button>
                <div className="flex-1">
                    <div ref={waveformRef}></div>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
