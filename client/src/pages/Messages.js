import React, { useState, useEffect } from 'react';
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
    IconButton,
    Badge,
    Tabs,
    Tab,
    useTheme
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Block as BlockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import { formatMessageTime } from '../utils/formatters';

const Messages = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tab, setTab] = useState(0);
    const [conversations, setConversations] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);

    useEffect(() => {
        loadConversations();
        loadBlockedUsers();
    }, []);

    const loadConversations = async () => {
        try {
            const response = await chatAPI.getConversations();
            setConversations(response.data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const loadBlockedUsers = async () => {
        try {
            const response = await chatAPI.getBlockedUsers();
            setBlockedUsers(response.data);
        } catch (error) {
            console.error('Error loading blocked users:', error);
        }
    };

    const handleDeleteConversation = async (conversationId) => {
        try {
            await chatAPI.deleteConversation(conversationId);
            setConversations(prev => prev.filter(conv => conv._id !== conversationId));
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    const handleBlockUser = async (userId) => {
        try {
            await chatAPI.blockUser(userId);
            loadBlockedUsers();
        } catch (error) {
            console.error('Error blocking user:', error);
        }
    };

    const handleUnblockUser = async (userId) => {
        try {
            await chatAPI.unblockUser(userId);
            setBlockedUsers(prev => prev.filter(user => user._id !== userId));
        } catch (error) {
            console.error('Error unblocking user:', error);
        }
    };

    const getOtherUser = (conversation) => {
        return conversation.participants.find(p => p._id !== user?._id);
    };

    return (
        <Paper sx={{ height: 'calc(100vh - 100px)' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
                    <Tab label="Messages" />
                    <Tab label="Blocked Users" />
                </Tabs>
            </Box>

            {tab === 0 ? (
                <List sx={{ overflow: 'auto', height: 'calc(100% - 48px)' }}>
                    {conversations.map((conversation) => {
                        const otherUser = getOtherUser(conversation);
                        return (
                            <ListItem
                                key={conversation._id}
                                button
                                onClick={() => navigate(`/chat/${conversation._id}`)}
                                secondaryAction={
                                    <Box>
                                        <IconButton
                                            edge="end"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBlockUser(otherUser._id);
                                            }}
                                        >
                                            <BlockIcon />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteConversation(conversation._id);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                }
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
                                    secondary={
                                        <React.Fragment>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {conversation.lastMessage?.content}
                                            </Typography>
                                            {' — '}
                                            {formatMessageTime(conversation.lastMessage?.createdAt)}
                                        </React.Fragment>
                                    }
                                />
                            </ListItem>
                        );
                    })}
                </List>
            ) : (
                <List sx={{ overflow: 'auto', height: 'calc(100% - 48px)' }}>
                    {blockedUsers.map((blockedUser) => (
                        <ListItem
                            key={blockedUser._id}
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    onClick={() => handleUnblockUser(blockedUser._id)}
                                >
                                    <BlockIcon />
                                </IconButton>
                            }
                        >
                            <ListItemAvatar>
                                <Avatar src={blockedUser.photo} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={blockedUser.name}
                                secondary={`Blocked on ${new Date(blockedUser.blockedAt).toLocaleDateString()}`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
};

export default Messages;
