package com.muicochay.mory.websocket.config;

import com.muicochay.mory.auth.config.JwtTokenHelper;
import com.muicochay.mory.shared.config.AppProperties;
import com.muicochay.mory.shared.config.RabbitMQProperties;
import com.muicochay.mory.websocket.helper.WebSocketAuthHandlerDecorator;
import com.muicochay.mory.websocket.helper.WebSocketAuthHandshakeInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final JwtTokenHelper jwtTokenHelper;
    private final RabbitMQProperties rabbitMQProperties;
    private final AppProperties appProperties;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/api/ws")
                .setAllowedOrigins(appProperties.getFrontendUrl())
                .addInterceptors(new WebSocketAuthHandshakeInterceptor(jwtTokenHelper))
                .setHandshakeHandler(handshakeHandler());
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableStompBrokerRelay("/topic", "/queue")
                .setRelayHost(rabbitMQProperties.getHost())
                .setRelayPort(rabbitMQProperties.getStompPort())
                .setClientLogin(rabbitMQProperties.getUsername())
                .setClientPasscode(rabbitMQProperties.getPassword())
                .setSystemLogin(rabbitMQProperties.getUsername())
                .setSystemPasscode(rabbitMQProperties.getPassword())
                .setSystemHeartbeatReceiveInterval(10000)
                .setSystemHeartbeatSendInterval(10000);
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        registry.addDecoratorFactory(WebSocketAuthHandlerDecorator::new);
    }

    @Bean
    public DefaultHandshakeHandler handshakeHandler() {
        return new DefaultHandshakeHandler() {
            @Override
            protected Principal determineUser(ServerHttpRequest request,
                                              WebSocketHandler wsHandler,
                                              Map<String, Object> attributes) {
                return (Principal) attributes.get("user");
            }
        };
    }
}
