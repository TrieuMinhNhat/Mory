import Corner from "@/components/shared/Corner";
import React from "react";

const viewFrame = () => {
    return (
        <>
            <Corner className={"fixed top-16 z-10 hidden md:block "}/>
            <div className={"fixed top-16 h-[1px] md:w-[568px] lg:w-[618px] translate-x-[16px] bg-background-m hidden md:block"}></div>
            <Corner className={"fixed z-10 top-16 transform md:translate-x-[576px] lg:translate-x-[626px]  rotate-90 hidden md:block"}/>
            <div className={"fixed top-16 h-full w-[1px] bg-background-m hidden md:block"}></div>
            <div className={"fixed top-16 h-full w-[1px] bg-background-m md:translate-x-[599px] lg:translate-x-[649px] hidden md:block"}></div>
        </>
    )
}

export default viewFrame;