import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    IconButton,
    Button,
    Avatar,
    Chip,
    useTheme
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    ChatBubbleOutline as CommentIcon,
    Share as ShareIcon
} from '@mui/icons-material';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { contentAPI } from '../services/api';
import { formatDate } from '../utils/formatters';

const ContentCard = ({ content, onLike, onComment }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <Card sx={{ mb: 2 }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <Avatar
                    src={content.creator.photo}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/user/${content.creator._id}`)}
                />
                <Box sx={{ ml: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {content.creator.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {formatDate(content.createdAt)}
                    </Typography>
                </Box>
            </Box>

            <CardMedia
                component="video"
                controls
                src={content.videoUrl}
                sx={{ width: '100%', maxHeight: '600px' }}
            />

            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {content.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    {content.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                    {content.tags.map((tag) => (
                        <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                        />
                    ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <IconButton onClick={() => onLike(content._id)} color={content.isLiked ? "primary" : "default"}>
                            <FavoriteIcon />
                        </IconButton>
                        <IconButton onClick={() => onComment(content._id)}>
                            <CommentIcon />
                        </IconButton>
                        <IconButton>
                            <ShareIcon />
                        </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {content.likes.length} likes · {content.comments.length} comments
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

const Home = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const fetchContent = async (page) => {
        const response = await contentAPI.getFeed({ page, limit: 10 });
        return response.data;
    };

    const { data: contents, loading, error, refresh } = useInfiniteScroll(fetchContent);

    const handleLike = async (contentId) => {
        try {
            await contentAPI.like(contentId);
            refresh();
        } catch (error) {
            console.error('Error liking content:', error);
        }
    };

    const handleComment = (contentId) => {
        // Navigate to content detail page or open comment modal
    };

    if (error) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="error" gutterBottom>
                    Error loading content
                </Typography>
                <Button variant="contained" onClick={refresh}>
                    Try Again
                </Button>
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                {contents.map((content) => (
                    <ContentCard
                        key={content._id}
                        content={content}
                        onLike={handleLike}
                        onComment={handleComment}
                    />
                ))}
                {loading && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography>Loading more content...</Typography>
                    </Box>
                )}
            </Grid>

            <Grid item xs={12} md={4}>
                <Card sx={{ position: 'sticky', top: theme.spacing(2) }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Share Your Story
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Create and share content to connect with others around the world.
                        </Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => navigate('/content/create')}
                        >
                            Create Content
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Home;
