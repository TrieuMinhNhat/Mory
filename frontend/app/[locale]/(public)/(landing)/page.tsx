import { initServerI18n } from "@/lib/i18n/i18nServer";
import get from "lodash.get";

import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import LandingTopbar from "@/components/landing/LandingTopbar";
import LandingPreferencesSection from "@/components/landing/LandingPreferencesSection";
import {Locale} from "@/lib/i18n/locales";

export default async function LandingPage(props: {
    params: Promise<{ locale: Locale }>;
}) {
    const params = await props.params;
    const resources = await initServerI18n(params.locale, ["common"]);
    const t = (key: string) => get(resources.common, key) || key;

    return (
        <main className="text-foreground">
            <LandingTopbar/>
            <HeroSection t={t} />
            <FeaturesSection t={t} />
            <HowItWorksSection t={t} />
            <FinalCTASection t={t} />
            <LandingPreferencesSection t={t} locale={params.locale} />
        </main>
    );
}
