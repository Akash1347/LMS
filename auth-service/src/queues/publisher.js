import { getChannel } from "../config/rabbitmq.js";


export async function publishEvent(routingKey,type , payload) {
  const channel = getChannel();
  const event = {
    eventId: crypto.randomUUID(),
    type: type,
    payload: payload
  }
  channel.publish(
    "auth.events",
    routingKey,
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );
  console.log(`Published event to ${routingKey}`);
}

export async function publishUserRegisteredEvent(user) {
  const channel = getChannel();

  

  const event = {
    eventId: crypto.randomUUID(),
    type: "USER_REGISTERED",
    userId: user.user_id,
    email: user.email,
    name: user.user_name
    
  };

  channel.publish(
    "auth.events",
    "user.registered",
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );
  console.log(`Published event to ${event.type}`);
  console.log(event);

}

 