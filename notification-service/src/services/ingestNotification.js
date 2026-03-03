import { NotificationModel } from "../models/notifications.js";
import logger from "../config/logger.config.js";

export async function ingestNotification(data) {
    logger.info({ event: "ingest_notification_received", eventId: data?.event_id, type: data?.event_type, userId: data?.user_id });
    const exists= await NotificationModel.exists(data.eventId);
    if(exists) {
        logger.info({ event: "ingest_notification_skipped_duplicate", eventId: data?.event_id });
        return;
    }
    await NotificationModel.insert({
        event_id: data.event_id,
        user_id: data.user_id,
        event_type: data.event_type,
        status: "PENDING",
        channel: data.channels,
        payload: data.payload
    });
    logger.info({ event: "ingest_notification_inserted", eventId: data?.event_id, type: data?.event_type });
}