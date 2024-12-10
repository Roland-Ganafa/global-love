import { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../services/api';
import { useSocket } from './useSocket';

export const useChat = (chatId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const socket = useSocket();

    useEffect(() => {
        if (chatId) {
            loadMessages();
            socket?.emit('join_chat', chatId);
        }
    }, [chatId]);

    useEffect(() => {
        if (socket) {
            socket.on('receive_message', (message) => {
                setMessages(prev => [...prev, message]);
            });
        }
    }, [socket]);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await chatAPI.getMessages(chatId);
            setMessages(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = useCallback(async (content) => {
        try {
            const response = await chatAPI.sendMessage(chatId, content);
            socket?.emit('send_message', {
                chatId,
                message: response.data
            });
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Failed to send message');
        }
    }, [chatId, socket]);

    const markAsRead = useCallback(async () => {
        try {
            await chatAPI.markAsRead(chatId);
        } catch (err) {
            console.error('Failed to mark messages as read:', err);
        }
    }, [chatId]);

    return {
        messages,
        loading,
        error,
        sendMessage,
        markAsRead
    };
};
