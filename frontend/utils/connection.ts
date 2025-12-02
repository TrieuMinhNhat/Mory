import Person from "@/components/user/icons/Person";
import Star from "@/components/user/icons/Star";
import Heart from "@/components/user/icons/Heart";
import {ElementType} from "react";
import {ConnectionType} from "@/types/connections";
import {TFunction} from "i18next";

const connectionTypeMap = {
    [ConnectionType.FRIEND]: Person,
    [ConnectionType.CLOSE_FRIEND]: Star,
    [ConnectionType.SPECIAL]: Heart
}

export function getConnectionTypeIcon(connectionType: ConnectionType): ElementType {
    return connectionTypeMap[connectionType] ?? Person;
}

export function toConnectionType(type?: string): ConnectionType | undefined{
    if (!type) return undefined;
    switch (type) {
        case "FRIEND": return ConnectionType.FRIEND
        case "CLOSE_FRIEND": return ConnectionType.CLOSE_FRIEND
        case "SPECIAL": return ConnectionType.SPECIAL
        default: return undefined;
    }
}

export const getConnectionTypeLabel = (type: ConnectionType, t: TFunction): string => {
    switch (type) {
        case ConnectionType.SPECIAL:
            return t("user.connection_type.partner", "Partner");
        case ConnectionType.CLOSE_FRIEND:
            return t("user.connection_type.close_friend", "Close friend");
        case ConnectionType.FRIEND:
            return t("user.connection_type.friend", "Friend");
        default:
            return "";
    }
};
