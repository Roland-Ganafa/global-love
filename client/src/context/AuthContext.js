import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const response = await userAPI.getProfile();
            setUser(response.data);
            setError(null);
        } catch (err) {
            console.error('Load user error:', err);
            localStorage.removeItem('token');
            setError('Session expired. Please login again.');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            setError(null);
            return true;
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Login failed');
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            console.log('Registering user with data:', {
                ...userData,
                password: '[REDACTED]'
            });
            const response = await authAPI.register(userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            setError(null);
            return true;
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.error || 'Registration failed');
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setError(null);
    };

    const updateProfile = async (profileData) => {
        try {
            console.log('Updating profile with data:', profileData);
            const response = await userAPI.updateProfile(profileData);
            console.log('Profile update response:', response);
            setUser(response.data);
            setError(null);
            return response.data;
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.response?.data?.error || 'Failed to update profile');
            throw err;
        }
    };

    const updatePhoto = async (photoUrl) => {
        try {
            setUser(prev => ({
                ...prev,
                photos: [...(prev.photos || []), { url: photoUrl }]
            }));
        } catch (err) {
            console.error('Photo update error:', err);
            setError('Failed to update photo');
            throw err;
        }
    };

    const updateVideoProfile = async (videoUrl) => {
        try {
            setUser(prev => ({
                ...prev,
                videoProfile: { url: videoUrl }
            }));
        } catch (err) {
            console.error('Video profile update error:', err);
            setError('Failed to update video profile');
            throw err;
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        updatePhoto,
        updateVideoProfile,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
