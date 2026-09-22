import { Server } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socketAuth.js";
import { registerSocketHandlers } from "../handlers/index.js";

let io = null;

/**
 * Initialize Socket.IO server
 */
export const initSocketServer = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_ORIGIN || "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Apply JWT Authentication Middleware
    io.use(socketAuthMiddleware);

    // Register event handlers on client connection
    io.on("connection", (socket) => {
        registerSocketHandlers(io, socket);
    });

    return io;
};

/**
 * Get the active Socket.IO server instance
 */
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO server has not been initialized.");
    }
    return io;
};

/**
 * Emit an event to a single user room
 */
export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(userId).emit(event, data);
    }
};

/**
 * Emit an event to multiple user rooms
 */
export const emitToUsers = (userIds, event, data) => {
    if (io && Array.isArray(userIds)) {
        userIds.forEach((userId) => {
            io.to(userId).emit(event, data);
        });
    }
};

/**
 * Broadcast an event to all connected sockets
 */
export const broadcastEvent = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};
