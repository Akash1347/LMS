import { getChannel } from "../../config/rabbitMq.js";

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
        console.log("Received event:", event);
        console.log("Processing COURSE_PUBLISHED:", event.data?.id); 
        let {type, data} = event;

        if (!event.data) {
            throw new Error("Invalid event: Missing data"); 
        }

        switch(type) {
            case "COURSE_PUBLISHED":
                console.log("Inserting enrollment snapshot for course:");
                await insertEnrollmentCourseSnapshot(data);
                break;
            case "COURSE_UPDATED":
                console.log("Updating enrollment snapshot for course:");
                await updateEnrollmentCourseSnapshot(data);
                break;
            case "COURSE_DELETED":
                console.log("Deleting enrollment snapshot for course ID:");
                await deleteEnrollmentCourseSnapshot(data.course_id);
                break;
            default:
                throw new Error(`Unknown action: ${type}`);
        }
                 
        channel.ack(msg);
        console.log("Successfully processed enrollment snapshot");

    } catch (error) {
        console.error("Critical Error in handleCoursePublished:", error.message); 
        const isDataError = error instanceof SyntaxError || error.message.includes("Invalid event");
        
        channel.nack(msg, false, !isDataError); 
    }
};