import { getChannel } from "../../config/rabbitMq";

export function publishEvent(routingKey, event) {
    const channel = getChannel();

    const exchange = "enrollment.events";
    const message = Buffer.from(JSON.stringify(event));

    channel.publish(exchange, routingKey, message, { persistent: true });
    console.log(`Published event to ${exchange} with routing key ${routingKey}:`, event);
};