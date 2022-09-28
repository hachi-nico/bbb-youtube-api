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

const createUser = async (username, password, tipe) => {
  try {
    await db.query(
      "INSERT INTO public.user (username,password,tipe) VALUES ($1,$2,$3)",
      [username, password, tipe]
    );
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = { getUser, createUser };
