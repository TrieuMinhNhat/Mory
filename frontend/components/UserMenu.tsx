import {usePathname} from "next/navigation";
import {fallbackLng} from "@/lib/i18n/config";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import ThemeSwitch from "@/components/shared/ThemeSwitch";
import {useAuthStore} from "@/store/useAuthStore";
import {ArrowLeft, ChevronRight} from "lucide-react";
import React, {useState} from "react";
import {useTranslation} from "next-i18next";

const enum ActionMenuView {
    HOME,
    THEME,
    LANGUAGE
}

const UserMenu = () => {
    const pathname = usePathname();
    const [view, setView] = useState<ActionMenuView>(ActionMenuView.HOME);
    const locale = pathname.split("/")[1] || fallbackLng;
    const {t: u} = useTranslation("user");
    const signOut = useAuthStore((state) => state.signOut);

    const handleSignOut = async () => {
        void signOut();
    }

    return (
        <div className={"flex max-w-xl w-full flex-col items-center"}>
            {view === ActionMenuView.HOME && (
                <>
                    <button
                        className={"w-full h-12 font-medium flex flex-row items-center justify-between hover:bg-background-200 rounded-xl text-left pl-4 pr-2"}
                        onClick={() => setView(ActionMenuView.THEME)}
                    >
                        {u("user_action_menu.label.theme")}
                        <ChevronRight className={"size-6"}/>
                    </button>
                    <button
                        className={"w-full h-12 font-medium flex flex-row items-center justify-between hover:bg-background-200 rounded-xl text-left pl-4 pr-2"}
                        onClick={() => setView(ActionMenuView.LANGUAGE)}
                    >
                        {u("user_action_menu.label.language")}
                        <ChevronRight className={"size-6"}/>
                    </button>
                    <div className={"h-[1px] w-full bg-background-200 my-1"}></div>
                    <button
                        className={"w-full h-12 font-medium text-error hover:bg-background-200 rounded-xl text-left pl-4 pr-2"}
                        onClick={() => handleSignOut()}
                    >
                        {u("user_action_menu.label.logout")}
                    </button>
                </>
            )}
            {view === ActionMenuView.THEME && (
                <>
                    <div className={"flex flex-row items-center w-full pr-6 mb-2"}>
                        <button
                            className={"hover:bg-background-200 p-1 rounded-full"}
                            onClick={() => setView(ActionMenuView.HOME)}
                        >
                            <ArrowLeft
                                className={"size-6"}
                            />
                        </button>
                        <h2 className={"w-full text-center text-lg font-medium"}>
                            {u("user_action_menu.label.theme")}
                        </h2>
                    </div>
                    <ThemeSwitch/>
                </>
            )}
            {view === ActionMenuView.LANGUAGE && (
                <>
                    <div className={"flex flex-row items-center w-full pr-6 mb-2"}>
                        <button
                            className={"hover:bg-background-200 p-1 rounded-full"}
                            onClick={() => setView(ActionMenuView.HOME)}
                        >
                            <ArrowLeft
                                className={"size-6"}
                            />
                        </button>
                        <h2 className={"w-full text-center text-lg font-medium"}>
                            {u("user_action_menu.label.language")}
                        </h2>
                    </div>
                    <LanguageSwitcher locale={locale}/>
                </>
            )}
        </div>
    )
}
export default UserMenu;