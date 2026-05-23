import amqp from 'amqplib';
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
            const exchange = "auth.events";
            await channel.assertExchange(exchange, "topic", { durable: true });

            console.log(`RabbitMQ connected (attempt ${attempt})`);
            return;
        } catch (error) {
            lastError = error;
            console.warn(`RabbitMQ connect retry ${attempt}/${maxRetries}: ${error?.message}`);
            if (attempt < maxRetries) {
                await sleep(retryDelayMs);
            }
        }
    }

    throw lastError;
}

export function getChannel() {
    if (!channel) throw new Error("Rabbit channel not initialized");
    return channel;
}
