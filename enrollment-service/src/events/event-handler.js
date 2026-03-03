import { getChannel } from "../config/rabbitMq.config.js";
import logger from "../config/logger.config.js";
import { handleCoursePublished } from "./consumers/courseEvents.js";

export const setupEventHandlers = async () => {
    const channel = getChannel();
    const exchange = "course.events";
    const queue = "enrollment.course.events";
    const routingKey = "course.#";

    // Declare the exchange first
    await channel.assertExchange(exchange, "topic", { durable: true });

    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);
    channel.consume(queue, async (msg) => {
        if (msg) {
            await handleCoursePublished(msg);
        }
    }, { noAck: false });
    logger.info({ event: "enrollment_subscribed", routingKey, queue, exchange });
};

export const initEvents = async () => {
    await setupEventHandlers();
};
