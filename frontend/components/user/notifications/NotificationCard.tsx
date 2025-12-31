import Image from "next/image";
import React from "react";
import OMenuDotHorizontal from "@/components/shared/icons/OMenuDotHorizontal";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {
    ChangeTypeRequestMetadata,
    ConnectionNotificationVariant,
    Notification,
    NotificationType
} from "@/types/notifications";
import {useTranslation} from "next-i18next";
import {getConnectionTypeLabel} from "@/utils/connection";
import {timeAgo} from "@/utils/time";

interface NotificationCardProps {
    notification: Notification;
}
const NotificationCard = ({notification}: NotificationCardProps) => {
    const {t: u} = useTranslation("user")
    const getMessage = () => {
        switch (notification.type) {
            case NotificationType.CONNECTION_REQUEST: {
                if (!("variant" in notification.metadata)) return;
                if (notification.metadata.variant === ConnectionNotificationVariant.CONNECT) {
                    return u("notification.connection.request.sent.connect.message")
                } else {
                    const metadata: ChangeTypeRequestMetadata = notification.metadata;
                    const typeLabel = getConnectionTypeLabel(metadata.toConnectionType, u);
                    return u("notification.connection.request.sent.change_type.message", {toType: typeLabel})
                }
            }
            case NotificationType.CONNECTION_ACCEPTED: {
                if (!("variant" in notification.metadata)) return;
                if (notification.metadata.variant === ConnectionNotificationVariant.CONNECT) {
                    return u("notification.connection.request.accepted.connect.message", {name: notification.fromUser.displayName})
                } else {
                    const metadata: ChangeTypeRequestMetadata = notification.metadata;
                    const typeLabel = getConnectionTypeLabel(metadata.toConnectionType, u);
                    return u("notification.connection.request.accepted.change_type.message", {currentType: typeLabel})
                }
            }
        }
    }
    return (
        <div
            key={notification.id}
            tabIndex={0}
            role={"button"}
            className={`bg-background-100 w-full h-fit hover:bg-background-200 rounded-xl has-[button:hover]:bg-background-100 flex flex-row gap-2 justify-center shrink-0 p-2`}
        >
            <div className={"w-12 h-12 relative rounded-full mt-1 shrink-0"}>
                <Image
                    src={notification.fromUser.avatarUrl ?? "/assets/images/avatar.png"}
                    alt={notification.fromUser.displayName}
                    fill
                    sizes={"56px"}
                    className="rounded-full object-cover"
                />
            </div>
            <div className={"flex flex-col justify-center gap-1 w-full"}>
                <div>
                    <p>
                        <span className={"font-medium"}>{notification.fromUser.displayName}</span>
                        <span> {getMessage()}</span>
                    </p>
                </div>
                <div>
                    <p className={"text-sm text-foreground-200"}>
                        {(() => {
                            const { key, count } = timeAgo(notification.createdAt);
                            return count ? u(key, { count }) : u(key);
                        })()}
                    </p>
                </div>
            </div>
            <button
                className={"p-2 rounded-full bg-transparent shrink-0 h-fit hover:bg-background-300"}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                <ContentWithLoader isLoading={false} spinnerSize={4}>
                    <OMenuDotHorizontal className={"size-6"}/>
                </ContentWithLoader>
            </button>
        </div>
    )
}
export default NotificationCard;