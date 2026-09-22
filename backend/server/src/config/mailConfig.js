import nodemailer from "nodemailer";

const mailTransporter = () => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        return transporter;

    } catch (error) {
        console.error("Error:", error);
    }
}

export default mailTransporter;