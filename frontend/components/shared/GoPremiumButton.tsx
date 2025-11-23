"use client"

import Image from "next/image";
import React from "react";
import {useTranslation} from "next-i18next";

const GoPremiumButton = () => {
    const {t: u} = useTranslation("user");
    return (
        <div className="relative w-full md:max-w-[460px] rounded-2xl flex flex-row items-center py-2 px-3 border-2 border-primary overflow-hidden">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl z-0" />
            <div className="relative z-10 flex flex-row items-center">
                <Image
                    src="/assets/logo_premium.svg"
                    alt="app logo"
                    width={32}
                    height={32}
                    className="rounded-md w-12 h-12 flex-shrink-0 mr-2"
                />
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-primary">
                        {u("premium.title")}
                    </h1>
                    <h4 className="text-base text-primary font-normal">
                        {u("premium.subtitle")}
                    </h4>
                </div>
            </div>
        </div>
    )
}

export default GoPremiumButton;