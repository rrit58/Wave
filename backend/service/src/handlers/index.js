import { userManager } from "../utils/userManager.js";
import { registerCallHandlers } from "./callHandler.js";

/**
 * Register all Socket.IO event handlers on connection
 */
export const registerSocketHandlers = (io, socket) => {
    const userID = socket.userID;

    // Join personal room named by userID
    socket.join(userID);

    // Track active connection and check if user just came online
    const isFirstConnection = userManager.addUserSocket(userID, socket.id);
    if (isFirstConnection) {
        socket.broadcast.emit("userOnline", { userID });
    }

    console.log(`[Socket] User Connected ✅: ${userID} (Socket: ${socket.id}, Total Active Devices: ${userManager.getUserSockets(userID).size})`);

    // Register Call signaling handlers
    registerCallHandlers(io, socket);

    // Handle Socket Disconnect
    socket.on("disconnect", () => {
        const isOffline = userManager.removeUserSocket(userID, socket.id);
        if (isOffline) {
            console.log(`[Socket] User Disconnected ❌: ${userID}`);
            socket.broadcast.emit("userOffline", { userID });
        }
    });
};
