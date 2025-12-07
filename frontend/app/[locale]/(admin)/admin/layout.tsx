"use client"

import React, {useEffect, useRef} from "react";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminLeftSidebar from "@/components/admin/AdminLeftSidebar";
import {useAuthStore} from "@/store/useAuthStore";
import {useRouter} from "next/navigation";
import LoadingScreen from "@/components/shared/LoadingScreen";
import {RoleCode} from "@/types/adminUser";

const AdminLayout = ({
                    children
                }: {
    children : React.ReactNode
}) => {
    
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    const shouldRedirect = !user || user.roleCode !== RoleCode.ADMIN;
    const hasRedirected = useRef(false);
    console.log(user)

    useEffect(() => {
        if (!user && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace("/signin");
        } else if (!!user && user.roleCode !== RoleCode.ADMIN && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace("/home");
        }
    }, [user, router, shouldRedirect]);

    if (shouldRedirect) return <LoadingScreen/>;

    return (
        <div className={"flex h-screen overflow-hidden"}>
            {/* Sidebar - fixed, left side */}
            <aside className={"w-64 bg-background-100 hidden md:block border-none fixed left-0 top-0 h-screen z-40"}>
                <AdminLeftSidebar />
            </aside>

            {/* Main content - right side */}
            <div className={"flex flex-col flex-1 md:ml-64"}>
                {/* Topbar - fixed at top */}
                <header className={"fixed top-0 md:left-64 right-0 h-16 bg-background-200 border-none"}>
                    <AdminTopbar />
                </header>

                {/* Main section */}
                <main className={"mt-16 p-6 bg-background-200"}>
                    <section className={"w-full"}>
                        {children}
                    </section>
                </main>
            </div>
        </div>
    )
}

export default AdminLayout;