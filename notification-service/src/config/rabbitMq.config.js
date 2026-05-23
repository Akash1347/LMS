import amqp from "amqplib";
import logger from "./logger.config.js";
let channel;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function connectRabbitMq() {
    const rabbitMq_URL = process.env.RABBITMQ_URL;
    const maxRetries = Number(process.env.RABBITMQ_MAX_RETRIES || 30);
    const retryDelayMs = Number(process.env.RABBITMQ_RETRY_DELAY_MS || 10000);
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const connection = await amqp.connect(rabbitMq_URL);
            channel = await connection.createChannel();
            const exchanges = [
                { name: "auth.events", routingKey: "user.*",queue: "notification.auth" },
                { name: "course.events", routingKey: "course.*",queue: "notification.course" },
                { name: "payment.events", routingKey: "payment.*",queue: "notification.payment" },

            ]
            for(const ex of exchanges){
                await channel.assertExchange(ex.name, "topic", {durable: true});
                await channel.assertQueue(ex.queue, {durable: true});
                await channel.bindQueue(ex.queue, ex.name, ex.routingKey);
            }

            logger.info({
                event: "rabbitmq_connected",
                queues: exchanges.map(e => e.queue),
                attempt,
            });
            return {channel, queues: exchanges.map(e => e.queue)};
        } catch (error) {
            lastError = error;
            logger.warn({
                event: "rabbitmq_connect_retry",
                attempt,
                maxRetries,
                retryDelayMs,
                message: error?.message,
            });
            if (attempt < maxRetries) {
                await sleep(retryDelayMs);
            }
        }
    }

    throw lastError;
}

export function getChannel() {
    if(!channel) throw new Error("Rabbit channel not initialized");
    return channel;
}
