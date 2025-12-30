import AnimatedSection from "./AnimatedSection";
import GetStartedForm from "@/components/landing/GetStartedForm";
import Image from "next/image";

export default function HeroSection({
                                        t,
                                    }: {
    t: (key: string) => string;
}) {
    return (
        <section className="
      relative
      min-h-[85vh]
      grid grid-cols-1 lg:grid-cols-2
      gap-16
      items-center
      max-w-6xl
      mx-auto
      px-6
      py-20
    ">
            {/* TEXT */}
            <div className="text-center lg:text-left">
                <AnimatedSection>
                    <h1 className="
            text-4xl
            md:text-5xl
            lg:text-6xl
            font-bold
            tracking-tight
            whitespace-pre-line
          ">
                        {t("landing.hero_title")}
                    </h1>
                </AnimatedSection>

                <AnimatedSection delay={0.1}>
                    <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                        {t("landing.hero_subtitle")}
                    </p>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                    <p className="mt-6 font-medium">
                        {t("landing.hero_prompt")}
                    </p>
                </AnimatedSection>

                <AnimatedSection delay={0.3}>
                    <div className="mt-8 max-w-sm mx-auto lg:mx-0">
                        <GetStartedForm />
                    </div>
                </AnimatedSection>
            </div>

            {/* HERO ILLUSTRATION / MOCK SCREENSHOT */}
            <AnimatedSection delay={0.4}>
                <div className="relative w-full h-[420px]">
                    {/* Decorative blur background */}
                    <div className="
            absolute -top-8 -right-8
            w-48 h-48
            rounded-full
            bg-primary/20
            blur-3xl
          " />

                    {/* === REPLACE THIS DIV WITH <Image /> HERO MOCKUP === */}
                    {/* Suggested: screenshot Feed + Chat overview */}
                    <div className="
            relative
            h-full
            rounded-2xl
            border
            bg-background
            shadow-xl
            aspect-[10/10]
            flex items-center justify-center
            mx-auto
            text-muted-foreground
          ">
                        <Image
                            src={"/assets/images/mockup.png"}
                            fill
                            alt={"feeds"}
                        />
                    </div>
                </div>
            </AnimatedSection>
        </section>
    );
}
