package com.muicochay.mory.shared.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Duration;

@Getter
@AllArgsConstructor
public enum BlockLevel {
    LOW(Duration.ofMinutes(30)),
    MEDIUM(Duration.ofHours(24)),
    HIGH(Duration.ofDays(7)),
    CRITICAL(Duration.ofDays(30)),
    PERMANENT(null);

    private final Duration duration;

    public boolean isPermanent() {
        return duration == null;
    }
}
