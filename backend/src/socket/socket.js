import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;
const userSocketMap = new Map(); // userID -> socketID

export const handleSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    // Socket auth middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next(new Error("Authentication error: Token is required."));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            socket.userID = decoded.id;
            next();
        } catch (error) {
            return next(new Error("Authentication error: Invalid or expired token."));
        }
    });

    io.on("connection", (socket) => {
        const userID = socket.userID;
        
        // Join their own room (this supports multiple tabs/devices)
        socket.join(userID);
        userSocketMap.set(userID, socket.id);
        console.log(`User Connected ✅: ${userID} on socket ${socket.id}`);

        // Notify other users that this user is online
        socket.broadcast.emit("userOnline", { userID });

        // Voice & Video Call Signaling Events
        socket.on("call-user", ({ to, offer, type }) => {
            console.log(`Call offer from ${userID} to ${to} (${type})`);
            socket.to(to).emit("incoming-call", {
                from: userID,
                offer,
                type
            });
        });

        socket.on("answer-call", ({ to, answer }) => {
            console.log(`Call answer from ${userID} to ${to}`);
            socket.to(to).emit("call-answered", {
                answer
            });
        });

        socket.on("ice-candidate", ({ to, candidate }) => {
            socket.to(to).emit("ice-candidate", {
                candidate
            });
        });

        socket.on("reject-call", ({ to }) => {
            console.log(`Call rejected by ${userID} to ${to}`);
            socket.to(to).emit("call-rejected");
        });

        socket.on("end-call", ({ to }) => {
            console.log(`Call ended by ${userID} to ${to}`);
            socket.to(to).emit("call-ended");
        });

        socket.on("disconnect", () => {
            userSocketMap.delete(userID);
            console.log(`User Disconnected ❌: ${userID}`);
            
            // Notify other users that this user is offline
            socket.broadcast.emit("userOffline", { userID });
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized.");
    }
    return io;
};

export const isUserOnline = (userID) => {
    return userSocketMap.has(userID);
};

export const sendMessageToUser = (userID, event, data) => {
    if (io) {
        io.to(userID).emit(event, data);
    }
};
