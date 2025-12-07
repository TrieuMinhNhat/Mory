"use client"

import UsersStatsItem from "@/components/admin/users/UsersStatsItem";
import {useAdminUserStore} from "@/store/admin/useAdminUserStore";
import {shallow} from "zustand/vanilla/shallow";
import {useEffect} from "react";
import {useTranslation} from "next-i18next";
import UserStatsChart from "@/components/admin/UserStatsChart";

const AdminHomePage = () => {
    const {t: ad} = useTranslation("admin");
    const {userStatsSummary, fetchUserStatsSummary, isLoading} = useAdminUserStore(
        (state) => ({
            userStatsSummary: state.userStatsSummary,
            fetchUserStatsSummary: state.fetchUserStatsSummary,
            isLoading: state.isLoading,
        }),
        shallow
    )

    useEffect(() => {
        void fetchUserStatsSummary();
        console.log("getStats")
    }, [fetchUserStatsSummary]);

    return (
        <div className={"flex flex-col h-[calc(100vh-4rem)]"}> {/* 100vh - height của header */}
            <div className={"flex-1 overflow-y-auto remove-scrollbar"}>
                <div className={"flex flex-row w-full gap-4"}>
                    <UsersStatsItem
                        label={ad("stats.active")}
                        value={userStatsSummary?.activeUsers.value}
                        difference={userStatsSummary?.activeUsers.diff}
                        isLoading={isLoading}
                    />
                    <UsersStatsItem
                        label={ad("stats.total")}
                        value={userStatsSummary?.totalUsers.value}
                        difference={userStatsSummary?.totalUsers.diff}
                        isLoading={isLoading}
                    />
                    <UsersStatsItem
                        label={ad("stats.pending")}
                        value={userStatsSummary?.pendingUsers.value}
                        difference={userStatsSummary?.pendingUsers.diff}
                        isLoading={isLoading}
                    />
                </div>
                <div className={"mt-4 flex flex-row justify-center"}>
                    <UserStatsChart/>
                </div>
            </div>
        </div>
    )
}

export default AdminHomePage;