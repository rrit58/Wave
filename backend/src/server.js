import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import prisma from "./config/dbConfig.js";
import userRoutes from "./routes/userRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import { handleSocket } from "./socket/socket.js";

const app = express();
const server = http.createServer(app);

handleSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Route
try {
    app.get("/", (req, res) => {
        res.send("Welcome to Wave Backend...🚀");
    });
} catch (error) {
    console.log(error.message);
}

try {
    app.use("/user", userRoutes);
    app.use("/chat", chatRoutes);
} catch (error) {
    console.log(error.message);
}

try {
    await prisma.$connect();
    console.log("Database Connected Successfully ✅️");
} catch (error) {
    console.log("Database Connection Failed ❌️", error);
}

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT} 🚀`);
});

 