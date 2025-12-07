"use client"

import React, {useEffect, useRef} from "react";
import {useRouter} from "next/navigation";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import LoadingScreen from "@/components/shared/LoadingScreen";
import {ROUTES} from "@/constants/routes";

const OnboardingLayout = ({
                          children
                      }: {
    children : React.ReactNode
}) => {
    const router = useRouter();

    const {onboardingStep, user} = useAuthStore(
        (state) => ({
            onboardingStep: state.getOnboardingStep(),
            user: state.user,
            signOut: state.signOut
        }),
        shallow
    );

    const shouldRedirect = onboardingStep === 3 || !user;
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (onboardingStep === 3 && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace(ROUTES.PREMIUM);
        } else if (!user && !hasRedirected.current) {
            
            hasRedirected.current = true;
            router.replace(ROUTES.AUTH.SIGN_IN);
        }
    }, [user, onboardingStep, router]);

    if (shouldRedirect) return <LoadingScreen/>;

    return (
        <>
            {children}
        </>
    )
}

export default OnboardingLayout;