import http from "http";
import express from "express";
import cors from "cors";
import prisma from "./config/dbConfig.js";
import userRoutes from "./routes/userRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import { handleSocket } from "./socket/socket.js";
import dotenv from "dotenv";
dotenv.config();


const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

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


server.listen(port, () => {
    console.log(`Server is running on port ${port} 🚀`);
});
