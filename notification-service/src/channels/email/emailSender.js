import { sendMail } from "../../utils/sendMail.js";
import { welcomeTemplate } from "../../templates/welcomeMail.js";
import { resetPasswordTemplate } from "../../templates/passwordReset.js";
import { verifyEmailTemplate } from "../../templates/verificationMail.js";

export async function sendWelcomeEmail(data) {
    await sendMail({
        to: data.email,
        subject: "Welcome to LMS!",
        text: `Hi ${data.name}, welcome to LMS!`,
        template: welcomeTemplate(data.name || "Learner"),
    });
}

export async function sendOtpEmail(data) {
    await sendMail({
        to: data.email,
        subject: "Password reset OTP",
        text: `Your password reset OTP is ${data.otp}`,
        template: resetPasswordTemplate(data.name || "Learner", data.otp),
    });
}

export async function sendVerificationEmail(data) {
    await sendMail({
        to: data.email,
        subject: "Verify your email",
        text: `Your verification OTP is ${data.otp}`,
        template: verifyEmailTemplate(data.name || "Learner", data.otp),
    });
}

export async function sendEmail(data, event_type) {
    switch (event_type) {
        case "USER_REGISTERED":
            return sendWelcomeEmail(data);
        case "USER_RESET_OTP":
            return sendOtpEmail(data);
        case "USER_VERIFY_OTP":
            return sendVerificationEmail(data);
        default:
            console.log("unknown event", event_type);
            return null;
    }
}
