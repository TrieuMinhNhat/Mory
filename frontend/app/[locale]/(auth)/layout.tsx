"use client"

import React, {useEffect, useRef} from "react";
import AuthTopbar from "@/components/auth/AuthTopbar";
import {useRouter} from "next/navigation";
import {useAuthStore} from "@/store/useAuthStore";
import {ROUTES} from "@/constants/routes";
import LoadingScreen from "@/components/shared/LoadingScreen";

const AuthLayout = ({
                          children
                      }: {
    children : React.ReactNode
}) => {
    const router = useRouter();

    const user = useAuthStore((state) => state.user);

    const shouldRedirect = !!user;
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (shouldRedirect && !hasRedirected.current) {
            hasRedirected.current = true;
            
            router.replace(ROUTES.HOME);
        }
    }, [user, router, shouldRedirect]);

    if (shouldRedirect) return <LoadingScreen/>;

    return (
        <div
            className={"flex relative flex-col items-center min-h-screen bg-background"}
        >
            <AuthTopbar/>
            <div className={"relative pt-16 z-10 flex w-full items-center"}>
                {children}

            </div>
        </div>
    )
}

export default AuthLayout;