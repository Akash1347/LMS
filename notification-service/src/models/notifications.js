import pool from "../config/db.js";

export const NotificationModel = {
    async exists(eventId) {
        const res = await pool.query(
            "SELECT 1 FROM notifications WHERE event_id = $1", [eventId]
        );
        return res.rowCount > 0;
    },
    async insert(data) {
        await pool.query(
            `INSERT INTO notifications 
            (event_id, user_id, event_type, status, payload, channel, retry_count)
            VALUES ($1, $2, $3, $4, $5, $6, 0)
            `,
            [
                data.event_id,
                data.user_id,
                data.event_type,
                data.status,
                data.payload,
                data.channel
            ]
        );
    },

   async fetchPending(limit = 10) {
  const res = await pool.query(
    `
    SELECT *
    FROM notifications
    WHERE
      (
        status = 'PENDING'
        OR
        (
          status = 'FAILED'
          AND next_retry_at <= NOW()
        )
      )
      AND retry_count < max_retries
    ORDER BY created_at
    FOR UPDATE SKIP LOCKED
    LIMIT $1
    `,
    [limit]
  );

  return res.rows;
},

    async markSent(id) {
        await pool.query(
            "UPDATE notifications SET status='SENT', sent_at=NOW() WHERE id=$1",
            [id]
        );
    },

    async markFailed(id, nextRetry) {
        await pool.query(
            `
            UPDATE notifications SET status='FAILED',
            retry_count = retry_count+1, 
            next_retry_at = $2
            WHERE id= $1`,
            [id, nextRetry]
        );
    },

};
