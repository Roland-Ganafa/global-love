import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main Pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Chat from './pages/Chat';
import Messages from './pages/Messages';
import CreateContent from './pages/CreateContent';
import UserProfile from './pages/UserProfile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!user) {
        return <Navigate to="/login" />;
    }
    
    return children;
};

// Public Route Component (accessible only when not logged in)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (user) {
        return <Navigate to="/" />;
    }
    
    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={
                <PublicRoute>
                    <AuthLayout>
                        <Login />
                    </AuthLayout>
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <AuthLayout>
                        <Register />
                    </AuthLayout>
                </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <MainLayout>
                        <Home />
                    </MainLayout>
                </ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute>
                    <MainLayout>
                        <Profile />
                    </MainLayout>
                </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
                <ProtectedRoute>
                    <MainLayout>
                        <EditProfile />
                    </MainLayout>
                </ProtectedRoute>
            } />
            <Route path="/messages" element={
                <ProtectedRoute>
                    <MainLayout>
                        <Messages />
                    </MainLayout>
                </ProtectedRoute>
            } />
            <Route path="/chat/:chatId" element={
                <ProtectedRoute>
                    <MainLayout>
                        <Chat />
                    </MainLayout>
                </ProtectedRoute>
            } />
            <Route path="/content/create" element={
                <ProtectedRoute>
                    <MainLayout>
                        <CreateContent />
                    </MainLayout>
                </ProtectedRoute>
            } />
            <Route path="/user/:userId" element={
                <ProtectedRoute>
                    <MainLayout>
                        <UserProfile />
                    </MainLayout>
                </ProtectedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
