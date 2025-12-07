"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js";
import Stop from "@/components/user/moment/icons/Stop";
import Microphone from "@/components/user/moment/icons/Microphone";
import Pause from "@/components/user/moment/icons/Pause";
import Play from "@/components/user/moment/icons/Play";
import Download from "@/components/user/moment/icons/Download";
import Cancel from "@/components/user/moment/icons/Cancel";

type RecordPluginEvents = {
    "record-progress": (time: number) => void;
    "record-end": (blob: Blob) => void;
    "device-ready": (deviceInfo: MediaDeviceInfo) => void;
    "device-error": (err: Error) => void;
};

type RecordPluginInstance = {
    startRecording: (options?: { deviceId?: string }) => Promise<void>;
    stopRecording: () => void;
    pauseRecording: () => void;
    resumeRecording: () => void;
    isRecording: () => boolean;
    isPaused: () => boolean;
    on: <K extends keyof RecordPluginEvents>(event: K, callback: RecordPluginEvents[K]) => void;
};

interface Props {
    onRecorded?: (file: File) => void;
    onCancel: () => void;
    isRecording: boolean;
    disabled: boolean;
    setIsRecording: (v: boolean) => void;
}

const AudioRecorder = ({onRecorded, disabled, onCancel, isRecording, setIsRecording}: Props) => {
    const micRef = useRef<HTMLDivElement | null>(null);
    const playbackRef = useRef<HTMLDivElement | null>(null);

    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const [record, setRecord] = useState<RecordPluginInstance | null>(null);
    const [progress, setProgress] = useState("00:00");
    const [recordingUrl, setRecordingUrl] = useState<string>("");
    const [playbackWS, setPlaybackWS] = useState<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!micRef.current) return;

        wavesurfer?.destroy();

        const ws = WaveSurfer.create({
            container: micRef.current,
            waveColor: "rgb(240,240,240)",
            progressColor: "rgb(205,93,103)",
            barWidth: 3,
            barGap: 2,
            barRadius: 3,
            height: 36,
        });

        const recPlugin = ws.registerPlugin(
            RecordPlugin.create({
                renderRecordedAudio: false,
                continuousWaveform: true,
                continuousWaveformDuration: 10,
            })
        ) as RecordPluginInstance;

        recPlugin.on("record-progress", (time: number) => {
            const mins = Math.floor((time % 3600000) / 60000);
            const secs = Math.floor((time % 60000) / 1000);
            setProgress(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
        });

        recPlugin.on("record-end", (blob: Blob) => {
            const url = URL.createObjectURL(blob);
            setIsRecording(false);
            setProgress("00:00");
            setRecordingUrl(url);

            const file = new File([blob], "recording.webm", { type: "audio/webm" });
            onRecorded?.(file);
        });

        setWavesurfer(ws);
        setRecord(recPlugin);

        return () => ws.destroy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!recordingUrl || !playbackRef.current) return;

        playbackWS?.destroy();

        const ws = WaveSurfer.create({
            container: playbackRef.current,
            waveColor: "rgb(240,240,240)",
            progressColor: "rgb(205,93,103)",
            height: 36,
            barWidth: 3,
            barGap: 2,
            barRadius: 3,
        });

        void ws.load(recordingUrl);
        ws.on("play", () => setIsPlaying(true));
        ws.on("pause", () => setIsPlaying(false));

        setPlaybackWS(ws);

        return () => ws.destroy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recordingUrl]);

    useEffect(() => {
        if (!record) return;

        const handleProgress = (time: number) => {
            const seconds = Math.floor(time / 1000);
            if (seconds >= 10 && record.isRecording()) {
                record.stopRecording();
                setIsRecording(false);
            }
        };

        record.on("record-progress", handleProgress);

        return () => {
            // cleanup listener khi record bị thay đổi hoặc destroy
            // (RecordPlugin không có off(), nên để vậy vẫn ổn)
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [record]);

    const handleRecord = async () => {
        if (!record) return;
        if (record.isRecording() || record.isPaused()) {
            record.stopRecording();
            setIsRecording(false);
            return;
        }
        setIsRecording(true);
        await record.startRecording();
    };

    useEffect(() => {
        if (disabled && playbackWS) {
            playbackWS.stop();
            playbackWS.seekTo(0);
            setIsPlaying(false);
        }
    }, [disabled, playbackWS]);

    return (
        <div className="w-full">
            <div
                className={`flex items-center gap-2 h-16 rounded-md ${
                    recordingUrl && !isRecording ? "flex" : "hidden"
                }`}
            >
                <a
                    href={disabled ? undefined : recordingUrl}
                    download={disabled ? undefined : "recording.webm"}
                    className={`rounded-full w-fit p-3 bg-bg-dark-100 bg-opacity-80 text-fg-light-100 hover:bg-opacity-90 ${disabled && "cursor-not-allowed"}`}
                >
                    <Download className={"size-6"}/>
                </a>
                <div className={"flex flex-row items-center rounded-full bg-bg-dark-100 bg-opacity-80 gap-1 w-full h-12 pl-0 pr-4"}>
                    <button
                        className={"rounded-full w-fit p-3 bg-bg-dark-100 bg-opacity-0 text-fg-light-100 hover:bg-opacity-90"}
                        onClick={() => playbackWS?.playPause()}
                        disabled={disabled}
                    >
                        {isPlaying
                            ? <Pause className={"size-6"}/>
                            : <Play className={"size-6"}/>
                        }
                    </button>
                    <div className="flex-1">
                        <div ref={playbackRef} className={""}></div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setRecordingUrl("");
                        onCancel();
                    }}
                    disabled={disabled}
                    className={"rounded-full w-fit p-3 bg-bg-dark-100 bg-opacity-80 text-fg-light-100 hover:bg-opacity-90"}
                >
                    <Cancel className={"size-6"}/>
                </button>
            </div>
            {!isRecording && !recordingUrl && (
                <div className={"p-2 bg-bg-dark-200 w-fit mx-auto bg-opacity-50 h-16 rounded-full"}>
                    <button
                        onClick={handleRecord}
                        disabled={disabled}
                        className={"rounded-full w-fit mx-auto p-3 bg-primary text-primary-foreground"}
                    >
                        <Microphone className={"size-6"}/>
                    </button>
                </div>
            )}
            <div className={`flex-row gap-2 bg-bg-dark-100 bg-opacity-80 pl-4 pr-2 h-16 rounded-full items-center ${isRecording ? "flex" : "hidden"}`}>
                <div className="relative h-9 w-full">
                    <div ref={micRef} className="absolute inset-0 h-16"></div>
                </div>
                <button
                    onClick={handleRecord}
                    disabled={disabled}
                    className={"rounded-full w-fit mx-auto p-3 bg-primary text-primary-foreground"}
                >
                    <Stop className={"size-6"}/>
                </button>
            </div>
        </div>
    );
}

export default AudioRecorder;