"use client"

import UsersTableRow from "@/components/admin/users/table/UsersTableRow";
import {
    columnLabels,
    defaultColumnVisibility,
    defaultColumnWidths,
    RoleCode,
} from "@/types/adminUser";
import UsersTableHeader from "@/components/admin/users/table/UsersTableHeader";
import {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Input} from "@/components/ui/input";
import {useAdminUserStore} from "@/store/admin/useAdminUserStore";
import {useDebouncedCallback} from "use-debounce";
import {useTranslation} from "next-i18next";
import UsersFilter from "@/components/admin/users/table/UsersFilter";
import UsersColumnFilter from "@/components/admin/users/table/UsersColumnFilter";
import {shallow} from "zustand/vanilla/shallow";
import CustomPagination from "@/components/shared/CustomPagination";

const STORAGE_KEY = "admin_users_column_visibility";

const AdminUsersPage = () => {
    const {users, currentPage, totalPages, hasNext, fetchUsers, isLoading} = useAdminUserStore(
        (state) => ({
            users: state.users,
            currentPage: state.currentPage,
            totalPages: state.totalPages,
            hasNext: state.hasNext,
            fetchUsers: state.fetchUsers,
            isLoading: state.isLoading,
        }),
        shallow
    )
    const searchParams = useSearchParams();
    const router = useRouter();


    const {t: ad} = useTranslation("admin");


    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");
    const keyword = searchParams.get("keyword") || "";
    const roleParam = searchParams.get("role");
    const role = (roleParam && Object.values(RoleCode).includes(roleParam as RoleCode))
        ? (roleParam as RoleCode)
        : undefined;
    const active = searchParams.get("active") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const direction = (searchParams.get("direction") || "desc") as "acs" | "desc";

    const [searchValue, setSearchValue] = useState(keyword);

    const debouncedUpdateQuery = useDebouncedCallback((value: string) => {
        updateQueryParam("keyword", value);
    }, 300);

    const updateQueryParam = (key: string, value: string | number | boolean | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === null || value === "") {
            params.delete(key);
        } else {
            params.set(key, String(value));
        }
        params.set("page", "0");
        router.push(`/admin/users?${params.toString()}`);
    };

    useEffect(() => {
        void fetchUsers({
            page,
            size,
            keyword,
            sortBy,
            direction,
            role: role || undefined,
            active: active ? active === "true" : undefined,
        })
    }, [page, size, keyword, role, active, sortBy, direction, fetchUsers]);

    const goToPage = (p: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", p.toString());
        router.push(`/admin/users?${params.toString()}`);
    };

    const [columnVisibility, setColumnVisibility] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        }
        return defaultColumnVisibility;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
    }, [columnVisibility]);

    return (
        <div className={"flex flex-col h-[calc(100vh-6rem)]"}> {/* 100vh - height của header */}
            <div className={"shrink-0 flex flex-row items-center bg-background-100 gap-2 rounded-t-lg shadow p-4"}>
                <p className={"text-base font-semibold text-foreground flex-1"}>
                    {ad("users_page.title")}
                </p>

                {/**/}

                <Input
                    placeholder={ad("users_page.search_input_placeholder")}
                    value={searchValue}
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                        debouncedUpdateQuery(e.target.value);
                    }}
                    className={"w-[220px] border-background-m text-sm placeholder:text-xs !ring-transparent focus:!ring-primary focus:outline text-foreground placeholder:text-foreground/80"}
                />

                <UsersFilter
                    role={role}
                    active={active}
                    sortBy={sortBy}
                    direction={direction}
                    updateQueryParam={updateQueryParam}
                />

                <UsersColumnFilter
                    columnVisibility={columnVisibility}
                    setColumnVisibility={setColumnVisibility}
                />

            </div>
            <div className={"w-full px-4 bg-background-100"}>
                <UsersTableHeader
                    columnLabels={columnLabels}
                    columnWidth={defaultColumnWidths}
                    columnVisibility={columnVisibility}
                />
            </div>
            <div
                className={"flex-1 overflow-y-auto scrollbar-thumb-only bg-background-100 rounded-b-lg pl-4 pr-1"}
                style={{ scrollbarGutter: 'stable' }}
            >
                {
                    users.map((user, index) => (
                        <UsersTableRow
                            key={index}
                            user={user}
                            columnVisibility={columnVisibility}
                            columnWidth={defaultColumnWidths}
                        />
                    ))
                }

            </div>
            <div className={"bg-background-100 rounded-b-lg py-2"}>
                <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hasNext={hasNext}
                    isLoading={isLoading}
                    onPageChange={goToPage}
                />
            </div>
        </div>
    )
}

export default AdminUsersPage;