package com.muicochay.mory.shared.utils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

public class DateTimeUtils {
    public static LocalDateTime toLocalDateTime(Instant instant, String timezone) {
        if (instant == null) return null;
        if (timezone == null || timezone.isBlank()) {
            return LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
        }
        return LocalDateTime.ofInstant(instant, ZoneId.of(timezone));
    }
}
