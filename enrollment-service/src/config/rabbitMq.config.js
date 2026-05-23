import amqplib from "amqplib";
import "./env.config.js";
import logger from "./logger.config.js";
let channel;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectRabbitMq = async() => {
    const rabbitMq_URL = process.env.rabbitMq_URL || process.env.RABBITMQ_URL;
    const maxRetries = Number(process.env.RABBITMQ_MAX_RETRIES || 30);
    const retryDelayMs = Number(process.env.RABBITMQ_RETRY_DELAY_MS || 10000);

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const connection = await amqplib.connect(rabbitMq_URL);
            channel = await connection.createChannel();
            const exchange = "enrollment.events";
            await channel.assertExchange(exchange, "topic", { durable: true });

            logger.info({
                event: "rabbitmq_connected",
                url: rabbitMq_URL,
                attempt,
            });
            return;
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

    logger.error({
        event: "rabbitmq_connect_failed",
        message: lastError?.message,
    });

    throw lastError;
};

export const getChannel = () => {
    if(!channel) throw new Error("Rabbit channel not initialized");
    return channel;
};