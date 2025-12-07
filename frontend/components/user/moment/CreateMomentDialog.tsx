"use client"

import {Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {ChevronDown, ChevronLeft, RefreshCcw, Send, Tag, Upload, X} from "lucide-react";
import React, {ChangeEvent, useEffect, useLayoutEffect, useRef, useState} from "react";
import {useTranslation} from "next-i18next";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Story, Visibility} from "@/types/moment";
import {getVisibilityIcon, getVisibilityLabel} from "@/utils/moment";
import Image from "next/image";
import {Drawer, DrawerDescription, DrawerTitle} from "../../ui/drawer";
import {DrawerContent} from "@/components/ui/drawer";
import AvatarCropDialog from "@/components/shared/AvatarCropDialog";
import SelectStoryContent from "@/components/user/moment/SelectStoryContent";
import MilestoneFilled from "@/components/user/moment/icons/MilestoneFilled";
import Milestone from "@/components/user/moment/icons/Milestone";
import Microphone from "@/components/user/moment/icons/Microphone";
import TextIcon from "@/components/user/moment/icons/TextIcon";
import AudioRecorder from "@/components/user/moment/AudioRecorder";
import {useMomentStore} from "@/store/moment/useMomentStore";
import {shallow} from "zustand/vanilla/shallow";
import {toast} from "sonner";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {useCreateMomentDialogStore} from "@/store/moment/useCreateMomentDialogStore";


