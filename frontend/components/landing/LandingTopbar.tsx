"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslation } from "next-i18next";
import { ROUTES } from "@/constants/routes";
import MoryLogo from "@/components/logo/MoryLogo";

export default function LandingTopbar() {
    const { t } = useTranslation("common");
    const [open, setOpen] = useState(false);

    return (
        <header
            className="
        fixed top-0 left-0 right-0
        z-50
        h-16
        border-b
        bg-background/80
        backdrop-blur
      "
        >
            <div className="max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                    <MoryLogo className={"size-8 rounded-md"}/>
                    <span>Mory</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm">
                    <a href="#features" className="hover:text-primary transition">
                        {t("nav.features", "Features")}
                    </a>
                    <a href="#how" className="hover:text-primary transition">
                        {t("nav.how_it_works", "How it works")}
                    </a>
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href={ROUTES.AUTH.SIGN_IN}
                        className="
              text-sm
              px-4 py-2
              rounded-full
              bg-primary
              text-primary-foreground
              hover:opacity-90
              transition
            "
                    >
                        {t("auth.sign_in", "Sign in")}
                    </Link>
                </div>

                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden"
                    aria-label="Toggle menu"
                >
                    {open ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {open && (
                <div className="md:hidden border-t bg-background">
                    <div className="px-6 py-4 flex flex-col gap-4 text-sm">
                        <a
                            href="#features"
                            onClick={() => setOpen(false)}
                            className="hover:text-primary"
                        >
                            {t("nav.features", "Features")}
                        </a>
                        <a
                            href="#how"
                            onClick={() => setOpen(false)}
                            className="hover:text-primary"
                        >
                            {t("nav.how_it_works", "How it works")}
                        </a>

                        <Link
                            href={ROUTES.AUTH.SIGN_IN}
                            className="
                mt-2
                px-4 py-2
                rounded-full
                bg-primary
                text-primary-foreground
                text-center
              "
                        >
                            {t("auth.sign_in", "Sign in")}
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
