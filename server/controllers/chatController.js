import asyncHandler from "../utils/asyncHandler.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

export const getConversationId = (a, b) => [String(a), String(b)].sort().join(":");

export const getConversations = asyncHandler(async (req, res) => {
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
      }
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$conversationId",
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [{ $and: [{ $eq: ["$receiverId", req.user._id] }, { $eq: ["$isRead", false] }] }, 1, 0]
          }
        }
      }
    },
    { $sort: { "lastMessage.createdAt": -1 } }
  ]);

  res.json(messages);
});

export const getMessages = asyncHandler(async (req, res) => {
  const conversationId = getConversationId(req.user._id, req.params.userId);

  await Message.updateMany({ conversationId, receiverId: req.user._id }, { isRead: true });

  const messages = await Message.find({ conversationId })
    .populate("senderId receiverId", "name avatar shop")
    .sort({ createdAt: 1 });

  res.json(messages);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, text } = req.body;
  const conversationId = getConversationId(req.user._id, receiverId);
  const message = await Message.create({
    senderId: req.user._id,
    receiverId,
    conversationId,
    text
  });

  await Notification.create({
    userId: receiverId,
    type: "chat",
    message: `${req.user.name} sent you a message.`
  });

  res.status(201).json(await message.populate("senderId receiverId", "name avatar shop"));
});
