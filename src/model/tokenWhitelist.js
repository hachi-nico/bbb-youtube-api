const db = require("../model/db");

const getWhitelist = async (token) => {
  try {
    const res = await db.query(
      "SELECT jwt FROM token_whitelist WHERE jwt = $1",
      [`${token}`]
    );
    return res.rows[0];
  } catch (e) {
    return false;
  }
};

const setWhitelist = async (token) => {
  try {
    await db.query("INSERT INTO token_whitelist (jwt) VALUES ($1)", [token]);
    return true;
  } catch (e) {
    return false;
  }
};

const deleteWhitelist = async (token) => {
  try {
    await db.query("DELETE FROM token_whitelist WHERE jwt = $1", [token]);
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = { getWhitelist, setWhitelist, deleteWhitelist };
