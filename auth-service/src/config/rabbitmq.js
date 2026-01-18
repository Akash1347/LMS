

import amqp from 'amqplib';
let channel;
export async function connectRabbitMq(){
    const rabbitMq_URL = process.env.RABBITMQ_URL;
    const connection = await amqp.connect(rabbitMq_URL);
    channel = await connection.createChannel();
    await channel.assertExchange("lms_events", "topic", {durable: true});
    console.log("RabbitMQ connected");
}

export function getChannel() {
    if(!channel) throw new error("Rabbit channel not initialized");
    return channel;
}