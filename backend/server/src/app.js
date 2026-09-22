import "dotenv/config";
import express from "express";
import cors from "cors";
import prisma from "./config/dbConfig.js";
import userRoutes from "./routes/userRoute.js";
import chatRoutes from "./routes/chatRoute.js";

const app = express();
const port = process.env.PORT;

try {
    await prisma.$connect();
    console.log("Database Connected Successfully ✅️");
} catch (error) {
    console.log("Database Connection Failed ❌️", error);
}

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



export default app;
