export function onUserRegistered(event){
    return {
        event_id: event.eventId,
        event_type: "USER_REGISTERED",
        user_id: event.userId,
        channels: ["EMAIL"],
        payload: {
            name: event.name,
            email: event.email
            
        }
    };
}