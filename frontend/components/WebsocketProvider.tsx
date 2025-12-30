"use client";

import React, {
    createContext, useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { Client, IMessage } from "@stomp/stompjs";
import {useAuthStore} from "@/store/useAuthStore";
import {API_ENDPOINTS, WS_ENDPOINTS, WS_SEND, WS_URL} from "@/constants/apiEndpoints";
import {ChatMessage, ChatMessageRequest, LastReadState} from "@/types/conversations";
import {useCurrentConversationStore} from "@/store/conversation/useCurrentConversationStore";
import {useConversationsStore} from "@/store/conversation/useConversationStore";
import {shallow} from "zustand/vanilla/shallow";
import {rawAxios} from "@/lib/axios";
import {useNotificationsStore} from "@/store/notification/useNotificationStore";
import {Notification} from "@/types/notifications";

type WSContextType = {
    connected: boolean;
    connect: () => void;
    disconnect: () => void;
    sendMessage: (message: ChatMessageRequest) => void;
    updateLastReadState: (conversationId: string, messageId: string) => void;
};

const WSContext = createContext<WSContextType>({
    connected: false,
    connect: () => {},
    disconnect: () => {},
    sendMessage: () => {},
    updateLastReadState: () => {},
});

const WebSocketProvider = ({
                               children
                           }: {
    children: React.ReactNode;
}) => {
    const stompRef = useRef<Client | null>(null);
    const [connected, setConnected] = useState(false);

    const user = useAuthStore((state) => state.user);

    const {
        addMessage,
        updateCurrentConversation,
        updateMemberInCurrentConversation
    } = useCurrentConversationStore(
        (state) => ({
            addMessage: state.addMessage,
            updateCurrentConversation: state.updateConversation,
            updateMemberInCurrentConversation: state.updateMemberInConversation
        }),
        shallow
    )
    
    const {
        updateConversationInList,
        updateMemberInConversationList,
        increaseMyUnreadCount,
        resetMyUnreadCount
    } = useConversationsStore(
        (state) => ({
            updateConversationInList: state.updateConversation,
            updateMemberInConversationList: state.updateMemberInConversation,
            increaseMyUnreadCount: state.increaseMyUnreadCount,
            resetMyUnreadCount: state.resetMyUnreadCount
        }),
        shallow
    )
    
    const addNotification = useNotificationsStore((state) => state.addNotification);

    // ================= SUBSCRIPTIONS =================
    const subscribeDefault = useCallback((client: Client) => {
        console.log("Subscribing default channels...");
        client.subscribe(WS_ENDPOINTS.USER.MESSAGES, (msg: IMessage) => {
            const chatMessage: ChatMessage = JSON.parse(msg.body);
            if (!chatMessage) return;
            increaseMyUnreadCount(chatMessage.conversationId, chatMessage.senderId)
            console.log("received message", chatMessage);
            addMessage(chatMessage, chatMessage.conversationId);
            updateConversationInList(
                chatMessage.conversationId,
                {
                    lastMessage: chatMessage,
                    lastMessageSentAt: chatMessage.createdAt
                }
            )
            updateCurrentConversation(
                chatMessage.conversationId,
                {
                    lastMessage: chatMessage,
                    lastMessageSentAt: chatMessage.createdAt
                }
            )
        });

        client.subscribe(WS_ENDPOINTS.USER.LAST_READ_STATUS, (msg: IMessage) => {
            const lastReadState: LastReadState = JSON.parse(msg.body);
            console.log("recieved last-read-state", lastReadState);
            if (!lastReadState) return;
            console.log("last read state", lastReadState);
            updateMemberInConversationList(
                lastReadState.conversationId,
                lastReadState.userId,
                {
                    lastReadAt: lastReadState.lastReadAt,
                    lastReadMessageId: lastReadState.lastReadMessageId
                }
            )
            
            updateMemberInCurrentConversation(
                lastReadState.conversationId,
                lastReadState.userId,
                {
                    lastReadAt: lastReadState.lastReadAt,
                    lastReadMessageId: lastReadState.lastReadMessageId
                }
            )
        })

        client.subscribe(WS_ENDPOINTS.USER.NOTIFICATIONS, (msg: IMessage) => {
            const notification: Notification = JSON.parse(msg.body);
            console.log("received notification", notification);
            addNotification(notification);
        })
    }, [addMessage, addNotification, increaseMyUnreadCount, updateConversationInList, updateCurrentConversation, updateMemberInConversationList, updateMemberInCurrentConversation]);

    // ================= DISCONNECT =================
    const disconnect = useCallback(() => {
        if (!stompRef.current) return;

        void stompRef.current.deactivate();
        stompRef.current = null;
        setConnected(false);

        console.log("WS disconnected");
    }, []);

    // ================= CONNECT =================
    const connect = useCallback(() => {
        if (!user || stompRef.current) return;

        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 4000,
            debug: (msg: string) => {
                console.log("[STOMP]", msg);
            },
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            onConnect: () => {
                console.log("WS connected");
                setConnected(true);
                subscribeDefault(client);
            },

            onStompError: (frame) => {
                console.error("STOMP error:", frame);
            },

            onWebSocketClose: async (evt) => {
                console.warn("WS closed");
                setConnected(false);
                if (evt.code === 4001) {
                    console.log("refresh")
                    try {
                        await rawAxios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);

                        if (stompRef.current) {
                            await stompRef.current.deactivate();
                            stompRef.current = null;
                        }

                        connect();
                    } catch (e) {
                        console.error("Refresh failed", e);
                    }
                }
            },
        });

        stompRef.current = client;
        client.activate();
    }, [subscribeDefault, user]);

    // ================= SEND MESSAGE =================
    const sendMessage = useCallback((message: ChatMessageRequest) => {
        if (!stompRef.current || !connected) {
            console.warn("WS not connected");
            return;
        }

        stompRef.current.publish({
            destination: WS_SEND.CHAT.SEND_MESSAGE,
            body: JSON.stringify(message),
        });
    }, [connected]);

    const updateLastReadState = useCallback((conversationId: string, messageId: string) => {
        if (!stompRef.current || !connected) {
            console.warn("WS not connected");
            return;
        }
        
        const payload = {
            conversationId: conversationId,
            messageId: messageId,
        }

        console.log("last read state payload", payload)
        
        stompRef.current.publish({
            destination: WS_SEND.CHAT.UPDATE_LAST_READ_STATUS,
            body: JSON.stringify(payload),
        })
        
        resetMyUnreadCount(conversationId);
    }, [connected, resetMyUnreadCount])

    useEffect(() => {
        if (user) connect();
        else disconnect();
    }, [connect, disconnect, user]);

    return (
        <WSContext.Provider
            value={{
                connected,
                connect,
                disconnect,
                sendMessage,
                updateLastReadState
            }}
        >
            {children}
        </WSContext.Provider>
    );
}

export { WSContext };
export default WebSocketProvider;
