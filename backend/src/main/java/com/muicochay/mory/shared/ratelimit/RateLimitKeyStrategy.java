package com.muicochay.mory.shared.ratelimit;

/**
 * Enum representing different strategies for rate-limiting identifiers.
 */
public enum RateLimitKeyStrategy {
    PER_USER_ID,
    PER_IP,
    PER_IP_AND_USER_ID,
    CUSTOM,
    PER_IP_AND_CUSTOM,
}
