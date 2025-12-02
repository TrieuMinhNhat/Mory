"use client"

import React, {useEffect, useRef} from "react";
import Topbar from "@/components/user/Topbar";
import {useAuthStore} from "@/store/useAuthStore";
import {useRouter} from "next/navigation";
import LoadingScreen from "@/components/shared/LoadingScreen";
import {RoleCode} from "@/types/adminUser";
import {ROUTES} from "@/constants/routes";
import LeftSidebar from "@/components/user/LeftSidebar";
import Bottombar from "@/components/user/Bottombar";

const Layout = ({
                    children
                }: {
    children : React.ReactNode
}) => {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    const shouldRedirect =
        !user ||
        !user.verified ||
        !user.profile.onboarded ||
        user.roleCode === RoleCode.ADMIN;

    const hasRedirected = useRef(false);

    useEffect(() => {
        if (!user && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace(ROUTES.AUTH.SIGN_IN);
        } else if ((!user?.verified || !user.profile.onboarded) && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace(ROUTES.ONBOARDING);
        } else if (!!user && user.roleCode === RoleCode.ADMIN && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace(ROUTES.ADMIN.ROOT);
        }
    }, [user, router]);

    if (shouldRedirect) return <LoadingScreen/>

    return (
        <div className="h-screen flex flex-col bg-background-100">
            <header className={"fixed top-0 left-0 right-0 h-16 bg-background-100 z-[70]"}>
                <Topbar />
            </header>
            <div className={"flex justify-center bg-background-100 pt-16 h-screen"}>
                <aside className="hidden md:block fixed top-16 left-0 bottom-0 w-20 bg-background-100 z-[70]">
                    <LeftSidebar/>
                </aside>
                {children}
                <div className={"flex md:hidden fixed bottom-0 left-0 w-full bg-background-100 z-50"}>
                    <Bottombar/>
                </div>
            </div>
        </div>
    );
}

export default Layout;