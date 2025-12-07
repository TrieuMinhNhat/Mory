"use client"

import React, {useState, useEffect} from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from "recharts"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {enUS, vi} from "date-fns/locale";
import {usePathname} from "next/navigation";
import {fallbackLng} from "@/lib/i18n/config";
import {useAdminUserStore} from "@/store/admin/useAdminUserStore";
import {shallow} from "zustand/vanilla/shallow";
import {FetchUserStatsDailyParams} from "@/lib/services/adminUser.service";
import {useTranslation} from "next-i18next";

const UserStatsChart = () => {
    const pathname = usePathname();
    const locale = pathname.split("/")[1] || fallbackLng;

    const {t: ad} = useTranslation("admin");

    const {usersStatsDaily, fetchUserStatsDaily} = useAdminUserStore(
        (state) => ({
            usersStatsDaily: state.userStatsDaily,
            fetchUserStatsDaily: state.fetchUserStatsDaily
        }),
        shallow
    );

    const dateFnsLocale = locale === 'vi' ? vi : enUS

    const today = new Date()
    const [startDate, setStartDate] = useState<Date>(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
    )
    const [endDate, setEndDate] = useState<Date>(today)
    const [startOpen, setStartOpen] = useState(false)
    const [endOpen, setEndOpen] = useState(false)
    const [chartType, setChartType] = useState<"bar" | "line">("bar")

    const handleFetchData = async (startDate: Date, endDate: Date) => {
        const data: FetchUserStatsDailyParams = {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
        }
        await fetchUserStatsDaily(data);
    }

    useEffect(() => {
        void handleFetchData(startDate, endDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <div className="max-w-3xl w-fit mx-auto flex flex-col items-center bg-background-100 rounded-lg p-4">
            <h1 className={"text-base font-medium"}>
                {ad("home.chart.users.title")}
            </h1>
            <div className={"w-[646px] pr-12"}>
                <ChartContainer
                    config={{
                        count: {
                            label: `${ad("home.chart.users.label")}`,
                            color: "hsl(var(--primary))",
                        },
                    }}
                >
                    {chartType === "bar" ? (
                        <BarChart data={usersStatsDaily}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar
                                dataKey="count"
                                fill="rgb(var(--primary))"
                            />
                        </BarChart>
                    ) : (
                        <LineChart data={usersStatsDaily}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="rgb(var(--primary))"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                            />
                        </LineChart>
                    )}
                </ChartContainer>
            </div>
            <div className={"flex flex-col w-full items-center"}>
                <div className="flex flex-wrap items-center gap-4">
                    {/* Start Date Picker */}
                    <Popover open={startOpen} onOpenChange={setStartOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={"w-[110px] justify-start text-left font-normal border-foreground"}
                            >
                                {startDate ? format(startDate, "yyyy-MM-dd") : "Select start date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="center">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => {
                                    if (!date) return
                                    setStartDate(date)
                                    setStartOpen(false)
                                    void handleFetchData(date, endDate)
                                }}
                                disabled={{ after: new Date() }}
                                locale={dateFnsLocale}
                                className={"w-full bg-background-200"}
                            />
                        </PopoverContent>
                    </Popover>

                    {/* End Date Picker */}
                    <Popover open={endOpen} onOpenChange={setEndOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={"w-[110px] justify-start text-left font-normal border-foreground"}
                            >
                                {endDate ? format(endDate, "yyyy-MM-dd") : "Select end date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="center">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => {
                                    if (!date) return
                                    setEndDate(date)
                                    setEndOpen(false)
                                    void handleFetchData(startDate, date)
                                }}
                                disabled={{ after: new Date() }}
                                locale={dateFnsLocale}
                                className={"w-full bg-background-200"}
                            />
                        </PopoverContent>
                    </Popover>

                    {/* Chart Type Selector */}
                    <Select
                        value={chartType}
                        onValueChange={(val: "bar" | "line") => setChartType(val)}
                    >
                        <SelectTrigger className="w-[110px] border-foreground">
                            <SelectValue placeholder="Chart Type" />
                        </SelectTrigger>
                        <SelectContent className={"bg-background-300"}>
                            <SelectItem value="bar">{ad("home.chart.users.chart_type.bar")}</SelectItem>
                            <SelectItem value="line">{ad("home.chart.users.chart_type.line")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}


const formatDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

export default UserStatsChart;
