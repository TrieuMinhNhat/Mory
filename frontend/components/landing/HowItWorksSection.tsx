import AnimatedSection from "./AnimatedSection";

export default function HowItWorksSection({
                                              t,
                                          }: {
    t: (k: string) => string;
}) {
    const steps = [
        {
            title: t("landing.how.connect_title"),
            description: t("landing.how.connect_desc"),
        },
        {
            title: t("landing.how.capture_title"),
            description: t("landing.how.capture_desc"),
        },
        {
            title: t("landing.how.story_title"),
            description: t("landing.how.story_desc"),
        },
        {
            title: t("landing.how.collab_title"),
            description: t("landing.how.collab_desc"),
        },
    ];

    return (
        <section
            id="how"
            className="
        py-20
        px-6
        max-w-6xl
        mx-auto
        scroll-mt-24
      "
        >
            {/* Section heading */}
            <AnimatedSection>
                <h2 className="text-3xl font-bold text-center mb-16">
                    {t("landing.how_title")}
                </h2>
            </AnimatedSection>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {steps.map((step, i) => (
                    <AnimatedSection delay={i * 0.1} key={i}>
                        <div
                            className="
                h-full
                rounded-2xl
                border
                bg-background
                p-8
                shadow-sm
                hover:shadow-md
                transition
                text-center
              "
                        >
                            {/* Step number */}
                            <div className="text-4xl font-bold text-primary mb-4">
                                {i + 1}
                            </div>

                            {/* Step title */}
                            <h3 className="text-xl font-semibold mb-3">
                                {step.title}
                            </h3>

                            {/* Step description */}
                            <p className="text-muted-foreground leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    </AnimatedSection>
                ))}
            </div>
        </section>
    );
}
