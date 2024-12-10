import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import {
    Box,
    Button,
    TextField,
    Typography,
    Link,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { loginSchema } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const [showPassword, setShowPassword] = React.useState(false);
    const { login } = useAuth();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: loginSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const success = await login(values.email, values.password);
                if (success) {
                    toast.success('Welcome back!');
                }
            } catch (error) {
                toast.error(error.message);
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom align="center">
                Welcome Back
            </Typography>
            <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
                Find your perfect match with Global Love
            </Typography>

            <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 4 }}>
                <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    margin="normal"
                />

                <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    margin="normal"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={formik.isSubmitting}
                    sx={{ mt: 3, mb: 2 }}
                >
                    Sign In
                </Button>

                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Don't have an account?{' '}
                    <Link component={RouterLink} to="/register" variant="body2">
                        Sign up here
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default Login;
