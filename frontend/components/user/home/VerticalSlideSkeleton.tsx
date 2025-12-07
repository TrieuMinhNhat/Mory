import React, {useEffect,  useRef, useState} from "react";
import {Skeleton} from "@/components/ui/skeleton";

const VerticalSlideSkeleton = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState(0);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize(Math.min(width, height));
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);


    return (
        <div className={"w-full h-full pt-16"}>
            <div className={"w-full h-full flex flex-col pb-32 md:pb-16 md:px-2 pt-4"}>
                <div className={"mx-auto w-fit h-fit flex flex-row items-center gap-2"}>
                    <Skeleton className={"w-12 h-12 rounded-full relative"}/>

                    <div className={"flex flex-col gap-1"}>
                        <Skeleton className={"h-5 w-28 rounded-full"}/>

                        <div className={"flex flex-row gap-1"}>
                            <Skeleton className={"h-4 w-24 rounded-full"}/>
                            <Skeleton className={"h-4 w-4 rounded-full"}/>
                        </div>
                    </div>
                </div>

                <div className="mt-2 flex overflow-hidden w-full h-full">
                    <div ref={ref}
                         className="flex-shrink-0 w-full items-center justify-center flex relative"
                    >
                        {size > 0 && (
                            <Skeleton style={{ width: size, height: size }} className="m-auto rounded-2xl"/>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default VerticalSlideSkeleton;
