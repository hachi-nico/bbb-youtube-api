const db = require("../model/db");
const { toOrdinal } = require("pg-parameterize");
const e = require("cors");

const getUser = async (username) => {
  try {
    const res = await db.query(
      "SELECT username,nama,tipe,password FROM public.user WHERE LOWER(username) = LOWER($1)",
      [username]
    );
    return res.rows[0];
  } catch (e) {
    return false;
  }
};

const getUsers = async (limit = false, offset = 0, search, tipe, tglSort) => {
  try {
    let sql =
      "SELECT user_id,username,tipe,nama, TO_CHAR(tgl,'YYYY-MM-DD HH24:mm:ss') as tgl FROM public.user WHERE";
    let bindParam = [];

    if (tipe) {
      sql += " tipe IN(?)";
      bindParam.push(tipe);
    } else {
      sql += " tipe IN(1,2,3)";
    }

    if (search) {
      sql +=
        " AND (LOWER(username) like LOWER(?) OR LOWER(nama) like LOWER(?))";
      bindParam.push("%" + search + "%");
      bindParam.push("%" + search + "%");
    }

    if (tglSort == "ASC") {
      sql += " ORDER BY user_id ASC";
    } else {
      sql += " ORDER BY user_id DESC";
    }

    if (limit) {
      sql += " LIMIT ? OFFSET ?";
      bindParam.push(limit, offset);
    }

    const res = await db.query(toOrdinal(sql), bindParam);
    return res.rows;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const createUser = async (username, password, tipe, nama, tgl) => {
  try {
    await db.query(
      "INSERT INTO public.user (username,password,tipe,nama,tgl) VALUES ($1,$2,$3,$4,$5)",
      [username, password, tipe, nama, tgl]
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
