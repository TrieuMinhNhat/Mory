import {Home,  Users} from "lucide-react";
import Questions from "@/components/shared/icons/Questions";
import {ROUTES} from "@/constants/routes";

export const adminSidebarLinks = [
    {
        key: "leftSidebar.home",
        route: ROUTES.ADMIN.ROOT,
        icon: Home
    },
    {
        key: "leftSidebar.users",
        route: ROUTES.ADMIN.USERS,
        icon: Users
    },
    {
        key: "leftSidebar.questions",
        route: ROUTES.ADMIN.QUESTIONS,
        icon: Questions
    }
]

export const enum FOLDER {
    AVATAR = "avatars",
    MOMENT = "moments"
}