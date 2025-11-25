package com.muicochay.mory.user.interfaces;

import com.muicochay.mory.connection.entity.Connection;

public interface UserProfileAndConnectionProjection {

    String getAvatarUrl();

    String getDisplayName();

    int getConnectionCount();

    Connection getConnection();
}
