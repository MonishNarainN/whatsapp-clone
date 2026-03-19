const router = require('express').Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// SEND MESSAGE
router.post('/:id/messages', async (req, res) => {
  try {
    const { sender, text } = req.body;
    const conversationId = req.params.id;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const newMessage = new Message({
      conversationId,
      sender,
      text,
    });

    const savedMessage = await newMessage.save();
    
    // Update conversation updatedAt
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET MESSAGES
router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.id,
    }).populate('sender', 'username email').sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
