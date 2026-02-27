import nodemailer from "nodemailer";
import env from "../config/env.js";

const sendMail = async ({ to, subject, text, template }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,

            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            }
        });

        const info = await transporter.sendMail({
            from: env.SENDER_EMAIL,
            to: to,
            subject: subject,
            text: text,
            html: template,
        });
        console.log("Email sent: ", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        throw new Error("Failed to send email");
    }
};

export { sendMail };