"use client"

import {useState} from "react";
import {PremiumView} from "@/types/auth";
import GoPremiumView from "@/components/auth/onboarding/GoPremiumView";
import FinishView from "@/components/auth/onboarding/FinishView";

const PremiumPage = () => {
    const [view, setView] = useState<PremiumView>(PremiumView.GO_PREMIUM);
    const renderContent = () => {
        switch (view) {
            case PremiumView.GO_PREMIUM:
                return <GoPremiumView onSkip={setView}/>;
            case PremiumView.FINISH:
                return <FinishView/>;
            default:
                return <GoPremiumView onSkip={setView}/>;
        }
    }
    return (
        <div className={"flex flex-col w-full items-center"}>
            {renderContent()}
        </div>
    )
}

export default PremiumPage;