const CreateMomentDialog = () => {
    const {t: u} = useTranslation("user");
    const {t: ts} = useTranslation("toast")
    const { open, selectedStory: storyStore, closeDialog } = useCreateMomentDialogStore()

    const {
        isCreatingMoment,
        createStandaloneMoment,
        createStoryMoment
    } = useMomentStore(
        (state) => ({
            isCreatingMoment: state.isCreatingMoment,
            createStandaloneMoment: state.createStandaloneMoment,
            createStoryMoment: state.createStoryMoment,
        }),
        shallow
    );

    const [momentType, setMomentType] = useState(storyStore ? "story" : "normal");
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [visibility, setVisibility] = useState<Visibility>(Visibility.ALL_FRIENDS);
    const [isMilestone, setIsMilestone] = useState<boolean>(false);
    const [caption, setCaption] = useState<string>("");
    const [isStoryDrawerOpen, setIsStoryDrawerOpen] = useState(false);
    const [selectedStory, setSelectedStory] = useState<Story | null>(storyStore);
    const [useAudio, setUseAudio] = useState<boolean>(false);
    const [audioFile, setAudioFile] = useState<File | null>(null);

    //Camera
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraDenied, setCameraDenied] = useState(false);

    const startCamera = async () => {
        if (cameraDenied) return;
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); // tắt stream cũ
        }
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode },
                audio: false,
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.warn("Camera denied:", err);
            setCameraDenied(true);
        }
    };

    const stopCamera = async () => {
        if (stream) {
            for (const track of stream.getTracks()) {
                track.stop();
            }
            await new Promise((r) => setTimeout(r, 200));
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const resetData = () => {
        setCaption("");
        setImageFile(null);
        setAudioFile(null);
        setIsMilestone(false);
    }

    useEffect(() => {
        const checkCameraPermission = async () => {
            try {
                const permission = await navigator.permissions.query({ name: "camera" as PermissionName });

                if (permission.state === "granted") {
                    setCameraDenied(false);
                    await startCamera();
                } else if (permission.state === "prompt") {
                    try {
                        await startCamera(); // gọi getUserMedia → hỏi quyền
                        setCameraDenied(false);
                    } catch (err) {
                        console.warn("User denied camera permission after prompt:", err);
                        setCameraDenied(true);
                    }
                } else if (permission.state === "denied") {
                    setCameraDenied(true);
                }

                // Theo dõi khi user thay đổi quyền (ví dụ bật lại trong Settings)
                permission.onchange = async () => {
                    if (permission.state === "granted") {
                        setCameraDenied(false);
                        await startCamera();
                    } else {
                        setCameraDenied(true);
                        await stopCamera();
                    }
                };
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                console.warn("Permissions API not supported, fallback to direct getUserMedia()");
                try {
                    await startCamera();
                    setCameraDenied(false);
                } catch {
                    setCameraDenied(true);
                }
            }
        };

        if (open) {
            void checkCameraPermission();
        } else {
            void stopCamera();
            setImage(null);
        }

        return () => {
            void stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, facingMode]);

    // Capture
    const capture = async () => {
        if (cameraDenied) return;
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const size = Math.min(vw, vh);

        const sx = (vw - size) / 2;
        const sy = (vh - size) / 2;

        canvas.width = size;
        canvas.height = size;

        if (facingMode === "user") {
            context.translate(size, 0);
            context.scale(-1, 1);
        }

        context.drawImage(video, sx, sy, size, size, 0, 0, size, size);

        canvas.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], "moment.jpg", { type: "image/jpeg" });
            setImage(URL.createObjectURL(file));
            setImageFile(file);
        }, "image/jpeg");

        await stopCamera();
    };

    const retake = async () => {
        setImage(null);
        setImageFile(null);
        await startCamera();
    };

    //Upload
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [openCrop, setOpenCrop] = useState(false);

    const handleSelectFile = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image")) return;

        setCropSrc(URL.createObjectURL(file));
        setOpenCrop(true);
        e.target.value = "";
    };

    const handleCropDone = async (croppedDataUrl: string) => {
        const res = await fetch(croppedDataUrl);
        const blob = await res.blob();
        const file = new File([blob], "cropped.jpg", { type: blob.type });

        setImage(croppedDataUrl);
        setImageFile(file);
        await  stopCamera();
        setOpenCrop(false);
    };

    //Audio
    const [isRecording, setIsRecording] = useState(false);


    const [isEditing, setIsEditing] = useState(false);

    const editableRef = useRef<HTMLDivElement>(null);
    const spanRef = useRef<HTMLSpanElement>(null);
    const outerDivRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!editableRef.current || !spanRef.current || !outerDivRef.current) return;

        const editable = editableRef.current;
        const span = spanRef.current;
        const outerWidth = outerDivRef.current.getBoundingClientRect().width;

        const style = getComputedStyle(editable);
        span.style.font = style.font;
        span.style.lineHeight = style.lineHeight;
        span.style.letterSpacing = style.letterSpacing;

        const padding =
            parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

        const rect = span.getBoundingClientRect();
        const newWidth = Math.min(Math.max(rect.width + padding, 0), outerWidth - 44);
        editable.style.width = `${newWidth}px`;

        editable.style.height = "auto";
        editable.style.height = `${editable.scrollHeight}px`;
    }, [caption, isEditing]);

    const handleCreateMoment = async () => {
        if (!imageFile) return;
        if (isCreatingMoment || isRecording) return;
        let result;
        if (momentType === "normal") {
            result = await createStandaloneMoment({
                mediaFile: imageFile,
                audioFile: audioFile,
                caption: caption,
                milestone: isMilestone,
                visibility: visibility,
            })
        } else {
            if (!selectedStory) return;
            result = await createStoryMoment(selectedStory.id, {
                mediaFile: imageFile,
                audioFile: audioFile,
                caption: caption,
                milestone: isMilestone,
            })
        }
        if (result.success) {
            toast.success(ts("user.create_moment.success"));
            closeDialog();
            resetData();
        } else {
            toast.error(ts("user.create_moment.error"))
        }

    }

    const handleOpenSettings = () => {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes("brave")) {
            toast.info(ts("browser_permission.brave"));
        } else if (ua.includes("edg")) {
            toast.info(ts("browser_permission.edge"));
        } else if (ua.includes("chrome")) {
            toast.info(ts("browser_permission.chrome"));
        } else if (ua.includes("safari") && /iphone|ipad|ipod/.test(ua)) {
            toast.info(ts("browser_permission.ios_safari"));
        } else if (ua.includes("safari")) {
            toast.info(ts("browser_permission.safari"));
        } else {
            toast.info(ts("browser_permission.default"));
        }
    };

    const handleCloseDialog = () => {
        setCaption("");
        closeDialog();
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && handleCloseDialog()}>
            <DialogContent className="w-full !outline-none md:max-w-[450px] h-full md:h-[96vh] !px-0 !py-2 flex flex-col md:rounded-xl">
                <div className={"w-full flex flex-row px-2 md:px-4 md:pt-1 items-center"}>
                    <DialogClose asChild>
                        <button className={"block md:hidden rounded-full text-foreground-200 hover:text-foreground p-1 hover:bg-background-200"}>
                            <ChevronLeft className={"size-7"}/>
                        </button>
                    </DialogClose>
                    <DialogTitle className={"text-xl w-full pl-1 pr-8 md:pr-0 md:pl-8 font-medium text-left md:text-center"}>
                        {image ? u("create_moment.edit_title") : u("create_moment.title")}
                    </DialogTitle>
                    <DialogClose asChild>
                        <button className={" hidden md:block p-1 rounded-full hover:bg-background-200"}>
                            <X className={"size-6"}/>
                        </button>
                    </DialogClose>
                    <DialogDescription></DialogDescription>
                </div>
                <div className={"w-full flex flex-col h-full gap-4 md:gap-2 justify-around"}>
                    <div className={"flex flex-row w-full gap-2 px-2 md:px-4 justify-between items-center"}>
                        <Select
                            value={momentType}
                            onValueChange={setMomentType}
                            disabled={isCreatingMoment || isRecording}
                        >
                            <SelectTrigger
                                className={`w-fit gap-1 pr-1.5 h-8 bg-background-200 hover:bg-background-300 rounded-full
                                    ${(isCreatingMoment || isRecording) && "cursor-not-allowed"}
                                `}
                            >
                                <SelectValue  placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className={"!rounded-2xl bg-background-300 !outline-none border-none !ring-none"}>
                                <SelectItem className={"rounded-xl"} value="normal">{u("moment.create.type.normal")}</SelectItem>
                                <SelectItem className={"rounded-xl"} value="story">{u("moment.create.type.story")}</SelectItem>
                            </SelectContent>
                        </Select>

                        {momentType === "normal" ? (
                            <Select
                                value={visibility}
                                onValueChange={(v: Visibility) => setVisibility(v)}
                                disabled={isCreatingMoment || isRecording}
                            >
                                <SelectTrigger
                                    className={`w-fit h-8 px-1.5 bg-background-200 hover:bg-background-300 rounded-full flex items-center gap-1
                                        ${(isCreatingMoment || isRecording) && "cursor-not-allowed"}
                                    `}
                                >
                                    <SelectValue placeholder="Visibility" />
                                </SelectTrigger>

                                <SelectContent className={"!rounded-2xl bg-background-300 !outline-none border-none !ring-none"} align={"end"}>
                                    {Object.values(Visibility).map((v) => {
                                        const Icon = getVisibilityIcon(v);
                                        return (
                                            <SelectItem className={"rounded-xl"} key={v} value={v}>
                                                <div className="flex items-center gap-1">
                                                    <Icon className="size-4 text-foreground" />
                                                    <span>{u(getVisibilityLabel(v))}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        ) : (
                            <button
                                onClick={() => setIsStoryDrawerOpen(true)}
                                disabled={isCreatingMoment || isRecording}
                                className={`h-8 rounded-full bg-background-200 hover:bg-background-300 pl-2.5 pr-1.5 text-sm font-medium flex items-center overflow-hidden
                                    ${(isCreatingMoment || isRecording) && "cursor-not-allowed"}
                                `}
                            >
                                <span className="truncate flex-1 min-w-0">
                                    {selectedStory ? selectedStory.title : u("create_moment.button.select_story")}
                                </span>
                                <ChevronDown className="ml-2 size-4 text-foreground-200 flex-shrink-0" />
                            </button>
                        )}

                    </div>

                    {image ? (
                        <div
                            className={"w-full relative max-w-md aspect-square rounded-2xl"}
                            ref={outerDivRef}
                        >
                            <div className={"relative w-full h-full"}>
                                <Image
                                    src={image}
                                    alt="capture"
                                    fill
                                    sizes={"400px"}
                                    className="rounded-2xl shadow max-w-md"
                                />
                                <button
                                    onClick={() => setIsMilestone(prev => !prev)}
                                    disabled={isCreatingMoment || isRecording}
                                    className={`absolute top-1 size-10 right-1 rounded-full text-fg-light-100 bg-bg-dark-100 bg-opacity-50
                                        ${(isCreatingMoment || isRecording) && "cursor-not-allowed"}
                                    `}
                                >
                                    {isMilestone ? <MilestoneFilled className={"size-6 mx-auto"}/> : <Milestone className={"size-6 mx-auto"}/>}
                                </button>
                                {useAudio && (
                                    <div className={"absolute bottom-2 w-full px-4"}>
                                        <AudioRecorder
                                            onCancel={() => setAudioFile(null)}
                                            isRecording={isRecording}
                                            setIsRecording={setIsRecording}
                                            disabled={isCreatingMoment}
                                            onRecorded={(file) => {
                                                setAudioFile(file)
                                            }}
                                        />
                                    </div>
                                )}
                                {!useAudio && (
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                                        <div className="relative">
                                            <div
                                                ref={editableRef}
                                                contentEditable
                                                suppressContentEditableWarning
                                                className={`inline-block bg-bg-dark-100 bg-opacity-50 rounded-2xl px-3 py-2 font-medium text-base leading-5 text-fg-light-100 break-words whitespace-pre-wrap overflow-hidden
                                                    ${(isEditing || caption === "") ? "min-w-[200px]" : ""}
                                                `}
                                                onInput={(e) => {
                                                    const el = e.currentTarget;
                                                    const text = el.textContent || "";
                                                    const maxLength = 50;

                                                    if (text.length > maxLength) {
                                                        // Cắt nội dung
                                                        el.textContent = text.slice(0, maxLength);
                                                        const range = document.createRange();
                                                        const sel = window.getSelection();
                                                        range.selectNodeContents(el);
                                                        range.collapse(false);
                                                        sel?.removeAllRanges();
                                                        sel?.addRange(range);


                                                        el.classList.add("animate-shake");
                                                        setTimeout(() => el.classList.remove("animate-shake"), 300);
                                                    }

                                                    setCaption(el.textContent || "");
                                                }}
                                                onFocus={() => setIsEditing(true)}
                                                onBlur={() => setIsEditing(false)}
                                                style={{ outline: "none" }}
                                            />
                                            <span
                                                ref={spanRef}
                                                className={"absolute invisible whitespace-pre text-base font-sans font-medium"}
                                            >
                                                    {caption}
                                                </span>
                                            {caption === "" && (
                                                <span className="absolute left-3 top-2 text-base text-fg-light-100/90 font-medium pointer-events-none">
                                                        {u("moment.create.caption_default")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full max-w-md mx-auto aspect-square rounded-2xl overflow-hidden">
                            {cameraDenied ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background-200 text-center px-4">
                                    <p className="text-foreground-200 text-sm md:text-base mb-2">
                                        Camera access is blocked
                                    </p>
                                    <p className="text-foreground-400 text-xs mb-4">
                                        Please allow camera access in your browser settings to capture a moment.
                                    </p>
                                    <button
                                        onClick={handleOpenSettings}
                                        className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
                                    >
                                        View Instructions
                                    </button>
                                </div>
                            ) : (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className={`absolute inset-0 w-full h-full object-cover ${
                                        facingMode === "user" ? "scale-x-[-1]" : ""
                                    }`}
                                />
                            )}
                        </div>
                    )}

                    {image && (
                        <button
                            disabled={isCreatingMoment || isRecording}
                            className={`rounded-full w-fit mx-auto p-2 bg-background-200 hover:bg-background-300 text-foreground-200 hover:text-foreground
                                ${(isCreatingMoment || isRecording) && "cursor-not-allowed"}
                            `}
                            onClick={() => {
                                setUseAudio(prev => !prev);
                                if (useAudio) {
                                    setAudioFile(null);
                                }
                            }}
                        >
                            {useAudio ? (
                                <TextIcon className={"size-6"}/>
                            ) : (
                                <Microphone className={"size-6"}/>
                            )}

                        </button>
                    )}

                    {image ? (
                        <div className={"flex flex-row justify-evenly w-full items-center"}>
                            <button
                                disabled={isCreatingMoment || isRecording}
                                className={`w-16 h-16 rounded-full text-foreground-200 hover:text-foreground hover:bg-background-200
                                    ${(isCreatingMoment || isRecording) && "cursor-not-allowed"}
                                `}
                                onClick={retake}
                            >
                                <X className={"size-9 stroke-2 mx-auto"}/>
                            </button>
                            <button
                                disabled={isCreatingMoment || isRecording || (momentType === "story" && !selectedStory)}
                                className={`w-20 h-20 rounded-full bg-background-200 text-foreground-200 hover:bg-background-300 hover:text-foreground
                                    ${(isCreatingMoment || isRecording || (momentType === "story" && !selectedStory)) && "cursor-not-allowed"}
                                `}
                                onClick={handleCreateMoment}
                            >
                                <ContentWithLoader isLoading={isCreatingMoment}>
                                    <Send className={"size-10 mx-auto translate-x-[-2px] translate-y-[1px]"}/>
                                </ContentWithLoader>
                            </button>
                            <button
                                disabled={isCreatingMoment || isRecording}
                                className={`w-16 h-16 rounded-full text-foreground-200 hover:text-foreground hover:bg-background-200
                                    ${(isCreatingMoment || isRecording) && "cursor-not-allowed"}
                                `}
                            >
                                <Tag className={"size-9 stroke-2 mx-auto"}/>
                            </button>
                        </div>
                    ) : (
                        <div className={"flex flex-row justify-evenly w-full items-center"}>
                            <button
                                disabled={isCreatingMoment || isRecording}
                                className={`w-16 h-16 rounded-full text-foreground-200 hover:text-foreground hover:bg-background-200
                                    ${(isCreatingMoment || isRecording) && "cursor-not-allowed"}
                                `}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className={"size-10 stroke-2 mx-auto"}/>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                hidden
                                accept="image/*"
                                onChange={handleSelectFile}
                            />
                            <button
                                disabled={isCreatingMoment || isRecording}
                                className={`w-20 h-20 rounded-full border-primary border-2
                                    ${(isCreatingMoment || isRecording) && "cursor-not-allowed"}
                                `}
                                onClick={capture}
                            >
                                <div className={"w-[72px] h-[72px] bg-foreground-200 hover:bg-foreground rounded-full mx-auto"}>
                                </div>
                            </button>
                            <button
                                disabled={isCreatingMoment || isRecording}
                                className={`w-16 h-16 rounded-full text-foreground-200 hover:text-foreground hover:bg-background-200
                                    ${(isCreatingMoment || isRecording) && "cursor-not-allowed"}
                                `}
                                onClick={() => setFacingMode(facingMode === "user" ? "environment" : "user")}
                            >
                                <RefreshCcw className={"size-10 stroke-2 mx-auto"}/>
                            </button>
                        </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                </div>

            </DialogContent>
            <Drawer open={isStoryDrawerOpen} onOpenChange={setIsStoryDrawerOpen}>
                <DrawerTitle></DrawerTitle>
                <DrawerDescription></DrawerDescription>
                <DrawerContent className={"h-[60vh]"}>
                    <SelectStoryContent
                        selectedStory={selectedStory}
                        onSelectStory={(story: Story) => {
                            setSelectedStory(story);
                            setIsStoryDrawerOpen(false);
                        }}
                    />
                </DrawerContent>
            </Drawer>
            <AvatarCropDialog
                open={openCrop}
                fileUrl={cropSrc || ""}
                onClose={() => setOpenCrop(false)}
                onCropDone={(url) => void handleCropDone(url)}
            />
        </Dialog>
    )
}

export default CreateMomentDialog;