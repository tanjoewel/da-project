const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_SCHEMA,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function executeQuery(query, args) {
  try {
    const [result] = await pool.query(query, args);
    return result;
  } catch (err) {
    // console.error("Error when querying: ", err.message);
    // propagate it up so that other functions can catch it and return the appropriate errors to the user
    throw new Error(`Error when querying: ${err.message}`);
  }

  // closing the connection is causing errors because after the first query the connection is closed and cannot accept any more queries.
  // as a result, we simply leave the connection open until the app stops running (which we do by ctrl+c in the terminal).
}

module.exports = {
  pool,
  executeQuery,
};
