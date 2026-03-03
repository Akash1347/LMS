import { getChannel } from "../../config/rabbitMq.config.js";
import logger from "../../config/logger.config.js";

export function publishEvent(routingKey, event) {
    const channel = getChannel();

    const exchange = "enrollment.events";
    const message = Buffer.from(JSON.stringify(event));

    channel.publish(exchange, routingKey, message, { persistent: true });
    logger.info({ event: "enrollment_event_published", exchange, routingKey, type: event?.type });
};