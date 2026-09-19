import prisma from "../config/dbConfig.js";
import mailTransporter from "../config/mailConfig.js";

const sendOTPMail = async (email, otp) => {
    try {
        if (!email) {
            return {
                success: false,
                message: "Email is required."
            };
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return {
                success: false,
                message: "User not found."
            };
        }

        const transporter = mailTransporter();
        const mailConfiguration = {
            from: `"Auth App" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Verify your email",
            text: `Your OTP is: ${otp}`
        };

        await transporter.sendMail(mailConfiguration);
        return {
            success: true,
            message: "OTP is sent."
        };

    } catch (error) {
        console.error("Error sending email:", error);
    }
}

export default sendOTPMail;