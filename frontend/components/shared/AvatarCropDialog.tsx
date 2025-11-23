"use client";

import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import Cropper, { Area } from "react-easy-crop";
import React, { useCallback, useState } from "react";
import { getCroppedImg } from "@/utils/cropImage";
import {useTranslation} from "next-i18next";
import {X} from "lucide-react";

interface Props {
    fileUrl: string;
    open: boolean;
    onClose: () => void;
    onCropDone: (croppedDataUrl: string) => void;
}

const AvatarCropDialog = ({ fileUrl, open, onClose, onCropDone }: Props) => {
    const {t: u} = useTranslation("user");

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_a: Area, area: Area) => {
        setCroppedAreaPixels(area);
    }, []);

    const handleCrop = async () => {
        if (!fileUrl || !croppedAreaPixels) return;
        const croppedImage = await getCroppedImg(fileUrl, croppedAreaPixels);
        onCropDone(croppedImage);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[400px] rounded-xl bg-background border-none overflow-hidden z-[120] flex flex-col"
            >
                <DialogHeader className={"w-full items-center"}>
                    <DialogTitle className={"text-center w-full p-0 md:pr-0 md:pl-8"}>
                        {u("avatar_crop.title")}
                    </DialogTitle>
                    <DialogClose asChild>
                        <button className={"hidden md:block p-1 rounded-full hover:bg-background-200"}>
                            <X className={"size-6"}/>
                        </button>
                    </DialogClose>
                </DialogHeader>

                <div className="relative flex-1 min-h-[300px] aspect-square rounded-xl bg-background">
                    <Cropper
                        image={fileUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="rect"
                        showGrid={true}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        style={{
                            containerStyle: { borderRadius: '12px', overflow: 'hidden' },
                            mediaStyle: { borderRadius: '12px' },
                        }}
                    />
                </div>

                <div className={"w-full flex flex-col gap-2"}>
                    <button onClick={handleCrop} className={"button-filled text-primary-foreground bg-primary w-full rounded-full h-10"}>
                        {u("avatar_crop.submit")}
                    </button>
                    <DialogClose asChild>
                        <button className={"outline-button w-full rounded-full h-10"}>
                            {u("avatar_crop.cancel")}
                        </button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AvatarCropDialog;
