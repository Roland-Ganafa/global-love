import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    TextField,
    IconButton,
    Divider,
    Badge,
    useTheme
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import { formatMessageTime } from '../utils/formatters';
import { useSocket } from '../context/SocketContext';

const Chat = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const { socket } = useSocket();
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (currentChat) {
            loadMessages(currentChat._id);
            socket?.emit('join_chat', currentChat._id);
        }
    }, [currentChat, socket]);

    useEffect(() => {
        socket?.on('receive_message', (message) => {
            if (currentChat?._id === message.chatId) {
                setMessages(prev => [...prev, message]);
            }
        });

        return () => {
            socket?.off('receive_message');
        };
    }, [socket, currentChat]);

    const loadConversations = async () => {
        try {
            const response = await chatAPI.getConversations();
            setConversations(response.data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const loadMessages = async (chatId) => {
        try {
            const response = await chatAPI.getMessages(chatId);
            setMessages(response.data);
            scrollToBottom();
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await chatAPI.sendMessage(currentChat._id, newMessage);
            socket?.emit('send_message', {
                chatId: currentChat._id,
                message: response.data
            });
            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getOtherUser = (chat) => {
        return chat.participants.find(p => p._id !== user?._id);
    };

    return (
        <Grid container spacing={2} sx={{ height: 'calc(100vh - 100px)' }}>
            <Grid item xs={12} md={4}>
                <Paper sx={{ height: '100%', overflow: 'auto' }}>
                    <List>
                        {conversations.map((chat) => {
                            const otherUser = getOtherUser(chat);
                            return (
                                <ListItem
                                    key={chat._id}
                                    button
                                    selected={currentChat?._id === chat._id}
                                    onClick={() => setCurrentChat(chat)}
                                >
                                    <ListItemAvatar>
                                        <Badge
                                            color="success"
                                            variant="dot"
                                            invisible={!otherUser?.isOnline}
                                        >
                                            <Avatar src={otherUser?.photo} />
                                        </Badge>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={otherUser?.name}
                                        secondary={chat.lastMessage?.content}
                                        secondaryTypographyProps={{
                                            noWrap: true,
                                            style: {
                                                maxWidth: '200px'
                                            }
                                        }}
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
                <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {currentChat ? (
                        <>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                <Typography variant="h6">
                                    {getOtherUser(currentChat)?.name}
                                </Typography>
                            </Box>

                            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                                {messages.map((message, index) => (
                                    <Box
                                        key={message._id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: message.sender === user?._id ? 'flex-end' : 'flex-start',
                                            mb: 2
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                maxWidth: '70%',
                                                bgcolor: message.sender === user?._id ? 'primary.main' : 'grey.100',
                                                color: message.sender === user?._id ? 'white' : 'text.primary',
                                                borderRadius: 2,
                                                p: 2
                                            }}
                                        >
                                            <Typography variant="body1">
                                                {message.content}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'block',
                                                    textAlign: 'right',
                                                    mt: 0.5
                                                }}
                                            >
                                                {formatMessageTime(message.createdAt)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                                <div ref={messagesEndRef} />
                            </Box>

                            <Box
                                component="form"
                                onSubmit={handleSendMessage}
                                sx={{
                                    p: 2,
                                    borderTop: 1,
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <IconButton size="small" sx={{ mr: 1 }}>
                                    <AttachFileIcon />
                                </IconButton>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    sx={{ mr: 1 }}
                                />
                                <IconButton
                                    color="primary"
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                >
                                    <SendIcon />
                                </IconButton>
                            </Box>
                        </>
                    ) : (
                        <Box
                            sx={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography variant="h6" color="text.secondary">
                                Select a conversation to start chatting
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default Chat;
