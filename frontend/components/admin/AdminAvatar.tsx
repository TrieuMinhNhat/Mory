import {useAuthStore} from "@/store/useAuthStore";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {shallow} from "zustand/vanilla/shallow";

const AdminAvatar = () => {
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

    return (
        <div className="bg-background-m p-2 rounded-full w-full flex justify-between items-start gap-2">
            {/* Avatar + Info */}
            <div className="flex gap-2 overflow-hidden">
                <Image
                    src={user?.profile.avatarUrl ?? "/assets/images/avatar.png"}
                    alt="avatar"
                    height={36}
                    width={36}
                    className="rounded-full object-cover w-10 h-10 shrink-0"
                />
                <div className="flex flex-col justify-center overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.profile.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email ?? "example@gmail.com"}</p>
                </div>
            </div>

            {/* Logout Button */}
            <Button
                className={"bg-transparent hover:bg-transparent p-0 self-end shadow-none"}
                onClick={handleSignOut}
                disabled={isLoading}
            >
                <Image
                    src="/assets/icons/logout.svg"
                    alt="sign out"
                    width={24}
                    height={24}
                    className={"hover:scale-105"}
                />
            </Button>
        </div>
    )
}

export default AdminAvatar;