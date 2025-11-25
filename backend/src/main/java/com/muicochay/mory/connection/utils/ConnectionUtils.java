package com.muicochay.mory.connection.utils;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public class ConnectionUtils {
    private ConnectionUtils() {}

    public static UUID generateConnectionId(UUID userA, UUID userB) {
        List<UUID> list = Arrays.asList(userA, userB);
        list.sort(UUID::compareTo);
        String combined = list.get(0).toString() + list.get(1).toString();
        return UUID.nameUUIDFromBytes(combined.getBytes(StandardCharsets.UTF_8));
    }
}
