import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Avatar,
    Tabs,
    Tab,
    IconButton,
    useTheme
} from '@mui/material';
import {
    Edit as EditIcon,
    LocationOn as LocationIcon,
    Cake as CakeIcon,
    Flag as FlagIcon,
    Favorite as FavoriteIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { contentAPI } from '../services/api';
import countries from '../utils/countries';

const TabPanel = ({ children, value, index, ...other }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`profile-tabpanel-${index}`}
        aria-labelledby={`profile-tab-${index}`}
        {...other}
    >
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
);

const Profile = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);

    const fetchUserContent = async (page) => {
        const response = await contentAPI.getUserContent(user._id, { page, limit: 9 });
        return response.data;
    };

    const { data: userContent, loading } = useInfiniteScroll(fetchUserContent);

    const countryName = countries.find(c => c.code === user?.country)?.name || user?.country;

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card>
                    <CardContent>
                        <Box sx={{ position: 'relative', mb: 2 }}>
                            <Avatar
                                src={user?.photo}
                                sx={{
                                    width: 120,
                                    height: 120,
                                    margin: '0 auto',
                                    border: `4px solid ${theme.palette.primary.main}`
                                }}
                            />
                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 0
                                }}
                                onClick={() => navigate('/profile/edit')}
                            >
                                <EditIcon />
                            </IconButton>
                        </Box>

                        <Typography variant="h5" align="center" gutterBottom>
                            {user?.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CakeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {user?.age} years old
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {countryName}
                            </Typography>
                        </Box>

                        {user?.bio && (
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ mt: 2, mb: 2 }}
                            >
                                {user.bio}
                            </Typography>
                        )}

                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<EditIcon />}
                            onClick={() => navigate('/profile/edit')}
                            sx={{ mb: 2 }}
                        >
                            Edit Profile
                        </Button>
                    </CardContent>
                </Card>

                <Card sx={{ mt: 2 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Partner Preferences
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Age Range
                            </Typography>
                            <Typography variant="body1">
                                {user?.partnerPreferences?.ageRange?.min || 18} - {user?.partnerPreferences?.ageRange?.max || 100} years
                            </Typography>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Preferred Countries
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                {user?.partnerPreferences?.countries?.map((countryCode) => {
                                    const country = countries.find(c => c.code === countryCode);
                                    return (
                                        <Box
                                            key={countryCode}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                bgcolor: 'background.default',
                                                p: 1,
                                                borderRadius: 1
                                            }}
                                        >
                                            <FlagIcon sx={{ mr: 1, fontSize: 16 }} />
                                            <Typography variant="body2">
                                                {country?.name || countryCode}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={8}>
                <Card>
                    <Tabs
                        value={tabValue}
                        onChange={(e, newValue) => setTabValue(newValue)}
                        variant="fullWidth"
                    >
                        <Tab label="Content" />
                        <Tab label="About" />
                        <Tab label="Photos" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={2}>
                            {userContent.map((content) => (
                                <Grid item xs={12} sm={6} md={4} key={content._id}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" noWrap>
                                                {content.title}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mt: 1
                                                }}
                                            >
                                                <FavoriteIcon
                                                    sx={{
                                                        fontSize: 16,
                                                        mr: 0.5,
                                                        color: 'text.secondary'
                                                    }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {content.likes.length} likes
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        {loading && (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography>Loading more content...</Typography>
                            </Box>
                        )}
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Typography variant="body1" paragraph>
                            {user?.bio || 'No bio available'}
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            Interests
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {user?.interests?.map((interest) => (
                                <Box
                                    key={interest}
                                    sx={{
                                        bgcolor: 'background.default',
                                        p: 1,
                                        borderRadius: 1
                                    }}
                                >
                                    <Typography variant="body2">
                                        {interest}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <Grid container spacing={2}>
                            {user?.photos?.map((photo, index) => (
                                <Grid item xs={6} sm={4} key={index}>
                                    <img
                                        src={photo.url}
                                        alt={`Photo ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: 200,
                                            objectFit: 'cover',
                                            borderRadius: theme.shape.borderRadius
                                        }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </TabPanel>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Profile;
