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

export async function publishUserRegisteredEvent(user) {
  const channel = getChannel();

  const exchange = "auth.events";
  await channel.assertExchange(exchange, "topic", { durable: true });

  const event = {
    eventId: crypto.randomUUID(),
    type: "USER_REGISTERED",
    userId: user.user_id,
    email: user.email,
    name: user.user_name
    
  };

  channel.publish(
    exchange,
    "user.registered",
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );
  console.log(`Published event to ${event.type}`);
  console.log(event);

}
