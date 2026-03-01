import amqp from "amqplib";
import logger from "./logger.config.js";
let channel;
export async function connectRabbitMq() {
    const rabbitMq_URL = process.env.RABBITMQ_URL;
    const connection = await amqp.connect(rabbitMq_URL);
    channel = await connection.createChannel();
    const exchange = "course.events";
    await channel.assertExchange(exchange, "topic", { durable: true });

    logger.info({
        event: "rabbitmq_exchange_ready",
        exchange,
    });

}
export function getChannel() {
    if(!channel) throw new Error("Rabbit channel not initialized");
    return channel;
}