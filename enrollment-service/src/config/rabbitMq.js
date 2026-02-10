import amqplib from "amqplib";
import "./env.js";
let channel;

export const connectRabbitMq = async() => {
    const rabbitMq_URL = process.env.rabbitMq_URL;
    const connection = await amqplib.connect(rabbitMq_URL);
    channel = await(connection.createChannel());
    const exchange = "enrollment.envents";
    await channel.assertExchange(exchange, "topic", { durable: true });

    console.log("RabbitMQ connected");
};

export const getChannel = () => {
    if(!channel) throw new Error("Rabbit channel not initialized");
    return channel;
};