"use client"

import React from "react";
import ViewFrame from "@/components/user/ViewFrame";

const FrameLayout = ({
                    children
                }: {
    children : React.ReactNode
}) => {
    return (
        <div className={"relative lg:max-w-[650px] md:max-w-[600px] w-full h-full"}>
            <ViewFrame/>
            {children}
        </div>
    )
}

export default FrameLayout;