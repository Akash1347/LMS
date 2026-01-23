import { NotificationModel } from "../models/notifications.js";
import { sendEmail } from "../channels/email/emailSender.js";

export async function startWorker() {
    setInterval(async () => {
        const notifications = await NotificationModel.fetchPending(5);
        console.log("sending notification : ", notifications.length);
        for(const n of notifications) {
            try{
                console.log(n.payload);
                await sendEmail(n.payload, n.event_type);
                await NotificationModel.markSent(n.id);
                console.log("notification sent to user...")
            } catch(err){
                const nextRetry = new Date(Date.now() + 5*60*1000);
                await NotificationModel.markFailed(n.id, nextRetry);
            }
        }

    }, 5000);
}
