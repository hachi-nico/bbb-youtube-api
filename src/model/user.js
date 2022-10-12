const db = require("../model/db");
const { toOrdinal } = require("pg-parameterize");
const e = require("cors");

const getUser = async (username) => {
  try {
    const res = await db.query(
      "SELECT username,password,tipe FROM public.user WHERE LOWER(username) = LOWER($1)",
      [username]
    );
    return res.rows[0];
  } catch (e) {
    return false;
  }
};

const getUsers = async (
  limit = 15,
  offset = 0,
  usernameParams,
  tipeParams,
  namaParams,
  tglSort
) => {
  try {
    let sql =
      "SELECT user_id,username,tipe,nama,TO_CHAR(tgl,'DD-MM-YYYY HH24:mm:ss') FROM public.user";
    let bindParam = [];

    // sorting dan searching
    if (usernameParams) {
      sql += " WHERE username like LOWER(?)";
      bindParam.push("%" + usernameParams + "%");
    }

    if (tipeParams) {
      sql += " AND tipe = ?";
      bindParam.push(tipeParams);
    }

    if (namaParams) {
      sql += " AND LOWER(nama) like LOWER(?)";
      bindParam.push("%" + namaParams + "%");
    }

    if (tglSort == "ASC") {
      sql += " ORDER BY tgl ASC LIMIT ? OFFSET ?";
    } else {
      sql += " ORDER BY tgl DESC LIMIT ? OFFSET ?";
    }

    bindParam.push(limit, offset);
    const res = await db.query(toOrdinal(sql), bindParam);
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
