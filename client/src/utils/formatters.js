export const formatDate = (date) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(date).toLocaleDateString(undefined, options);
};

export const formatAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
};

export const formatMessageTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
        return messageDate.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    if (diffInHours < 48) {
        return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
    });
};

export const formatNumber = (number) => {
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M';
    }
    if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
};
