import {ColumnVisibility, ColumnWidth, AdminUser} from "@/types/adminUser";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {ShieldCheck, ShieldX} from "lucide-react";
import {useState} from "react";
import BlockUserDialog from "@/components/admin/users/BlockUserDialog";
import UnblockUserDialog from "@/components/admin/users/UnblockUserDialog";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

interface Props {
    user: AdminUser;
    columnVisibility: ColumnVisibility;
    columnWidth: ColumnWidth;
}

const UsersTableRow = ({ user, columnVisibility, columnWidth }: Props) => {
    const columns = [
        { key: "basicInformation", show: true, width: columnWidth.basicInformation },
        { key: "joinedDate", show: columnVisibility.joinedDate, width: columnWidth.joinedDate },
        { key: "authorities", show: columnVisibility.role, width: columnWidth.role },
        { key: "status", show: columnVisibility.status, width: columnWidth.status },
        { key: "actions", show: columnVisibility.actions, width: columnWidth.actions },
    ];

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const visibleColumns = columns.filter(col => col.show);
    const gridTemplateColumns = visibleColumns.map(col => col.width).join(" ");

    const activeProviders = ["EMAIL_OTP", "GOOGLE", "APPLE"];
    const isActive = user.isPasswordVerified || activeProviders.some(p => user.providers.includes(p));

    return (
        <>
            <div
                className="w-full grid border-b border-background-m bg-background-100 py-3"
                style={{ gridTemplateColumns }}
            >
                {/* Basic Information */}
                <div className="flex gap-2 min-w-0 px-2 items-center">
                    <Image
                        src={user.profile.avatarUrl ?? "/assets/images/avatar.png"}
                        alt="avatar"
                        height={36}
                        width={36}
                        className="rounded-full object-cover w-8 h-8 shrink-0"
                    />
                    <div className="flex flex-col justify-center overflow-hidden">
                        <p className="text-sm font-medium truncate">{user.profile.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email ?? "example@gmail.com"}</p>
                    </div>
                </div>

                {columnVisibility.joinedDate && (
                    <div className="flex items-center justify-center text-sm truncate">
                        {formatDate(user.createdAt)}
                    </div>
                )}

                {columnVisibility.role && (
                    <div className="flex items-center justify-center text-sm truncate">
                        {user.roleCode}
                    </div>
                )}

                {columnVisibility.status && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center justify-center text-sm truncate">
                                {isActive ? "Active" : "Pending"}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className={"flex flex-col items-center"}>
                                {user.isBlocked && (
                                    <p>Blocked</p>
                                )}
                                {user.isDeleted && (
                                    <p>Deleted</p>
                                )}
                                {isActive ? (
                                    <p>Verified</p>
                                ) : (
                                    <p>Hasn&apos;t been verified</p>
                                )}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                )}

                {columnVisibility.actions && (
                    <div className="flex items-center justify-center">
                        {user.isBlocked ? (
                            <Button
                                className={"bg-transparent shadow-none hover:bg-transparent text-foreground hover:text-greenee-100 hover:scale-105"}
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <ShieldCheck width={24} height={24}/>
                            </Button>
                        ) : (
                            <Button
                                className={"bg-transparent shadow-none hover:bg-transparent text-foreground hover:text-error hover:scale-105"}
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <ShieldX width={24} height={24}/>
                            </Button>
                        )}
                    </div>
                )}
            </div>
            {user.isBlocked ? (
                <UnblockUserDialog user={user} isOpen={isDialogOpen} setIsOpen={setIsDialogOpen}/>
            ) : (
                <BlockUserDialog user={user} isOpen={isDialogOpen} setIsOpen={setIsDialogOpen}/>
            )}
        </>
    );
};

const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // "06/08/2025"
};

export default UsersTableRow;
