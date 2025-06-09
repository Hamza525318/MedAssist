const ChatHistory = require("../models/chatHistory");
const axios = require("axios")

// 1. Create a new chat session
const createChat = async (req, res) => {
  const { name, patientId } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Chat name is required' });
  }

  try {
    const chat = await ChatHistory.create({
      name,
      doctorId: req.user.id,
      patientId: patientId || null,
      messages: []
    });

    return res.status(201).json({ success: true, data: chat });
  } catch (error) {
    console.error('Create chat error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 2. Get all chats for the logged-in doctor
const getAllChats = async (req, res) => {
  try {
    const chats = await ChatHistory.find({ doctorId: req.user.id })
      .select('name startedAt lastUpdatedAt patientId')
      .sort({ lastUpdatedAt: -1 });

    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    console.error('Fetch chats error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 3. Get all messages for a specific chat
const getMessagesByChatId = async (req, res) => {
  const { chatId } = req.params;

  console.log("CHAT ID",chatId);

  try {
    const chat = await ChatHistory.findOne({
      _id: chatId,
      doctorId: req.user.id
    });


    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    return res.status(200).json({ success: true, data: chat.messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 4. Delete a chat session
const deleteChatById = async (req, res) => {
  const { chatId } = req.body;

  console.log("DELETE CHAT ID",chatId);

  try {
    const result = await ChatHistory.findOneAndDelete({
      _id: chatId,
      doctorId: req.user.id
    });

    if (!result) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    return res.status(200).json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    console.error('Delete chat error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateChatById = async (req, res) => {
 
  const { chatId } = req.params;
  const { name } = req.body;

  console.log("CHAT ID RENAME",chatId);
  console.log("NAME",name);

  try {
    const chat = await ChatHistory.findOneAndUpdate(
      { _id: chatId, doctorId: req.user.id },
      { name },
      { new: true }
    );
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    return res.status(200).json({ success: true, data: chat });
  } catch (error) {
    console.error('Update chat error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
const testHDBQuota = async (req, res) => {
  try {
    const hdbUrl = 'https://services2.hdb.gov.sg/webapp/BB29ETHN/BB29ETHNIC_ENQ';

    // Forward the form data from incoming request
    const formData = req.body;
    console.log("FORMDATA",formData);

    const response = await axios.post(hdbUrl, new URLSearchParams(formData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log("RESPONSE",response)
    res.status(200).json({
      success: true,
      hdbResponse: response.data
    });

  } catch (error) {
    console.error('Error fetching HDB data:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch HDB quota data',
      error: error.message
    });
  }
};

const deleteMessageById = async (req, res) => {
  const { chatId, messageId } = req.params;

  console.log("CHAT DELETE",req.params);
  try {
    const chat = await ChatHistory.findOne({
      _id: chatId,
      doctorId: req.user.id
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Find and remove the message from the messages array
    const messageIndex = chat.messages.findIndex(msg => msg._id.toString() === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    chat.messages.splice(messageIndex, 1);
    await chat.save();

    return res.status(200).json({ 
      success: true, 
      message: 'Message deleted successfully',
      data: chat.messages 
    });
  } catch (error) {
    console.error('Delete message error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createChat,
  getAllChats,
  getMessagesByChatId,
  deleteChatById,
  updateChatById,
  testHDBQuota,
  deleteMessageById,
};
