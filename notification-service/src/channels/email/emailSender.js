export function sendWelcomeEmail(data) {
    console.log("sent welcome email :", data);
}

export function sendOtpEmail(data) {
    console.log("sent otp :", data);
}

export function sendVerificationEmail(data) {
    console.log("sent verification email :", data);
}

export function sendEmail(data, event_type) {
    switch (event_type) {
        case "USER_REGISTERED":
            sendWelcomeEmail(data);
            break;

        case "USER_RESET_OTP":
            sendOtpEmail(data);
            break;
        case "USER_VERIFY_OTP":
            sendVerificationEmail(data);
            break;
        default:
            console.log("unknown event");
            break;
    }
}
