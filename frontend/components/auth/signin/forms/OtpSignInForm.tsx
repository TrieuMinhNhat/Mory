import {InputOTP, InputOTPGroup, InputOTPSlotCustom} from "@/components/ui/input-otp";
import {REGEXP_ONLY_DIGITS} from "input-otp";
import {Button} from "@/components/ui/button";
import React, {useState} from "react";
import {useTranslation} from "next-i18next";
import {useAuthStore} from "@/store/useAuthStore";
import {shallow} from "zustand/vanilla/shallow";
import {toast} from "sonner";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {BlockDetails} from "@/types/auth";
import UserBlockedDialog from "@/components/auth/signin/UserBlockedDialog";


const OTPSignInForm = ({email}: {email: string}) => {
    const [password, setPassword] = useState("");
    const {t: a} = useTranslation("auth");
    const {t: ts} = useTranslation("toast");

    const {isLoading, signInEmailOtp} = useAuthStore(
        (state) => ({
            isLoading: state.isLoading,
            signInEmailOtp: state.signInEmailOtp
        }),
        shallow
    );


    const [isDialogOpen, setDialogOpen] = useState(false);
    const [unblockAt, setUnblockAt] = useState("");
    const [permanent, setPermanent] = useState(false);

    const handleSubmit = async () => {
        const requestBody = {
            email: email,
            inputOtp: password,
        };
        const result = await signInEmailOtp(requestBody);
        if (result.success) {
            toast.success(ts("sign_in.success"));
        } else if (result.data) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const blockDetails: BlockDetails = result.data;
            setPermanent(blockDetails.permanent);
            setUnblockAt(blockDetails.unblockAt);
            setDialogOpen(true);
        } else {
            toast.error(ts("sign_in.error"));

        }
    }
    return (
        <div className={"flex flex-col w-full gap-6"}>
            <InputOTP maxLength={6} value={password} onChange={setPassword} pattern={REGEXP_ONLY_DIGITS}>
                <InputOTPGroup className={"otp-group"}>
                    {[...Array(6)].map((_, index) => (
                        <InputOTPSlotCustom
                            key={index}
                            index={index}
                            caretColorClass={"bg-primary"}
                            caretHeight={"h-[24px] md:h-[24px]"}
                            caretWidth={"w-[1.5px] md:w-[2px]"}
                            className={"otp-slot !rounded-xl h-20 w-full max-w-16"}
                        />
                    ))}
                </InputOTPGroup>
            </InputOTP>

            <button
                type="submit"
                className={"auth-form-button bg-primary h-12 rounded-full mt-2"}
                onClick={handleSubmit}
                disabled={isLoading}
            >
                <ContentWithLoader isLoading={isLoading}>
                    {a("sign_in.button.sign_in")}
                </ContentWithLoader>
            </button>
            {isDialogOpen && (
                <UserBlockedDialog isOpen={isDialogOpen} setIsOpen={setDialogOpen} unblockAt={unblockAt} permanent={permanent} />
            )}
        </div>
    )
}

export default OTPSignInForm;