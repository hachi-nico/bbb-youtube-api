const db = require("../model/db");

const getUser = async (username) => {
  try {
    const res = await db.query(
      "SELECT username,password,tipe FROM public.user WHERE username = $1",
      [username]
    );
    return res.rows[0];
  } catch (e) {
    return false;
  }
};

module.exports = { getUser };
