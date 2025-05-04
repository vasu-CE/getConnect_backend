const express = require("express");
const router = express.Router();
const isAuthenticate = require("../../middleware/isAuthenticate");
const conversationModel = require("../../model/conversationModel");
const messageModel = require("../../model/messageModel");
const { getReciverSocketId, io } = require("../../socket/socket");
const { default: mongoose } = require("mongoose");

router.post("/send/:id", isAuthenticate, async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage: message } = req.body;

    let conversation = await conversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await conversationModel.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    const newMessage = await messageModel.create({
      senderId,
      receiverId,
      message,
      conversationId: conversation._id,
    });
    // console.log(newMessage)

    if (newMessage) {
      await conversationModel.findByIdAndUpdate(
        conversation._id,
        {
          $push: { messages: newMessage._id },
          $set: { lastMessage: newMessage._id },
        },
        { new: true }
      );
    }

    io.to(receiverId).emit("receiveMessage", newMessage);

    return res.status(201).json({
      success: true,
      newMessage,
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({
      success: false,
      message: "An error occurred while sending the message.",
    });
  }
});

router.get("/all/:id", isAuthenticate, async (req, res) => {
  // console.log("hyy")
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    if (!mongoose.isValidObjectId(senderId) ||
        !mongoose.isValidObjectId(receiverId)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid user ID format' });
    }


    const conversation = await conversationModel
      .findOne({participants: { $all: [senderId, receiverId] }})
      .select('_id')
      .lean()           // returns a plain JS object, slightly faster

    // console.log(conversation);
    if (!conversation) {
      return res.json({ success: false });
    }

    const page = parseInt(req.query.page , 10) || 1;
    const limit = parseInt(req.query.limit , 10) || 20;

    const skip = (page - 1) * limit;

    const messages = await messageModel
    .find({ conversationId: conversation._id })
    .sort({ timestamp: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

    const hasMore = (page * limit) < (await messageModel.countDocuments({ conversationId: conversation._id }));
    // console.log(messages);
    res.json({ success: true, messages , hasMore});
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
