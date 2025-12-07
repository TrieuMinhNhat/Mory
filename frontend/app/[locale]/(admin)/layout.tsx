"use client"

import React from "react";
import AuthCheck from "@/components/shared/AuthProvider";

const AdminCheckAuthLayout = ({
                         children
                     }: {
    children : React.ReactNode
}) => {
    return (
        <AuthCheck>
            {children}
        </AuthCheck>
    )
}

export default AdminCheckAuthLayout;