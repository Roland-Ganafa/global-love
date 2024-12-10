import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

const AuthLayout = ({ children }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: theme.palette.background.default
            }}
        >
            <Box
                sx={{
                    py: 4,
                    textAlign: 'center',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white'
                }}
            >
                <Container maxWidth="sm">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Global Love
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">
                            True People
                        </Typography>
                        <FavoriteIcon sx={{ mx: 1 }} />
                        <Typography variant="subtitle1">
                            True Love
                        </Typography>
                    </Box>
                </Container>
            </Box>

            <Container
                component="main"
                maxWidth="sm"
                sx={{
                    mt: -4,
                    mb: 4,
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <Box
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: 2,
                        boxShadow: theme.shadows[3],
                        p: 4
                    }}
                >
                    {children}
                </Box>
            </Container>

            <Box
                component="footer"
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                    backgroundColor: theme.palette.background.paper,
                    textAlign: 'center'
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    © {new Date().getFullYear()} Global Love. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
};

export default AuthLayout;
