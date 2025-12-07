"use client"

import VerifyEmailView from "@/components/auth/onboarding/VerifyEmailView";
import {OnboardingView} from "@/types/auth";
import {useEffect, useState} from "react";
import CompleteProfileView from "@/components/auth/onboarding/CompleteProfileView";
import {useAuthStore} from "@/store/useAuthStore";
import WelcomeView from "@/components/auth/onboarding/WelcomeView";

const OnboardingPage = () => {
    const [view, setView] = useState<OnboardingView>(OnboardingView.VERIFY_EMAIL);
    const [showWelcomeView, setShowWelcomeView] = useState<boolean>(true);
    const onboardingStep = useAuthStore((state) => state.getOnboardingStep());
    useEffect(() => {
        switch (onboardingStep) {
            case 1:
                setView(OnboardingView.VERIFY_EMAIL);
                break;
            case 2:
                setView(OnboardingView.COMPLETE_INFORMATION);
                break;
            case 3:
                break;
            default:
                setView(OnboardingView.VERIFY_EMAIL);
        }
        
        if (showWelcomeView) {
            setView(OnboardingView.WELCOME);
        }
    }, [onboardingStep, showWelcomeView]);
    

    const renderContent = () => {
        switch (view) {
            case OnboardingView.WELCOME:
                return <WelcomeView onContinueClick={setShowWelcomeView}/>
            case OnboardingView.VERIFY_EMAIL:
                return <VerifyEmailView />
            case OnboardingView.COMPLETE_INFORMATION:
                return <CompleteProfileView />
            default:
                return <WelcomeView onContinueClick={setShowWelcomeView}/>
        }
    }
    return (
        renderContent()
    )
}

export default OnboardingPage;