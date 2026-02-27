import { getChannel } from "../config/rabbitMq.js";
import { sendMail } from "../utils/sendMail.js";
import resetMail from "../utils/resetMail.js";
import welcomeMail from "../utils/welcomeMail.js";
import verificationMail from "../utils/verificationMail.js";
export async function userCreatedWorker() {
    try {
        const channel = getChannel();
        const queue = "user_queue";

        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, "lms_events", "user.created");

        console.log("User created worker is listening for messages...");

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    const messageContent = msg.content.toString();
                    const userData = JSON.parse(messageContent);
                    console.log("Processing user created message for user:", userData);
                    console.log("Received user created message:", userData); 
                    const emailSubject = "Welcome to LMS!";
                    const emailText = `Hi ${userData.name},\n\nWelcome to our Learning Management System! We're excited to have you on board.\n\nBest regards,\nLMS Team`;
                    const result = await sendMail({ to: userData.email, subject: emailSubject, text: emailText, template: welcomeMail.welcomeTemplate(userData.name) });
                    if(result) {
                        console.log("Welcome email sent successfully to", userData.email);
                         channel.ack(msg);
                    } else {
                        console.error("Failed to send welcome email to", userData.email);
                        channel.nack(msg, false, true);
                    } 
                   
                } catch (error) {
                    console.error("Error processing message:", error);
                    // Reject the message and requeue it for retry
                    channel.nack(msg, false, true);
                }
            }
        });
    } catch (error) {
        console.error("Error setting up user created worker:", error);
    }
}


export async function passwordResetWorker() {
    const channel = getChannel();

    const queue = "password_reset_queue";
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, "lms_events", "password.reset");

    channel.consume(queue,async( msg) => {
        const data = JSON.parse(msg.content.toString());
        
        const emailSubject = "Password Reset Request";
        const emailText = `Hi,\n\nWe received a request to reset your password. Your OTP for password reset is: ${data.otp}\n\nIf you did not request a password reset, please ignore this email.\n\nBest regards,\nLMS Team`;
        const result = await sendMail({ to: data.email, subject: emailSubject, text: emailText, template: resetMail.resetPasswordTemplate(data.name, data.resetLink) });
        if(result) {
            console.log("Send password reset OTP:", data.email, data.otp);
            channel.ack(msg);
        } else {
            channel.nack(msg, false, true);
        }
    });
}

export async function emailVerifyWorker() {
    const channel = getChannel();

    const queue = "email_verify_queue";
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, "lms_events", "email.verify");

    channel.consume(queue, async (msg) => {
        const data = JSON.parse(msg.content.toString());
       
        const emailSubject = "Email Verification";
        const emailText = `Hi,\n\nThank you for registering with us. Your OTP for email verification is: ${data.otp}\n\nPlease enter this OTP in the app to verify your email address.\n\nBest regards,\nLMS Team`;
        const result = await sendMail({ to: data.email, subject: emailSubject, text: emailText, template: verificationMail.verifyEmailTemplate(data.name, data.verifyLink) });
        if(result) {
             console.log("Send verification OTP:", data.email, data.otp);

            channel.ack(msg);
        } else {            
            channel.nack(msg, false, true);
        }
        
    });
}
