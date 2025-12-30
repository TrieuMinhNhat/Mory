package com.muicochay.mory.websocket.helper;

import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;

import java.util.Date;

public class WebSocketAuthHandlerDecorator extends WebSocketHandlerDecorator {

    public WebSocketAuthHandlerDecorator(WebSocketHandler delegate) {
        super(delegate);
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message)
            throws Exception {

        Date expiry = (Date) session.getAttributes().get("tokenExpiry");

        if (expiry != null && expiry.before(new Date())) {
            if (session.isOpen()) {
                session.close(new CloseStatus(4001, "ACCESS_TOKEN_EXPIRED"));
                System.out.println("token expired");
            }
            return;
        }

        super.handleMessage(session, message);
    }
}
