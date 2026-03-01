import env from "./env.js";

export default {
    auth: env.AUTH_SERVICE_URL,
    course: env.COURSE_SERVICE_URL,
    enrollment: env.ENROLLMENT_SERVICE_URL,
    notification: env.NOTIFICATION_SERVICE_URL,
};