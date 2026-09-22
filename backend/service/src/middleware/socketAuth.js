import jwt from "jsonwebtoken";

/**
 * Socket.IO Authentication Middleware
 * Validates JWT token from handshake auth or query params.
 */
export const socketAuthMiddleware = (socket, next) => {
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
};
