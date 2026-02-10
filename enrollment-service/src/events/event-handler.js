import { getChannel } from "../config/rabbitMq.js";
import { handleCoursePublished } from "./consumers/coursePublished.js";

export const setupEventHandlers = async () => {
    const channel = getChannel();
    const exchange = "course.events";
    const queue = "enrollment.course.published";
    const routingKey = "course.published";

    // Declare the exchange first
    //await channel.assertExchange(exchange, "topic", { durable: true });

    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);
    channel.consume(queue, async (msg) => {
        if (msg) {
            await handleCoursePublished(msg);
        }
    }, { noAck: false });
    console.log(`Subscribed to ${routingKey} events`);
};

export const initEvents = async () => {
    await setupEventHandlers();
};
