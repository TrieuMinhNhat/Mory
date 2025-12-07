"use client"

import SignInWithEmailPassword from "@/components/auth/signin/SignInWithEmailPassword";
import SignInWithEmailOtp from "@/components/auth/signin/SignInWithEmailOtp";
import SignInOtpInput from "@/components/auth/signin/SignInOtpInput";
import ForgotPassword from "@/components/auth/signin/ForgotPassword";
import {useState} from "react";
import {SignInView} from "@/types/auth";
import EmailSentView from "@/components/auth/signin/EmailSentView";
import {useAuthStore} from "@/store/useAuthStore";

const SignInPage = () => {
    const initialSignInView = useAuthStore((state) => state.initialSignInView)
    const [view, setView] = useState<SignInView>(initialSignInView);
    const [email, setEmail] = useState<string>("");

    const renderContent = () => {
        switch (view) {
            case SignInView.EMAIL_PASSWORD:
                return <SignInWithEmailPassword onSelect={setView} />;
            case SignInView.EMAIL_OTP:
                return <SignInWithEmailOtp onSelect={setView} setEmail={setEmail} />;
            case SignInView.OTP_INPUT:
                return <SignInOtpInput onSelect={setView} email={email}/>;
            case SignInView.FORGOT_PASSWORD:
                return <ForgotPassword onSelect={setView} />;
            case SignInView.EMAIL_SENT:
                return <EmailSentView/>
        }
    };

    
    return (
        <div className={"flex flex-col w-full items-center"}>
            {renderContent()}
        </div>

    )
}

export default SignInPage;