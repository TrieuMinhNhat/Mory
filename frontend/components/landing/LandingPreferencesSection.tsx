import AnimatedSection from "./AnimatedSection";
import LandingThemeSwitch from "./LandingThemeSwitch";
import LandingLanguageSwitch from "./LandingLanguageSwitch";
import { Locale } from "@/lib/i18n/locales";

export default function LandingPreferencesSection({
                                                      t,
                                                      locale,
                                                  }: {
    t: (k: string) => string;
    locale: Locale;
}) {
    return (
        <section className="py-20 px-6 max-w-4xl mx-auto">
            <AnimatedSection>
                <h2 className="text-2xl font-semibold text-center mb-12">
                    {t("landing.preferences_title")}
                </h2>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <AnimatedSection delay={0.1}>
                    <div className="rounded-2xl border border-background-300 p-8 bg-background">
                        <h3 className="text-lg font-semibold mb-4 text-center">
                            {t("landing.language_title")}
                        </h3>
                        <LandingLanguageSwitch locale={locale} />
                    </div>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                    <div className="rounded-2xl border border-background-300 p-8 bg-background">
                        <h3 className="text-lg font-semibold mb-4 text-center">
                            {t("landing.theme_title")}
                        </h3>
                        <LandingThemeSwitch />
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
