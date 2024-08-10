// db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // Ensure this environment variable is set in Vercel
  ssl: {
    rejectUnauthorized: false  // Necessary for managed databases like Vercel's
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
