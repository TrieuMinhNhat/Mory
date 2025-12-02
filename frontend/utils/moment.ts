import {Moment, MomentPreview, ReactionType, Visibility} from "@/types/moment";
import Person from "@/components/user/icons/Person";
import Star from "@/components/user/icons/Star";
import Heart from "@/components/user/icons/Heart";
import Lock from "@/components/user/icons/Lock";
import {ElementType} from "react";

const VISIBILITY_MAP = {
    [Visibility.ALL_FRIENDS]: Person,
    [Visibility.CLOSE_FRIENDS]: Star,
    [Visibility.PARTNER_ONLY]: Heart,
    [Visibility.ONLY_ME]: Lock
}

export const getVisibilityIcon = (visibility: Visibility): ElementType => {
    return VISIBILITY_MAP[visibility] ?? Person;
}

const VISIBILITY_LABEL_MAP: Record<Visibility, string> = {
    [Visibility.ALL_FRIENDS]: "visibility.all_friends",
    [Visibility.CLOSE_FRIENDS]: "visibility.close_friends",
    [Visibility.PARTNER_ONLY]: "visibility.partner_only",
    [Visibility.ONLY_ME]: "visibility.only_me",
};

export const getVisibilityLabel = (visibility: Visibility): string => {
    return VISIBILITY_LABEL_MAP[visibility];
}

export const toMomentPreview = (moment: Moment): MomentPreview => ({
    id: moment.id,
    mediaUrl: moment.mediaUrl,
    caption: moment.caption || "",
    position: moment.position ?? 0,
});

const REACTION_ICON_MAP: Record<ReactionType, string> = {
    [ReactionType.ANGRY]: "/assets/reaction/angry.svg",
    [ReactionType.COLD]: "/assets/reaction/cold.svg",
    [ReactionType.COOL]: "/assets/reaction/cool.svg",
    [ReactionType.HEART]: "/assets/reaction/heart.svg",
    [ReactionType.LAUGH]: "/assets/reaction/laugh.svg",
    [ReactionType.MONEY]: "/assets/reaction/money.svg",
    [ReactionType.SAD]: "/assets/reaction/sad.svg",
    [ReactionType.SHIFTY]: "/assets/reaction/shifty.svg",
    [ReactionType.SILENT]: "/assets/reaction/silent.svg",
    [ReactionType.TIRED]: "/assets/reaction/tired.svg",
    [ReactionType.WHAT]: "/assets/reaction/what.svg",
};

export const getReactionEmoji = (reactionType: ReactionType) => {
    return REACTION_ICON_MAP[reactionType];
}