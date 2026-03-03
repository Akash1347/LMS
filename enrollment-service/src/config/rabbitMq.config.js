import amqplib from "amqplib";
import "./env.config.js";
import logger from "./logger.config.js";
let channel;

export const connectRabbitMq = async() => {
    const rabbitMq_URL = process.env.rabbitMq_URL;
    const connection = await amqplib.connect(rabbitMq_URL);
    channel = await(connection.createChannel());
    const exchange = "enrollment.events";
    await channel.assertExchange(exchange, "topic", { durable: true });

    logger.info({
        event: "rabbitmq_connected",
        url: rabbitMq_URL,
        
    });
};

export const getChannel = () => {
    if(!channel) throw new Error("Rabbit channel not initialized");
    return channel;
};