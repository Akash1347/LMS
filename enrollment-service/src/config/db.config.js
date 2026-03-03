import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

});

pool.on('connect', () => {
    console.log('connected to the enrollment-service database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export default pool;