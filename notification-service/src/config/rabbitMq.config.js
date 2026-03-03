import amqp from "amqplib";
import logger from "./logger.config.js";
let channel;

export async function connectRabbitMq() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
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
    
    //await channel.assertExchange("notification_exchange", "topic", {durable: true});

    logger.info({
        event: "rabbitmq_connected",
        queues: exchanges.map(e => e.queue),
    });
    return {channel, queues: exchanges.map(e => e.queue)};

}

export function getChannel() {
    if(!channel) throw new Error("Rabbit channel not initialized");
    return channel;
}
