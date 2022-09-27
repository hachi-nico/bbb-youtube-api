const Client = require("pg").Pool;
const pool = new Client({
  user: "nico",
  host: process.env.DB_HOST,
  database: "bbb_youtube",
  password: process.env.DB_PASS,
  port: 5432,
});

pool.connect();

module.exports = pool;
