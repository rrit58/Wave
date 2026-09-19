import express from "express";
import { getAvailableUsers, getChats, getOrCreateChat, getMessages, sendMessage, markAsRead } from "../controllers/chatController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/users", auth, getAvailableUsers);
router.get("/list", auth, getChats);
router.post("/get-or-create", auth, getOrCreateChat);
router.get("/:chatId/messages", auth, getMessages);
router.post("/message/send", auth, sendMessage);
router.post("/:chatId/read", auth, markAsRead);

export default router;
