package com.muicochay.mory.connection.interfaces;

import com.muicochay.mory.connection.enums.ConnectionType;

import java.util.UUID;

public interface ConnectedUserProjection {
    UUID getUserId();
    ConnectionType getConnectionType();
}
