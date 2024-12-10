const express = require('express');
const Content = require('../models/Content');
const auth = require('../middleware/auth');
const router = express.Router();

// Get content feed
router.get('/feed', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const content = await Content.find({ status: 'active' })
            .populate('creator', 'name photo')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new content
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, videoUrl, publicId, thumbnail, tags } = req.body;

        const content = new Content({
            creator: req.user._id,
            title,
            description,
            videoUrl,
            publicId,
            thumbnail,
            tags
        });

        await content.save();
        await content.populate('creator', 'name photo');

        res.status(201).json(content);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Like/Unlike content
router.post('/:contentId/like', auth, async (req, res) => {
    try {
        const content = await Content.findById(req.params.contentId);
        
        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        const likeIndex = content.likes.indexOf(req.user._id);
        
        if (likeIndex === -1) {
            content.likes.push(req.user._id);
        } else {
            content.likes.splice(likeIndex, 1);
        }

        await content.save();
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add comment to content
router.post('/:contentId/comments', auth, async (req, res) => {
    try {
        const content = await Content.findById(req.params.contentId);
        
        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        const comment = {
            user: req.user._id,
            text: req.body.text
        };

        content.comments.push(comment);
        await content.save();

        // Populate user info for the new comment
        await content.populate('comments.user', 'name photo');

        res.status(201).json(content.comments[content.comments.length - 1]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user's content
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const content = await Content.find({
            creator: req.params.userId,
            status: 'active'
        })
        .populate('creator', 'name photo')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

        res.json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete content
router.delete('/:contentId', auth, async (req, res) => {
    try {
        const content = await Content.findOne({
            _id: req.params.contentId,
            creator: req.user._id
        });

        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        content.status = 'removed';
        await content.save();

        res.json({ message: 'Content removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
