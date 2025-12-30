import AnimatedSection from "./AnimatedSection";

export default function FeatureCard({
                                        title,
                                        description,
                                        delay,
                                    }: {
    title: string;
    description: string;
    delay: number;
}) {
    return (
        <AnimatedSection delay={delay}>
            <div className="text-center px-4">
                <h3 className="text-xl font-semibold mb-2">
                    {title}
                </h3>
                <p className="text-muted-foreground">
                    {description}
                </p>
            </div>
        </AnimatedSection>
    );
}
