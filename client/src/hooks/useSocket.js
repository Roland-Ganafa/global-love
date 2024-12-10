import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export const useSocket = () => {
    const { user } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        if (user && !socketRef.current) {
            const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
            socketRef.current = io(SOCKET_URL, {
                auth: {
                    token: localStorage.getItem('token')
                }
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected');
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user]);

    return socketRef.current;
};
