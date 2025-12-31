import AnimatedSection from "./AnimatedSection";

export default function FeaturesSection({
                                            t,
                                        }: {
    t: (k: string) => string;
}) {
    const features = [
        {
            title: t("landing.features.moments_title"),
            desc: t("landing.features.moments_desc"),
            icon: <MomentIcon />,
        },
        {
            title: t("landing.features.stories_title"),
            desc: t("landing.features.stories_desc"),
            icon: <StoryIcon />,
        },
        {
            title: t("landing.features.connections_title"),
            desc: t("landing.features.connections_desc"),
            icon: <ConnectionIcon />,
        },
        {
            title: t("landing.features.chat_title"),
            desc: t("landing.features.chat_desc"),
            icon: <ChatIcon />,
        },
    ];

    return (
        <section
            id="features"
            className="
        py-20
        px-6
        max-w-6xl
        mx-auto
        scroll-mt-24
      "
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {features.map((f, i) => (
                    <FeatureCard
                        key={i}
                        title={f.title}
                        desc={f.desc}
                        icon={f.icon}
                        delay={i * 0.1}
                    />
                ))}
            </div>
        </section>
    );
}

function FeatureCard({
                         title,
                         desc,
                         icon,
                         delay,
                     }: {
    title: string;
    desc: string;
    icon: React.ReactNode;
    delay: number;
}) {
    return (
        <AnimatedSection delay={delay}>
            <div
                className="
          h-full
          rounded-2xl
          border
          bg-background
          p-8
          text-center
          shadow-sm
          hover:shadow-md
          transition
        "
            >
                {/* ICON (SVG MOCK – REPLACE LATER) */}
                <div
                    className="
            mx-auto
            mb-6
            h-12
            w-12
            rounded-full
            bg-primary/10
            flex
            items-center
            justify-center
            text-primary
          "
                >
                    {icon}
                </div>

                <h3 className="text-xl font-semibold mb-3">
                    {title}
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                    {desc}
                </p>
            </div>
        </AnimatedSection>
    );
}

function MomentIcon() {
    return (
        <svg width="22" height="22" fill="none">
            <rect x="3" y="5" width="16" height="12" rx="3" fill="currentColor" opacity="0.15" />
            <circle cx="11" cy="11" r="3" fill="currentColor" />
        </svg>
    );
}
function StoryIcon() {
    return (
        <svg width="22" height="22" fill="none">
            <rect x="4" y="3" width="14" height="16" rx="2" fill="currentColor" opacity="0.15" />
            <rect x="7" y="7" width="8" height="2" rx="1" fill="currentColor" />
            <rect x="7" y="11" width="8" height="2" rx="1" fill="currentColor" />
        </svg>
    );
}

function ConnectionIcon() {
    return (
        <svg width="22" height="22" fill="none">
            <circle cx="7" cy="9" r="3" fill="currentColor" />
            <circle cx="15" cy="9" r="3" fill="currentColor" />
            <rect x="5" y="13" width="12" height="4" rx="2" fill="currentColor" opacity="0.15" />
        </svg>
    );
}

function ChatIcon() {
    return (
        <svg width="22" height="22" fill="none">
            <path
                d="M4 5h14v9H7l-3 4V5z"
                fill="currentColor"
                opacity="0.15"
            />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
            <circle cx="12" cy="9" r="1" fill="currentColor" />
            <circle cx="15" cy="9" r="1" fill="currentColor" />
        </svg>
    );
}
