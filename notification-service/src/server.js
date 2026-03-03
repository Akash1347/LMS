import { connectRabbitMq } from "./config/rabbitMq.config.js";
import logger from "./config/logger.config.js";
import { routeEvent } from "./events/eventRouter.js";
import { startWorker } from "./jobs/retry.js";

export async function start() {
    const { channel, queues } = await connectRabbitMq();
    logger.info({ event: "notification_consumers_starting", queues });
    for(const queue of queues) {
        channel.consume(queue, async(msg) => {
            if(!msg) return;
            try{
                const event = JSON.parse(msg.content.toString());
                logger.info({ event: "notification_event_received", queue, type: event?.type });
                await routeEvent(event, channel, msg);
            } catch (err) {
                logger.error({ event: "notification_event_failed", queue, error: err.message });
                channel.nack(msg, false, false); // send to DLQ
            }
        });
    }
    logger.info({ event: "notification_retry_worker_started" });
    startWorker();
}

 