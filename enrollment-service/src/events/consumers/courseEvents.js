import { getChannel } from "../../config/rabbitMq.config.js";
import logger from "../../config/logger.config.js";

import { insertEnrollmentCourseSnapshot, 
        updateEnrollmentCourseSnapshot, 
        deleteEnrollmentCourseSnapshot }
        from "../../repositories/enrollmentRepository.js";

export const handleCoursePublished = async (msg, ) => {
    if (!msg) return; 
    const channel = getChannel();
    let event;
    

    try {
        event = JSON.parse(msg.content.toString());
        logger.info({ event: "course_event_received", type: event.type, courseId: event.data?.id });
        let {type, data} = event;

        if (!event.data) {
            throw new Error("Invalid event: Missing data"); 
        }

        switch(type) {
            case "COURSE_PUBLISHED":
                logger.info({ event: "course_snapshot_insert", courseId: data?.id });
                await insertEnrollmentCourseSnapshot(data);
                break;
            case "COURSE_UPDATED":
                logger.info({ event: "course_snapshot_update", courseId: data?.id });
                await updateEnrollmentCourseSnapshot(data);
                break;
            case "COURSE_DELETED":
                logger.info({ event: "course_snapshot_delete", courseId: data?.course_id });
                await deleteEnrollmentCourseSnapshot(data.course_id);
                break;
            default:
                throw new Error(`Unknown action: ${type}`);
        }
                 
        channel.ack(msg);
        logger.info({ event: "course_event_processed", type });

    } catch (error) {
        logger.error({ event: "course_event_process_failed", error: error.message });
        const isDataError = error instanceof SyntaxError || error.message.includes("Invalid event");
        
        channel.nack(msg, false, !isDataError); 
    }
};


