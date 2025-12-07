import {ChevronUp, ChevronDown, CloudAlert} from "lucide-react";
import ContentWithLoader from "@/components/shared/ContentWithLoader";

interface Props {
    label: string;
    value?: number;
    difference?: number;
    isLoading: boolean;
}

const UsersStatsItem = ({ label, value, difference, isLoading }: Props) => {
    const isPositive = typeof difference === "number" && difference > 0;
    const isNegative = typeof difference === "number" && difference < 0;

    const colorClass = isPositive
        ? "text-green-500"
        : isNegative
            ? "text-error"
            : "text-muted";

    return (
        <div className="flex flex-col w-full bg-background-100 px-6 py-4 rounded-lg">
            <div className="w-full flex flex-row items-center">
                <p className="text-base font-medium mr-1">{label}</p>

                <ContentWithLoader isLoading={isLoading}>
                    {typeof difference === "number" && (
                        <>
                            {isPositive && <ChevronUp className={colorClass} size={16} />}
                            {isNegative && <ChevronDown className={colorClass} size={16} />}
                            <p className={`text-sm font-medium ${colorClass}`}>
                                {Math.abs(difference)}
                            </p>
                        </>
                    )}
                </ContentWithLoader>
            </div>
            <ContentWithLoader isLoading={isLoading}>
                <p className="text-2xl font-semibold mt-4">{value ?? <CloudAlert/>}</p>
            </ContentWithLoader>

        </div>
    );
};

export default UsersStatsItem;
