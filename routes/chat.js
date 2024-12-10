const express = require('express');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all chats for current user
router.get('/', auth, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id
        })
        .populate('participants', 'name photo lastActive')
        .sort({ lastMessage: -1 });

        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get or create chat with specific user
router.post('/user/:userId', auth, async (req, res) => {
    try {
        // Check if chat already exists
        let chat = await Chat.findOne({
            participants: {
                $all: [req.user._id, req.params.userId]
            }
        }).populate('participants', 'name photo lastActive');

        if (!chat) {
            // Create new chat
            chat = new Chat({
                participants: [req.user._id, req.params.userId]
            });
            await chat.save();
            chat = await chat.populate('participants', 'name photo lastActive');
        }

        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send message in chat
router.post('/:chatId/messages', auth, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            participants: req.user._id
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        const message = {
            sender: req.user._id,
            content: req.body.content
        };

        chat.messages.push(message);
        chat.lastMessage = new Date();
        await chat.save();

        // Populate sender info for real-time update
        const populatedMessage = await Chat.populate(message, {
            path: 'sender',
            select: 'name photo'
        });

        res.json(populatedMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark messages as read
router.post('/:chatId/read', auth, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            participants: req.user._id
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        // Mark all messages from other participant as read
        chat.messages.forEach(message => {
            if (message.sender.toString() !== req.user._id.toString()) {
                message.read = true;
            }
        });

        await chat.save();
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get chat messages with pagination
router.get('/:chatId/messages', auth, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        const chat = await Chat.findOne({
            _id: req.params.chatId,
            participants: req.user._id
        })
        .populate({
            path: 'messages.sender',
            select: 'name photo'
        })
        .slice('messages', [skip, parseInt(limit)])
        .sort({ 'messages.createdAt': -1 });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        res.json(chat.messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
