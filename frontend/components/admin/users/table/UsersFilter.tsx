"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ListFilterPlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RoleCode } from "@/types/adminUser";
import { useTranslation } from "next-i18next";

const ROLE_LABELS: Record<RoleCode, string> = {
    [RoleCode.ADMIN]: "Admin",
    [RoleCode.USER]: "User",
    [RoleCode.MODERATOR]: "Mod",
};

type UsersFilterProps = {
    role?: RoleCode;
    active: string;
    sortBy: string;
    direction: "acs" | "desc";
    updateQueryParam: (key: string, value: string | number | boolean | null) => void;
};

const UsersFilter = ({ role, active, sortBy, direction, updateQueryParam }: UsersFilterProps) => {
    const { t: ad } = useTranslation("admin");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="p-2" size="sm">
                    {ad("users_page.filter.btn")}
                    <ListFilterPlus />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2 space-y-3 bg-background-300 text-foreground" align="end">

                {/* Role Select */}
                <div className="flex flex-row w-full justify-center items-center gap-2">
                    <label className="text-sm block">{ad("users_page.filter.label.role")}</label>
                    <Select
                        value={role || "all"}
                        onValueChange={(value) => updateQueryParam("role", value === "all" ? null : value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-background-200">
                            <SelectItem value="all">All Roles</SelectItem>
                            {Object.entries(ROLE_LABELS).map(([code, label]) => (
                                <SelectItem key={code} value={code}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Active checkbox */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="active"
                        checked={active === "true"}
                        onCheckedChange={(checked) => updateQueryParam("active", checked ? true : null)}
                        className={"border-foreground"}
                    />
                    <label htmlFor="active" className="text-sm">
                        {ad("users_page.filter.label.active_only")}
                    </label>
                </div>

                {/* Sort by */}
                <div className="flex items-center justify-between">
                    <span className="text-sm">{ad("users_page.filter.label.sort_by")}</span>
                    <Button
                        size="sm"
                        variant="outline"
                        className={"bg-background-300"}
                        onClick={() => updateQueryParam("sortBy", sortBy === "email" ? "createdAt" : "email")}
                    >
                        {sortBy === "email"
                            ? ad("users_page.filter.label.sort_by_email")
                            : ad("users_page.filter.label.sort_by_joined_date")}
                    </Button>
                </div>

                {/* Sort direction */}
                <div className="flex items-center justify-between">
                    <span className="text-sm">{ad("users_page.filter.label.direction")}</span>
                    <Button
                        size="sm"
                        variant="outline"
                        className={"bg-background-300"}
                        onClick={() => updateQueryParam("direction", direction === "acs" ? "desc" : "acs")}
                    >
                        {direction === "acs" ? "↑ Asc" : "↓ Desc"}
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UsersFilter;
