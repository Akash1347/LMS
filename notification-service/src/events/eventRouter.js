import { onUserRegistered, onUserResetOtp, onUserVerifyOtp } from "./consumers/user.events.js";
import { ingestNotification } from "../services/ingestNotification.js";

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
            channel.ack(msg);
            return;
    }

    await ingestNotification(command);
    channel.ack(msg);
}