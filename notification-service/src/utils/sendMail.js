import nodemailer from "nodemailer";
import env from "../config/env.config.js";
import logger from "../config/logger.config.js";

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
        logger.info({ event: "email_sent", messageId: info.messageId, to });
        return info;
    } catch (error) {
        logger.error({ event: "email_send_failed", error: error.message, to, subject });
        throw new Error("Failed to send email");
    }
};

export { sendMail };