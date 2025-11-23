import {I18nProvider} from "@/components/shared/I18nProvider";
import {ReactNode} from "react";
import {initServerI18n} from "@/lib/i18n/i18nServer";
import {Montserrat} from "next/font/google";
import {TooltipProvider} from "@/components/ui/tooltip";
import {ThemeProvider} from "@/components/shared/ThemeProvider";
import ThemeToaster from "@/components/shared/ThemeToaster";

const getDirection = (locale: string) => {
    return ["ar", "he", "fa"].includes(locale) ? "rtl" : "ltr";
};

const montserrat = Montserrat({
    subsets: ["latin", "vietnamese"],
    weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
    variable: "--font-montserrat",
});


export default async function LocaleLayout({
                                               children,
                                               params,
                                           }: {
    children: ReactNode;
    params: { locale: string } | Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const resources = await initServerI18n(locale);
    return (
        <html lang={locale} dir={getDirection(locale)} className={"light"}>
            <body className={`${montserrat.variable} font-montserrat antialiased bg-background-100`}>
                <I18nProvider locale={locale} resources={resources}>
                    <ThemeProvider>
                        <TooltipProvider>
                            <ThemeToaster/>
                            {children}
                        </TooltipProvider>
                    </ThemeProvider>
                </I18nProvider>
            </body>
        </html>
    );
}