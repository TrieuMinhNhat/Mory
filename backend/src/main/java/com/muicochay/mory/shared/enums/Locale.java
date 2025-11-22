package com.muicochay.mory.shared.enums;

import lombok.Getter;

@Getter
public enum Locale {
    VI("vi"),
    EN("en");

    private final String code;

    Locale(String code) {
        this.code = code;
    }
}
