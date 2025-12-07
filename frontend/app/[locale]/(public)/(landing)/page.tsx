import React from "react";
import {initServerI18n} from "@/lib/i18n/i18nServer";
import get from "lodash.get";
import GetStartedForm from "@/components/landing/GetStartedForm";

const LandingPage = async({
                                                params,
                                            }: {
    params: { locale: string } | Promise<{ locale: string }>;
})=> {

    const { locale } = await params;
    const resources = await initServerI18n(locale, ["common", "auth"]);
    const c = (key: string) => get(resources["common"], key) || key;



    return (
        <section className={"flex flex-col px-6 max-w-none md:max-w-[600px] md:w-fit text-foreground items-center justify-center"}>
            {/* */}
            <h1 className={"text-4xl md:text-5xl lg:text-6xl whitespace-pre-line font-bold text-center"}>
                {c("landing_tagline")}
            </h1>
            <p className={"text-[16px] md:text-[20px] lg:text-[24px] mt-2 md:mt-4 font-medium md:font-semibold text-center"}>
                {c("landing_cta")}
            </p>
            <p  className={"text-[16px] mt-4 md:mt-6 font-normal md:font-semibold text-center"}>
                {c("landing_prompt")}
            </p>
            <GetStartedForm />

        </section>
    );
}

export default LandingPage;
