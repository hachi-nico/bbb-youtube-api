const db = require("../model/db");

const getUser = async (username) => {
  db.connect();
  try {
    const res = await db.query(
      "SELECT * FROM public.user WHERE username = $1",
      [username]
    );
    return res.rows[0];
  } catch (e) {
    return false;
  }
};

module.exports = { getUser };
