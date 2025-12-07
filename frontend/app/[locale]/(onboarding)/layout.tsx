"use client"

import React from "react";
import Image from "next/image";
import MenuTriangle from "@/components/shared/icons/MenuTriangle";
import Link from "next/link";
import {ROUTES} from "@/constants/routes";
import AuthCheck from "@/components/shared/AuthProvider";

const OnboardingLayout = ({
                          children
                      }: {
    children : React.ReactNode
}) => {
    return (
        <div
            className={"flex relative flex-col items-center min-h-screen bg-background"}
        >
            <div className={"fixed top-0 z-20 flex flex-row justify-between items-center px-[16px] md:px-[50px] h-16 w-full"}>
                <Link href={ROUTES.LANDING}>
                    <Image
                        src={"/assets/logo.svg"}
                        alt={"app logo"}
                        width={24}
                        height={24}
                        className={"rounded-md w-10 h-10 flex-shrink-0 mr-2"}
                    />
                </Link>
                <button className={"text-foreground p-2 hover:bg-background-300 rounded-full"}>
                    <MenuTriangle className={"size-6"} />
                </button>
            </div>
            <div className={"relative pt-16 z-10 flex w-full justify-center items-center"}>
                <AuthCheck>
                    {children}
                </AuthCheck>
            </div>
        </div>
    )
}

export default OnboardingLayout;