export function onUserRegistered(event){
    return {
        event_id: event.eventId,
        event_type: "USER_REGISTERED",
        user_id: event.payload.userId,
        channels: ["EMAIL"],
        payload: {
            name: event.payload.name,
            email: event.payload.email
            
        }
    };
}

export function onUserResetOtp(event){
    return{
        event_id: event.eventId,
        event_type: "USER_RESET_OTP",
        user_id: event.payload.user_id,
        channels: ["EMAIL"],
        payload:{
            email: event.payload.email,
            otp: event.payload.otp,
            expiresAt: event.payload.expiresAt
        }

    };
}

export function onUserVerifyOtp(event){
    return{
        event_id: event.eventId,
        event_type: "USER_VERIFY_OTP",
        user_id: event.payload.user_id,
        channels: ["EMAIL"],
        payload:{
            email: event.payload.email,
            otp: event.payload.otp,
            expiresAt: event.payload.expiresAt
        }

    };
}