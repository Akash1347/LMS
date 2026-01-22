import { onUserRegistered } from "./consumers/user.events.js";
import { ingestNotification } from "../services/ingestNotification.js";

export async function routeEvent(event, channel, msg){
    let command;
    switch (event.type){
        case "USER_REGISTERED":
            command = onUserRegistered(event);
            break;
        default:
            channel.ack(msg);
            return;
    }

    await ingestNotification(command);
    channel.ack(msg);
}