import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && user) {
            // Connect to the Socket.IO server
            const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
                query: { userId: user._id },
                transports: ['websocket'],
                withCredentials: true,
            });

            // Set up event listeners
            newSocket.on('connect', () => {
                console.log('Socket connected');
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            newSocket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            setSocket(newSocket);

            // Cleanup on unmount
            return () => {
                newSocket.close();
            };
        } else {
            // If user logs out, close the socket
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
