"use client"

import {Button} from "@/components/ui/button";
import {useAuthStore} from "@/store/useAuthStore";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import {usePathname} from "next/navigation";
import {fallbackLng} from "@/lib/i18n/config";
import {useTranslation} from "next-i18next";
import ThemeSwitch from "@/components/shared/ThemeSwitch";
import Image from "next/image";
import {shallow} from "zustand/vanilla/shallow";

const UserActionMenu = () => {
    const {user, signOut, isLoading} = useAuthStore(
        (state) => ({
            user: state.user,
            signOut: state.signOut,
            isLoading: state.isLoading,
        }),
        shallow
    )

    const handleSignOut = async () => {
        void signOut();
    }
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || fallbackLng;

    const {t: a} = useTranslation("auth");
    const {t: u} = useTranslation("user");

    return (
        <div className={"flex flex-col justify-center pt-1 gap-4"}>
            <button className={"rounded-md outline-none ring-0 focus:border-none focus:outline-none focus:ring-0"}>
                <div className={"flex gap-2 overflow-hidden p-3 rounded-md bg-background-200 border border-transparent hover:border-primary"}>
                    <Image
                        src={user?.profile.avatarUrl ?? "/assets/images/avatar.png"}
                        alt="profile photo"
                        height={42}
                        width={42}
                        className="rounded-full object-cover w-10 h-10 shrink-0"
                    />
                    <div className="flex flex-col justify-center overflow-hidden">
                        <p className="text-sm text-left font-medium truncate">{user?.profile.displayName}</p>
                        <p className="text-xs text-left text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>
            </button>

            <div className={"flex flex-row items-center justify-between"}>
                {u("user_action_menu.label.language")}
                <LanguageSwitcher locale={locale}/>
            </div>
            <div className={"flex flex-row items-center justify-between"}>
                {u("user_action_menu.label.theme")}
                <ThemeSwitch/>
            </div>

            <div className={"flex flex-row items-center justify-between"}>
                <Button
                    className={"bg-transparent text-foreground w-fit hover:scale-105 hover:bg-transparent p-0 self-end shadow-none"}
                    onClick={handleSignOut}
                    disabled={isLoading}
                >
                    <p className={"text-base font-medium"}>{a("sign_out")}</p>
                    <Image
                        src="/assets/icons/logout.svg"
                        alt="sign out"
                        width={24}
                        height={24}
                    />
                </Button>
            </div>
        </div>
    )
}

export default UserActionMenu;