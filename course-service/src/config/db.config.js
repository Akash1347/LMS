import pkg from "pg";
import logger from "./logger.config.js";

const { Pool } = pkg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
pool.on('connect', () => {
    logger.info({ event: 'db_connected' });
});
pool.on('error', (err) => {
    logger.error({
        event: 'db_idle_client_error',
        message: err.message,
        stack: err.stack,
    });
});

export default pool;
