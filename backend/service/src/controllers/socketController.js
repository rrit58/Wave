import { userManager } from "../utils/userManager.js";
import { emitToUser, emitToUsers, broadcastEvent } from "../socket/socketServer.js";

/**
 * Controller for Socket REST endpoints (inter-service communication)
 */

// Health & Status Check
export const getHealth = (req, res) => {
    return res.status(200).json({
        service: "Wave Real-time Socket Service",
        status: "active",
        onlineUsersCount: userManager.getOnlineUsersCount()
    });
};

// Emit events to specific users or broadcast
export const handleEmitEvent = (req, res) => {
    try {
        const { userId, userIds, event, data, broadcast } = req.body;

        if (!event) {
            return res.status(400).json({ success: false, message: "Event name is required." });
        }

        if (broadcast) {
            broadcastEvent(event, data);
            return res.status(200).json({ success: true, message: "Broadcasted successfully." });
        }

        if (userId) {
            emitToUser(userId, event, data);
        }

        if (Array.isArray(userIds)) {
            emitToUsers(userIds, event, data);
        }

        return res.status(200).json({ success: true, message: "Event emitted successfully." });
    } catch (error) {
        console.error("[SocketController] Emit error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Fetch list of all online user IDs
export const getOnlineUsers = (req, res) => {
    try {
        const onlineUsers = userManager.getOnlineUserIds();
        return res.status(200).json({ success: true, onlineUsers });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Check if a specific user is online
export const checkIsOnline = (req, res) => {
    try {
        const { userId } = req.params;
        const isOnline = userManager.isUserOnline(userId);
        return res.status(200).json({ success: true, isOnline });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
