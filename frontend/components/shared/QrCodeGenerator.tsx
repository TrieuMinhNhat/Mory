"use client";

import { QRCodeCanvas } from "qrcode.react";
import Image from "next/image";

export default function QrCodeGenerator({ url, avatarUrl }: { url: string, avatarUrl?: string}) {
    return (
        <div className="relative w-[200px] h-[200px] sm:w-[220px] sm:h-[220px] lg:w-[260px] lg:h-[260px] border-primary border-2 bg-bg-light-200 rounded-lg flex items-center justify-center">
            <QRCodeCanvas
                value={url}
                size={220}
                bgColor={"#F0F0F0"}
                fgColor={"#000000"}
                level="H"
                style={{ width: "92%", height: "92%" }}
            />
            <div className="absolute bg-bg-light-200 p-[2px] rounded-full border border-primary">
                <Image
                    src={avatarUrl ?? "/assets/images/avatar.png"}
                    alt="logo"
                    width={36}
                    height={36}
                    className="size-8 lg:size-9 rounded-full"
                />
            </div>
        </div>
    );
}
