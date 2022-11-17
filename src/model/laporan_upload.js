const db = require("../model/db");
const { toOrdinal } = require("pg-parameterize");

const getCurrentUploading = async () => {
  try {
    const res = await db.query(
      "SELECT id_laporan, judul, TO_CHAR(tgl_upload,'YYYY-MM-DD HH24:mm:ss') as tgl_upload FROM public.laporan_upload WHERE status = 2 LIMIT 1"
    );
    return res.rows[0];
  } catch (e) {
    return false;
  }
};

const getAntrian = async () => {
  try {
    const res = await db.query(
      "SELECT judul, deskripsi, tgl_upload from public.laporan_upload WHERE status IN(2,4) ORDER BY id_laporan ASC"
    );
    return res.rows;
  } catch (e) {
    return false;
  }
};

const getLaporan = async (limit = false, offset = 0, search, tipe, tglSort) => {
  try {
    let sql =
      "SELECT a.judul,a.deskripsi,a.tgl_upload, TO_CHAR(tgl,'YYYY-MM-DD HH24:mm:ss') as tgl FROM public.user WHERE";
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
  judul,
  deskripsi,
  durasi,
  tglUpload,
  url,
  status,
  idUser
) => {
  try {
    await db.query(
      "INSERT INTO public.laporan_upload (judul,deskripsi,durasi,tgl_upload,url,status,id_user) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [judul, deskripsi, durasi, tglUpload, url, status, idUser]
    );
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const updateLaporan = async (judul, deskripsi, idLaporan) => {
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

const updateStatusLaporan = async (status, idLaporan) => {
  try {
    await db.query(
      "UPDATE public.laporan_upload SET status = $1 WHERE id_laporan= $2",
      [status, idLaporan]
    );
    return true;
  } catch (e) {
    return false;
  }
};

const updateUrlLaporan = async (url, idLaporan) => {
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
};