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

const getUsers = async (limit = 15, offset = 0) => {
  try {
    const res = await db.query(
      "SELECT user_id,username,nama,tipe FROM public.user LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    return res.rows;
  } catch (e) {
    return false;
  }
};

const createUser = async (username, password, tipe, nama) => {
  try {
    await db.query(
      "INSERT INTO public.user (username,password,tipe,nama) VALUES ($1,$2,$3,$4)",
      [username, password, tipe, nama]
    );
    return true;
  } catch (e) {
    return false;
  }
};

const updateUser = async (username, tipe, nama, userId) => {
  try {
    await db.query(
      "UPDATE public.user SET username = $1, tipe = $2, nama = $3 WHERE user_id= $4",
      [username, tipe, nama, userId]
    );
    return true;
  } catch (e) {
    return false;
  }
};

const deleteUser = async (userId) => {
  try {
    await db.query("DELETE FROM public.user WHERE user_id = $1", [userId]);
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = { getUser, createUser, getUsers, updateUser, deleteUser };
