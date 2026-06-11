import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getConversationId } from "../controllers/chatController.js";

export const configureSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error("Missing socket token.");

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id).select("name role avatar shop");
      if (!user) throw new Error("Socket user not found.");

      socket.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on("connection", (socket) => {
    socket.join(String(socket.user._id));

    socket.on("message:send", async ({ receiverId, text }) => {
      if (!receiverId || !text) return;

      const message = await Message.create({
        senderId: socket.user._id,
        receiverId,
        conversationId: getConversationId(socket.user._id, receiverId),
        text
      });

      const populated = await message.populate("senderId receiverId", "name avatar shop");
      await Notification.create({
        userId: receiverId,
        type: "chat",
        message: `${socket.user.name} sent you a message.`
      });

      io.to(String(receiverId)).emit("message:new", populated);
      socket.emit("message:new", populated);
    });

    socket.on("notification:join", () => {
      socket.join(`notifications:${socket.user._id}`);
    });
  });
};
