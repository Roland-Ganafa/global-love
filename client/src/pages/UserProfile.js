import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Avatar,
    Typography,
    Button,
    Tabs,
    Tab,
    Card,
    CardMedia,
    CardContent,
    IconButton,
    Chip,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import {
    LocationOn,
    Cake,
    Language,
    Favorite,
    Message,
    Block,
    Edit as EditIcon,
    PhotoLibrary as PhotoLibraryIcon,
    VideoLibrary as VideoLibraryIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, contentAPI } from '../services/api';
import { formatAge, formatDate } from '../utils/formatters';

const UserProfile = () => {
    const theme = useTheme();
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [tab, setTab] = useState(0);
    const [content, setContent] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState(null);

    useEffect(() => {
        loadUserProfile();
        loadUserContent();
    }, [userId]);

    const loadUserProfile = async () => {
        try {
            const response = await userAPI.getUserProfile(userId);
            setUser(response.data);
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    const loadUserContent = async () => {
        try {
            const response = await contentAPI.getUserContent(userId);
            setContent(response.data);
        } catch (error) {
            console.error('Error loading user content:', error);
        }
    };

    const handleLike = async () => {
        try {
            await userAPI.likeUser(userId);
            loadUserProfile();
        } catch (error) {
            console.error('Error liking user:', error);
        }
    };

    const handleMessage = () => {
        navigate(`/chat/new/${userId}`);
    };

    const handleBlock = async () => {
        try {
            await userAPI.blockUser(userId);
            navigate('/messages');
        } catch (error) {
            console.error('Error blocking user:', error);
        }
    };

    if (!user) {
        return null;
    }

    const isOwnProfile = currentUser?._id === userId;

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <Paper sx={{ mb: 3, p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        <Avatar
                            src={user.photo}
                            sx={{
                                width: 200,
                                height: 200,
                                mx: 'auto',
                                mb: 2,
                                border: `4px solid ${theme.palette.primary.main}`
                            }}
                        />
                        {isOwnProfile ? (
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => navigate('/profile/edit')}
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Favorite />}
                                    onClick={handleLike}
                                    color={user.isLiked ? 'secondary' : 'primary'}
                                >
                                    {user.isLiked ? 'Liked' : 'Like'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Message />}
                                    onClick={handleMessage}
                                >
                                    Message
                                </Button>
                                <IconButton onClick={handleBlock}>
                                    <Block />
                                </IconButton>
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" gutterBottom>
                            {user.name}, {formatAge(user.birthDate)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                            {user.location && (
                                <Chip
                                    icon={<LocationOn />}
                                    label={user.location}
                                    variant="outlined"
                                />
                            )}
                            <Chip
                                icon={<Cake />}
                                label={formatDate(user.birthDate)}
                                variant="outlined"
                            />
                            {user.languages?.map(lang => (
                                <Chip
                                    key={lang}
                                    icon={<Language />}
                                    label={lang}
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                        <Typography variant="body1" paragraph>
                            {user.bio}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Paper>
                <Tabs
                    value={tab}
                    onChange={(e, newValue) => setTab(newValue)}
                    centered
                >
                    <Tab icon={<PhotoLibraryIcon />} label="Photos" />
                    <Tab icon={<VideoLibraryIcon />} label="Videos" />
                    <Tab label="About" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {tab === 0 && (
                        <Grid container spacing={2}>
                            {content
                                .filter(item => item.mediaType === 'image')
                                .map(item => (
                                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                                        <Card>
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={item.mediaUrl}
                                                onClick={() => setSelectedMedia(item)}
                                                sx={{ cursor: 'pointer' }}
                                            />
                                            <CardContent>
                                                <Typography variant="h6" noWrap>
                                                    {item.title}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                        </Grid>
                    )}

                    {tab === 1 && (
                        <Grid container spacing={2}>
                            {content
                                .filter(item => item.mediaType === 'video')
                                .map(item => (
                                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                                        <Card>
                                            <CardMedia
                                                component="video"
                                                height="200"
                                                src={item.mediaUrl}
                                                controls
                                            />
                                            <CardContent>
                                                <Typography variant="h6" noWrap>
                                                    {item.title}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                        </Grid>
                    )}

                    {tab === 2 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    Basic Information
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {user.interests?.length > 0 && (
                                        <Box>
                                            <Typography variant="subtitle1" color="text.secondary">
                                                Interests
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                {user.interests.map(interest => (
                                                    <Chip
                                                        key={interest}
                                                        label={interest}
                                                        size="small"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                    {user.education && (
                                        <Box>
                                            <Typography variant="subtitle1" color="text.secondary">
                                                Education
                                            </Typography>
                                            <Typography>{user.education}</Typography>
                                        </Box>
                                    )}
                                    {user.occupation && (
                                        <Box>
                                            <Typography variant="subtitle1" color="text.secondary">
                                                Occupation
                                            </Typography>
                                            <Typography>{user.occupation}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" gutterBottom>
                                    Looking For
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {user.lookingFor && (
                                        <Typography>{user.lookingFor}</Typography>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Paper>

            <Dialog
                open={Boolean(selectedMedia)}
                onClose={() => setSelectedMedia(null)}
                maxWidth="md"
                fullWidth
            >
                {selectedMedia && (
                    <>
                        <DialogTitle>{selectedMedia.title}</DialogTitle>
                        <DialogContent>
                            <img
                                src={selectedMedia.mediaUrl}
                                alt={selectedMedia.title}
                                style={{ width: '100%', height: 'auto' }}
                            />
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                {selectedMedia.description}
                            </Typography>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default UserProfile;
