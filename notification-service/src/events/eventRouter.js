import { onUserRegistered, onUserResetOtp, onUserVerifyOtp } from "./consumers/user.events.js";
import { ingestNotification } from "../services/ingestNotification.js";
import logger from "../config/logger.config.js";

export async function routeEvent(event, channel, msg){
    let command;
    switch (event.type){
        case "USER_REGISTERED":
            command = onUserRegistered(event);
            break;
        case "USER_RESET_OTP":
            command = onUserResetOtp(event);
            break;
        case "USER_VERIFY_OTP":
            command = onUserVerifyOtp(event);
            break;
        default:
            logger.info({ event: "notification_event_ignored", type: event?.type });
            channel.ack(msg);
            return;
    }

    logger.info({ event: "notification_event_routed", type: event.type });
    await ingestNotification(command);
    logger.info({ event: "notification_event_ingested", type: event.type, eventId: command?.event_id });
    channel.ack(msg);
}