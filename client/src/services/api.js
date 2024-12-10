import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API URL:', API_URL); // Log the API URL being used

const api = axios.create({
    baseURL: API_URL
});

// Request interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
        method: config.method,
        url: config.url,
        data: config.data
    });
    return config;
}, (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use((response) => {
    console.log('API Response:', {
        status: response.status,
        data: response.data
    });
    return response;
}, (error) => {
    console.error('API Response Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
    });
    return Promise.reject(error);
});

export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh-token'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
};

export const userAPI = {
    updateProfile: async (data) => {
        try {
            // Validate data before sending
            if (!data) {
                throw new Error('Profile data is required');
            }

            // Clean up the data object
            const cleanData = Object.keys(data).reduce((acc, key) => {
                if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                    acc[key] = data[key];
                }
                return acc;
            }, {});

            // Validate required fields
            if (cleanData.name && cleanData.name.trim().length === 0) {
                throw new Error('Name cannot be empty');
            }

            if (cleanData.age && (cleanData.age < 18 || cleanData.age > 120)) {
                throw new Error('Age must be between 18 and 120');
            }

            // Make the API call
            const response = await api.put('/users/profile', cleanData);
            console.log('Profile update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Profile update error:', error.response?.data || error.message);
            throw error;
        }
    },
    
    addPhoto: async (formData) => {
        try {
            const response = await api.post('/media/upload/photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Photo upload response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Photo upload error:', error.response?.data || error.message);
            throw error;
        }
    },
    updateVideoProfile: (formData) => api.post('/media/upload/video', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log('Upload progress:', percentCompleted);
        }
    }).then(response => {
        console.log('Video upload response:', response);
        return response.data;
    }).catch(error => {
        console.error('Video upload error:', error.response?.data || error.message);
        throw error;
    }),
    deleteMedia: (filename) => api.delete(`/media/delete/${filename}`),
    getProfile: (userId) => api.get(`/users/profile/${userId}`),
    searchUsers: (params) => api.get('/users/search', { params })
};

export const contentAPI = {
    getFeed: (params) => api.get('/content', { params }),
    getUserContent: (userId, params) => api.get(`/content/user/${userId}`, { params }),
    createContent: (formData) => api.post('/content', formData),
    updateContent: (contentId, data) => api.put(`/content/${contentId}`, data),
    deleteContent: (contentId) => api.delete(`/content/${contentId}`),
    likeContent: (contentId) => api.post(`/content/${contentId}/like`),
    unlikeContent: (contentId) => api.delete(`/content/${contentId}/like`),
    getComments: (contentId, params) => api.get(`/content/${contentId}/comments`, { params }),
    addComment: (contentId, text) => api.post(`/content/${contentId}/comments`, { text }),
    deleteComment: (contentId, commentId) => api.delete(`/content/${contentId}/comments/${commentId}`),
    reportContent: (contentId, reason) => api.post(`/content/${contentId}/report`, { reason })
};

export const chatAPI = {
    getConversations: () => api.get('/chat/conversations'),
    getConversation: (conversationId) => api.get(`/chat/conversations/${conversationId}`),
    createConversation: (userId) => api.post('/chat/conversations', { userId }),
    getMessages: (conversationId, params) => api.get(`/chat/conversations/${conversationId}/messages`, { params }),
    sendMessage: (conversationId, text) => api.post(`/chat/conversations/${conversationId}/messages`, { text }),
    deleteMessage: (conversationId, messageId) => api.delete(`/chat/conversations/${conversationId}/messages/${messageId}`),
    markAsRead: (conversationId) => api.put(`/chat/conversations/${conversationId}/read`)
};

export const notificationAPI = {
    getNotifications: (params) => api.get('/notifications', { params }),
    markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    updatePushToken: (token) => api.post('/notifications/push-token', { token })
};

export const searchAPI = {
    searchUsers: (params) => api.get('/search/users', { params }),
    searchContent: (params) => api.get('/search/content', { params }),
    getPopularTags: () => api.get('/search/popular-tags')
};

export default api;
