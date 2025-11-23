import React from "react";
import {PulseLoader} from "react-spinners";

type ContentWithLoaderProps = {
    isLoading: boolean;
    children: React.ReactNode;
    spinnerSize?: number;
    spinnerColor?: string;
};

const ContentWithLoader = ({
                               isLoading,
                               children,
                               spinnerSize = 8,
                               spinnerColor = "var(--spinner-color)",
                           }: ContentWithLoaderProps) => {
    return isLoading ? (
        <PulseLoader size={spinnerSize} color={spinnerColor} className={"shrink-0"}/>
    ) : (
        <>{children}</>
    );
};

export default ContentWithLoader;