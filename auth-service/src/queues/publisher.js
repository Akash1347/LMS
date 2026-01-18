import { getChannel } from "../config/rabbitmq.js";


export async function publishEvent(routingKey, message) {
    const channel = getChannel();
    channel.publish(
        "lms_events",
        routingKey,
        Buffer.from(JSON.stringify(message))
    );
    console.log(`Published event to ${routingKey}`);
}
