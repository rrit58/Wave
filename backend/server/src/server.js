import express from "express";
import cors from "cors";
import prisma from "./config/dbConfig.js";
import userRoutes from "./routes/userRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

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


app.listen(port, () => {
    console.log(`Auth & API Server is running on port ${port} 🚀`);
});
