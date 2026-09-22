import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initSocketServer } from "./socket/socketServer.js";
import socketRoutes from "./routes/socketRoute.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5001;

// Global Middleware
app.use(cors());
app.use(express.json());

// Mount REST Routes
app.use("/", socketRoutes);

// Initialize Real-time Socket Server
initSocketServer(server);

// Start Service
server.listen(port, () => {
    console.log(`⚡ Wave Real-time Socket Service running on port ${port}`);
});
