"use client"

import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import React, {useEffect, useState} from "react";
import LoadingScreen from "@/components/shared/LoadingScreen";

type AuthCheckProps = {
    children: React.ReactNode;
    loadingFallback?: React.ReactNode;
};


const AuthCheck = ({ children, loadingFallback }: AuthCheckProps) => {
    const { checkAuth, authUser, isCheckingAuth } = useAuthStore(
        (state) => ({
            checkAuth: state.checkAuth,
            authUser: state.user,
            isCheckingAuth: state.isCheckingAuth,
        }),
        shallow
    );

    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (!authUser) {
            checkAuth().then(() => {
                //Done
            }).finally(() => setChecked(true));

        } else {
            setChecked(true);
        }
    }, [authUser, checkAuth]);

    if (!checked || isCheckingAuth) {
        return (
            <>
                {loadingFallback ?? <LoadingScreen/>}
            </>
        );
    }

    return <>{children}</>;
}

export default AuthCheck;