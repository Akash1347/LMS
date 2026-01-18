import { getChannel } from "../config/rabbitMq.js";

export async function userCreatedWorker() {
    try {
        const channel = getChannel();
        const queue = "user_queue";

        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, "lms_events", "user.created");

        console.log("User created worker is listening for messages...");

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                try {
                    const messageContent = msg.content.toString();
                    const userData = JSON.parse(messageContent);

                    console.log("Received user created message:", userData);

                    // Process the notification (e.g., send email/SMS)
                    // TODO: Implement notification logic here
                    // Example: sendWelcomeEmail(userData.email, userData.user_name);

                    // Acknowledge the message
                    channel.ack(msg);
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

    channel.consume(queue, msg => {
        const data = JSON.parse(msg.content.toString());
        console.log("Send password reset OTP:", data.email, data.otp);
        channel.ack(msg);
    });
}

export async function emailVerifyWorker() {
    const channel = getChannel();

    const queue = "email_verify_queue";
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, "lms_events", "email.verify");

    channel.consume(queue, msg => {
        const data = JSON.parse(msg.content.toString());
        console.log("Send verification OTP:", data.email, data.otp);
        channel.ack(msg);
    });
}
