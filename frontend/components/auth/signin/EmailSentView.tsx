"use client"

import {useTranslation} from "next-i18next";
import Link from "next/link";

const EmailSentView = () => {
    const {t: a} = useTranslation("auth");

    return (
        <div className={"auth-form-container"}>
            <h1 className={"auth-form-title"}>{a("sign_in.email_sent.title")}</h1>
            <p className={"auth-form-subtitle"}>{a("sign_in.email_sent.description")}</p>
            <p className={"signup-prompt text-[16px]"}>
                {a("sign_in.email_sent.guide_1")}
                <Link href={"/public"} className="font-semibold">{a("sign_in.email_sent.contact")}</Link>
                {a("sign_in.email_sent.guide_2")}
            </p>
        </div>
    )
}

export default EmailSentView