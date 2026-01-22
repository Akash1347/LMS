import { NotificationModel } from "../models/notifications.js";

export async function ingestNotification(data) {
    console.log(data);
    const exists= await NotificationModel.exists(data.eventId);
    if(exists) return;
    await NotificationModel.insert({
        event_id: data.event_id,
        user_id: data.user_id,
        event_type: data.event_type,
        status: "PENDING",
        channel: data.channels,
        payload: data.payload
    });
}