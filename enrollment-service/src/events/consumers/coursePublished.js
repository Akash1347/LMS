import { getChannel } from "../../config/rabbitMq.js";


export const handleCoursePublished = async (msg) => {
    const event = JSON.parse(msg.content.toString());
    console.log("Received COURSE_PUBLISHED event:", event);
    const channel = getChannel();
    try {
        // Here you would typically update your database to reflect the new course
        // For example, you might create a new course entry in your enrollment database
        // with the course details from the event.data
        // After processing the event, you can acknowledge the message

        channel.ack(msg);
    } catch (error) {
        console.error("Error processing COURSE_PUBLISHED event:", error);
        // If there's an error, you can reject the message and requeue it for retry
        channel.nack(msg, false, true);
    }
};