const router = require('express').Router();
const Conversation = require('../models/Conversation');

// CREATE CONVERSATION (DM OR GROUP)
router.post('/', async (req, res) => {
  try {
    const { type, members, name, createdBy } = req.body;
    
    if (!members || members.length < 2) {
      return res.status(400).json({ error: 'Conversation needs at least 2 members' });
    }

    // For DM, check if conversation already exists
    if (type === 'dm') {
      const existing = await Conversation.findOne({
        type: 'dm',
        members: { $all: members, $size: 2 }
      });
      if (existing) {
        return res.status(200).json(existing);
      }
    }

    const newConversation = new Conversation({
      type: type || 'dm',
      members,
      name: type === 'group' ? name : '',
      createdBy,
    });

    const savedConversation = await newConversation.save();
    res.status(201).json(savedConversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET CONVERSATIONS FOR A USER
router.get('/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
    }).populate('members', 'username email').sort({ updatedAt: -1 });
    
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
