import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#FF4B91',
            light: '#FF8DC7',
            dark: '#D81159',
            contrastText: '#fff'
        },
        secondary: {
            main: '#8F3985',
            light: '#B56576',
            dark: '#6D213C',
            contrastText: '#fff'
        },
        background: {
            default: '#F8F9FA',
            paper: '#FFFFFF'
        }
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem'
        },
        h2: {
            fontWeight: 600,
            fontSize: '2rem'
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem'
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem'
        },
        h5: {
            fontWeight: 500,
            fontSize: '1.25rem'
        },
        h6: {
            fontWeight: 500,
            fontSize: '1rem'
        },
        subtitle1: {
            fontSize: '1.1rem',
            fontWeight: 500
        },
        subtitle2: {
            fontSize: '0.9rem',
            fontWeight: 500
        }
    },
    shape: {
        borderRadius: 12
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 25,
                    padding: '8px 24px'
                },
                containedPrimary: {
                    '&:hover': {
                        backgroundColor: '#FF6B9F'
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12
                    }
                }
            }
        }
    }
});

export default theme;
