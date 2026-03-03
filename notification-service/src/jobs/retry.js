import { NotificationModel } from "../models/notifications.js";
import { sendEmail } from "../channels/email/emailSender.js";
import logger from "../config/logger.config.js";

export async function startWorker() {
    setInterval(async () => {
        const notifications = await NotificationModel.fetchPending(5);
        logger.info({ event: "retry_batch_loaded", count: notifications.length });
        for(const n of notifications) {
            try{
                logger.info({ event: "retry_attempt", notificationId: n.id, type: n.event_type });
                await sendEmail(n.payload, n.event_type);
                await NotificationModel.markSent(n.id);
                logger.info({ event: "notification_sent", notificationId: n.id, type: n.event_type });
            } catch(err){
                const nextRetry = new Date(Date.now() + 5*60*1000);
                await NotificationModel.markFailed(n.id, nextRetry);
                logger.error({ event: "notification_send_failed", notificationId: n.id, error: err.message, nextRetry: nextRetry.toISOString() });
            }
        }

    }, 5000);
}
