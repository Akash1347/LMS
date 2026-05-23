import pool from "../config/db.config.js";

export const executeSql = async (sql) => {
  const response = await pool.query(sql);
  return response.rows;
};
