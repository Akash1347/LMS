import { connectRabbitMq } from "./config/rabbitMq.js";
import { routeEvent } from "./events/eventRouter.js";
import { startWorker } from "./jobs/retry.js";

export async function start() {
    const { channel, queues } = await connectRabbitMq();
    for(const queue of queues) {
        channel.consume(queue, async(msg) => {
            if(!msg) return;
            try{
                const event = JSON.parse(msg.content.toString());
                await routeEvent(event, channel, msg);
            } catch (err) {
                console.error("Failed to process message", err);
                channel.nack(msg, false, false); // send to DLQ
            }
        });
    }
    console.log("worker started...")
    startWorker();
}

 