import { getChannel } from "../config/rabbitMqConfig.js";

export async function emitCoursePublished(course){
    const channel = getChannel();
    const exchange = "course.events";
    const routingKey = "course.published";

    const event = {
        type: "COURSE_PUBLISHED",
        data: course
    };
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(event)), {
        persistent: true
    });
    console.log(`Published event to ${routingKey}`);
};

export async function emitCourseUpdated(course) {
    const channel = getChannel();
    const exchange = "course.events";
    const routingKey = "course.updated";
    const event = {
        type: "COURSE_UPDATED",
        data: course
    };
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(event)), {
        persistent: true
    });
    console.log(`Published event to ${routingKey}`);
};

export async function emitCourseDeleted(courseId) {
    const channel = getChannel();
    const exchange = "course.events";
    const routingKey = "course.deleted";
    const event = {
        type: "COURSE_DELETED",
        data: { courseId }
    };
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(event)), {
        persistent: true
    });
    console.log(`Published event to ${routingKey}`);
};


