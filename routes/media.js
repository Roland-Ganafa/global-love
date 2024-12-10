const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Configure multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'photo') {
        // Allow only image files
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Please upload only images'), false);
        }
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid image type. Only JPG, JPEG, and PNG are allowed'), false);
        }
    } else if (file.fieldname === 'video') {
        // Allow only video files
        if (!file.mimetype.startsWith('video/')) {
            return cb(new Error('Please upload only videos'), false);
        }
        const allowedTypes = ['video/mp4', 'video/quicktime'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid video type. Only MP4 and MOV are allowed'), false);
        }
    }
    cb(null, true);
};

const limits = {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});

// Upload photo
router.post('/upload/photo', auth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Create URL for the uploaded file
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const result = {
            url: fileUrl,
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        };

        res.json(result);
    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({ error: error.message || 'Error uploading photo' });
    }
});

// Upload video
router.post('/upload/video', auth, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Create URL for the uploaded file
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const result = {
            url: fileUrl,
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        };

        res.json(result);
    } catch (error) {
        console.error('Video upload error:', error);
        res.status(500).json({ error: error.message || 'Error uploading video' });
    }
});

// Delete media
router.delete('/delete/:filename', auth, async (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(__dirname, '../uploads', filename);

        // Check if file exists
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Delete file
        fs.unlinkSync(filepath);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({ error: error.message || 'Error deleting file' });
    }
});

// Error handling middleware
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large. Maximum size is 50MB'
            });
        }
        return res.status(400).json({
            error: error.message
        });
    }
    next(error);
});

module.exports = router;
