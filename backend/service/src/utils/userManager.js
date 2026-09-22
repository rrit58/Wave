/**
 * In-memory User Socket Manager
 * Tracks active socket connections per user to support multiple tabs/devices.
 */
class UserManager {
    constructor() {
        this.userSockets = new Map(); // userID -> Set of socketIDs
    }

    /**
     * Add a socket connection for a user.
     * @returns {boolean} true if this is the user's first active socket (user came online).
     */
    addUserSocket(userId, socketId) {
        let isFirstConnection = false;
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
            isFirstConnection = true;
        }
        this.userSockets.get(userId).add(socketId);
        return isFirstConnection;
    }

    /**
     * Remove a socket connection for a user.
     * @returns {boolean} true if the user has no remaining sockets (user went offline).
     */
    removeUserSocket(userId, socketId) {
        const sockets = this.userSockets.get(userId);
        if (!sockets) return false;

        sockets.delete(socketId);
        if (sockets.size === 0) {
            this.userSockets.delete(userId);
            return true;
        }
        return false;
    }

    /**
     * Check if a user has any active sockets.
     */
    isUserOnline(userId) {
        return this.userSockets.has(userId);
    }

    /**
     * Get all currently online user IDs.
     */
    getOnlineUserIds() {
        return Array.from(this.userSockets.keys());
    }

    /**
     * Get the count of unique online users.
     */
    getOnlineUsersCount() {
        return this.userSockets.size;
    }

    /**
     * Get active socket IDs for a given user.
     */
    getUserSockets(userId) {
        return this.userSockets.get(userId) || new Set();
    }
}

export const userManager = new UserManager();
