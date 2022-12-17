const db = require("../model/db");
const { toOrdinal } = require("pg-parameterize");

const getCurrentUploading = async () => {
  try {
    const res = await db.query(
      "SELECT id_laporan, judul, TO_CHAR(tgl_upload,'YYYY-MM-DD HH24:mm:ss') AS tgl_upload FROM public.laporan_upload WHERE status = 2 LIMIT 1"
    );
    return res.rows[0];
  } catch (e) {
    return false;
  }
};

const getNextAntrian = async () => {
  try {
    const res = await db.query(
      "SELECT id_laporan,judul, deskripsi FROM public.laporan_upload WHERE status = 4 ORDER BY id_laporan ASC LIMIT 1"
    );
    return res.rows[0];
  } catch (e) {
    return false;
  }
};

const getAntrian = async (offset) => {
  try {
    let sql =
      "SELECT judul, deskripsi,status, TO_CHAR(tgl_upload,'YYYY-MM-DD HH24:mm:ss') AS tgl_upload FROM public.laporan_upload WHERE status IN(2,4) ORDER BY id_laporan ASC";
    const bindParam = [];
    if (offset) {
      sql += " OFFSET $1 LIMIT 30 ";
      bindParam.push(offset);
    }
    const res = await db.query(sql, bindParam);
    return res.rows;
  } catch (e) {
    return false;
  }
};

const countAntrian = async () => {
  try {
    const res = await db.query(
      "SELECT COUNT(id_laporan) FROM public.laporan_upload WHERE status IN(2,4)"
    );
    return res.rows[0];
  } catch (e) {
    return false;
  }
};

const getLaporan = async (
  limit = false,
  offset = 0,
  search = "",
  tipe = 0,
  tglSort = ""
) => {
  try {
    let sql =
      "SELECT judul,deskripsi, TO_CHAR(tgl_upload,'YYYY-MM-DD HH24:mm:ss') AS tgl_upload FROM public.user WHERE";
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

const createLaporan = async (
  judul = "",
  deskripsi = "",
  tglUpload = "",
  url = "",
  status = 0,
  idUser = 0
) => {
  try {
    await db.query(
      "INSERT INTO public.laporan_upload (judul,deskripsi,tgl_upload,url,status,id_user) VALUES ($1,$2,$3,$4,$5,$6)",
      [judul, deskripsi, tglUpload, url, status, idUser]
    );
    return true;
  } catch (e) {
    return false;
  }
};

const updateLaporan = async (judul = "", deskripsi = "", idLaporan = 0) => {
  try {
    await db.query(
      "UPDATE public.laporan_upload SET judul = $1, deskripsi = $2 WHERE id_laporan user_id= $3",
      [judul, deskripsi, idLaporan]
    );
    return true;
  } catch (e) {
    return false;
  }
};

const updateStatusLaporan = async (status = 0, deskripsi = 0) => {
  try {
    await db.query(
      "UPDATE public.laporan_upload SET status = $1 WHERE deskripsi = $2",
      [status, deskripsi]
    );
    return true;
  } catch (e) {
    return false;
  }
};

const updateUrlLaporan = async (url = "", idLaporan = 0) => {
  try {
    await db.query(
      "UPDATE public.laporan_upload SET url = $1 WHERE id_laporan= $2",
      [url, idLaporan]
    );
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = {
  createLaporan,
  updateLaporan,
  updateStatusLaporan,
  updateUrlLaporan,
  getCurrentUploading,
  getLaporan,
  getAntrian,
  getNextAntrian,
  countAntrian,
};
