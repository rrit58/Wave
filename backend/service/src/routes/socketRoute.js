import express from "express";
import {
    getHealth,
    handleEmitEvent,
    getOnlineUsers,
    checkIsOnline
} from "../controllers/socketController.js";

const router = express.Router();

router.get("/", getHealth);
router.post("/api/socket/emit", handleEmitEvent);
router.get("/api/socket/online-users", getOnlineUsers);
router.get("/api/socket/is-online/:userId", checkIsOnline);

export default router;
