package com.muicochay.mory.cache.util;

import java.util.UUID;

/**
 * Utility class for generating consistent cache keys used across the
 * application.
 * <p>
 * These keys help ensure proper namespacing and avoid collisions in the cache
 * store.
 */
public class CacheKeys {

    public static String getUserByIdKey(UUID userId) {
        return "getUserById::" + userId;
    }

    public static String checkAuthKey(UUID userId) {
        return "checkAuth::" + userId;
    }
}
