import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const SOCKET_SERVICE_URL = process.env.SOCKET_SERVICE_URL || "http://localhost:5001";

/**
 * Send a real-time event to a specific user via the socket service
 */
export const sendMessageToUser = async (userId, event, data) => {
    try {
        await axios.post(`${SOCKET_SERVICE_URL}/api/socket/emit`, {
            userId,
            event,
            data
        }, { timeout: 3000 });
    } catch (error) {
        console.warn(`[SocketClient] Failed to send '${event}' to user '${userId}':`, error.message);
    }
};

/**
 * Send a real-time event to multiple users via the socket service
 */
export const sendMessageToUsers = async (userIds, event, data) => {
    try {
        await axios.post(`${SOCKET_SERVICE_URL}/api/socket/emit`, {
            userIds,
            event,
            data
        }, { timeout: 3000 });
    } catch (error) {
        console.warn(`[SocketClient] Failed to send '${event}' to users:`, error.message);
    }
};

/**
 * Broadcast an event to all connected sockets
 */
export const broadcastEvent = async (event, data) => {
    try {
        await axios.post(`${SOCKET_SERVICE_URL}/api/socket/emit`, {
            broadcast: true,
            event,
            data
        }, { timeout: 3000 });
    } catch (error) {
        console.warn(`[SocketClient] Failed to broadcast '${event}':`, error.message);
    }
};

/**
 * Fetch all currently online user IDs from the socket service
 */
export const getOnlineUsers = async () => {
    try {
        const res = await axios.get(`${SOCKET_SERVICE_URL}/api/socket/online-users`, { timeout: 3000 });
        if (res.data?.success && Array.isArray(res.data.onlineUsers)) {
            return new Set(res.data.onlineUsers);
        }
        return new Set();
    } catch (error) {
        // Socket service might be restarting or unreachable
        return new Set();
    }
};

/**
 * Check if a single user is online
 */
export const isUserOnline = async (userId) => {
    try {
        const res = await axios.get(`${SOCKET_SERVICE_URL}/api/socket/is-online/${userId}`, { timeout: 3000 });
        return Boolean(res.data?.isOnline);
    } catch (error) {
        return false;
    }
};
