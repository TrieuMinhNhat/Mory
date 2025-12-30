import AnimatedSection from "./AnimatedSection";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function FinalCTASection({
                                            t,
                                        }: {
    t: (k: string) => string;
}) {
    return (
        <section
            className="
        relative
        py-28
        px-6
        max-w-3xl
        mx-auto
        text-center
      "
        >
            {/* Soft gradient background */}
            <div
                className="
          absolute inset-0
          rounded-3xl
          bg-gradient-to-br
          from-primary/10
          via-primary/5
          to-transparent
        "
            />

            <div className="relative">
                {/* Heading */}
                <AnimatedSection>
                    <h2 className="text-4xl font-bold tracking-tight">
                        {t("landing.cta_title")}
                    </h2>
                </AnimatedSection>

                {/* Description */}
                <AnimatedSection delay={0.1}>
                    <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        {t("landing.cta_desc")}
                    </p>
                </AnimatedSection>

                {/* Actions */}
                <AnimatedSection delay={0.2}>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        {/* Primary CTA */}
                        <Link
                            href={ROUTES.AUTH.SIGN_UP}
                            className="
                inline-flex
                items-center
                justify-center
                h-12
                px-8
                rounded-full
                bg-primary
                text-primary-foreground
                font-medium
                hover:opacity-90
                transition
              "
                        >
                            {t("landing.cta_primary")}
                        </Link>

                        {/* Secondary CTA */}
                        <Link
                            href={ROUTES.AUTH.SIGN_IN}
                            className="
                inline-flex
                items-center
                justify-center
                h-12
                px-8
                rounded-full
                border
                font-medium
                hover:bg-muted
                transition
              "
                        >
                            {t("landing.cta_secondary")}
                        </Link>
                    </div>
                </AnimatedSection>

                {/* Trust / reassurance text */}
                <AnimatedSection delay={0.3}>
                    <p className="mt-6 text-sm text-muted-foreground">
                        {t("landing.cta_note")}
                    </p>
                </AnimatedSection>
            </div>
        </section>
    );
}
