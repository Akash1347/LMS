import amqp from "amqplib";
let channel;
export async function connectRabbitMq() {
    const rabbitMq_URL = process.env.RABBITMQ_URL;
    const connection = await amqp.connect(rabbitMq_URL);
    channel = await connection.createChannel();
    const exchange = "course.events";
    await channel.assertExchange(exchange, "topic", { durable: true });

    console.log("RabbitMQ connected");

}
export function getChannel() {
    if(!channel) throw new Error("Rabbit channel not initialized");
    return channel;
}