import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../config/dbConfig.js";
import sendOTPMail from "../utils/sendOTPMail.js";

// Register User
export const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;

        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            if (existingUser.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists."
                });
            }

            const isPasswordValid = await bcrypt.compare(password, existingUser.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Incorrect password."
                });
            }

            await prisma.user.update({
                where: { email },
                data: {
                    otp,
                    otpExpiry
                }
            });

            try {
                await sendOTPMail(email, otp);
            } catch (error) {
                console.error("Failed to send OTP Email:", error.message);
            }

            const info = { email };
            return res.status(201).json({
                success: true,
                message: "Verification email has been sent. Please check your Email.",
                user: info
            });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                otp,
                otpExpiry
            }
        });

        try {
            await sendOTPMail(email, otp);
        } catch (error) {
            console.error("Failed to send OTP Email:", error.message);
        }

        const info = { email };
        return res.status(201).json({
            success: true,
            message: "Registered Successfully! Please check your email for verification.",
            data: info
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: "Please verify your email."
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password."
            });
        }

        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: "30d" });

        await prisma.user.update({
            where: { email },
            data: {
                isLoggedIn: true,
                refreshToken
            }
        });

        const info = { id: user.id, fullName: user.fullName, email: user.email };
        return res.status(200).json({
            success: true,
            message: "Logged in Successfully!",
            user: info,
            accessToken,
            refreshToken
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// Logout User
export const logoutUser = async (req, res) => {
    try {
        const userID = req.userID;

        if (!userID) {
            return res.status(400).json({
                success: false,
                message: "User ID is required."
            });
        }

        const user = await prisma.user.findUnique({ where: { id: userID } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        await prisma.user.update({
            where: { id: userID },
            data: {
                isLoggedIn: false,
                refreshToken: null
            }
        });

        return res.status(200).json({
            success: true,
            message: "Logged Out Successfully!"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// Verify OTP
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required."
            });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        if (user.otp !== otp) {
            return res.status(401).json({
                success: false,
                message: "Incorrect OTP."
            });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(401).json({
                success: false,
                message: "OTP has expired."
            });
        }

        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: "30d" });
        await prisma.user.update({
            where: { email },
            data: {
                isVerified: true,
                isLoggedIn: true,
                refreshToken,
                otp: null,
                otpExpiry: null
            }
        });

        const info = { id: user.id, fullName: user.fullName, email: user.email };
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully.",
            user: info,
            accessToken,
            refreshToken
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// Forget Password
export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

     
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
            where: { email },
            data: {
                otp,
                otpExpiry
            }
        });

        try {
            await sendOTPMail(email, otp);
        } catch (err) {
            console.error("Failed to send OTP Mail:", err.message);
        }

        return res.status(200).json({
            success: true,
            message: "OTP is sent to your Email."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// Reset Password
export const resetPassword = async (req, res) => {
    try {

        const { otp, email, newPassword, confirmNewPassword } = req.body;

        if (!otp || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        if (user.otp !== otp) {
            return res.status(401).json({
                success: false,
                message: "Incorrect OTP."
            });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(401).json({
                success: false,
                message: "OTP has expired."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { email },
            data: {
                otp: null,
                otpExpiry: null,
                password: hashedPassword
            }
        });

        return res.status(200).json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
