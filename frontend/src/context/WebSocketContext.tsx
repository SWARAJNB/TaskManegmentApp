import React, { createContext, useContext, useEffect, useRef } from 'react';

type WebSocketContextType = {
    socket: WebSocket | null;
    lastMessage: any;
};

const WebSocketContext = createContext<WebSocketContextType>({ socket: null, lastMessage: null });

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const socket = useRef<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = React.useState<any>(null);

    useEffect(() => {
        // Simple random ID for client differentiation in this demo
        const clientId = Math.floor(Math.random() * 1000);
        // Determine WS URL from API URL
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const wsBase = apiBase.replace(/^http/, 'ws');
        const ws = new WebSocket(`${wsBase}/ws/${clientId}`);

        ws.onopen = () => {
            console.log('Connected to WebSocket');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLastMessage(data);
            } catch (e) {
                console.error("Failed to parse WebSocket message", e);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket');
        };

        socket.current = ws;

        return () => {
            ws.close();
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ socket: socket.current, lastMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
