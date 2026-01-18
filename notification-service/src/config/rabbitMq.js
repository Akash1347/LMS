import amqp from "amqplib";
let channel;

export async function connectRabbitMq() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange("lms_events", "topic", {durable: true});
    //await channel.assertExchange("notification_exchange", "topic", {durable: true});

    console.log("RabbitMQ connected in notification-service");
}

export function getChannel() {
    if(!channel) throw new Error("Rabbit channel not initialized");
    return channel;
}
