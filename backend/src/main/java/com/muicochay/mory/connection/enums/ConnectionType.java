package com.muicochay.mory.connection.enums;

import com.muicochay.mory.shared.enums.Visibility;
import lombok.Getter;

import java.util.List;

@Getter
public enum ConnectionType {
    FRIEND("Friend", 0,20, List.of(Visibility.ALL_FRIENDS)),
    CLOSE_FRIEND("Close Friend", 1, 5,  List.of(Visibility.ALL_FRIENDS, Visibility.CLOSE_FRIENDS)),
    SPECIAL("Special", 2, 1, List.of(Visibility.ALL_FRIENDS, Visibility.CLOSE_FRIENDS, Visibility.PARTNER_ONLY)),
    NO_RELATION("No Relation", 4, 0, List.of());

    private final String name;
    private final Integer level;
    private final Integer maxCount;
    private final List<Visibility> allowedVisibilities;

    ConnectionType(String name, Integer level, Integer maxCount, List<Visibility> allowedVisibilities) {
        this.name = name;
        this.level = level;
        this.maxCount = maxCount;
        this.allowedVisibilities = allowedVisibilities;
    }
}