const {
  getAntrian,
  countAntrian,
  getLaporan,
} = require("../model/laporan_upload");
const { resError, resSuccess } = require("../controller/globalFunction");

const actionGetAntrian = async (req, res) => {
  const { offset } = req.body;
  const antrian = await getAntrian(offset);

  if (!antrian) return res.status(500).json(resError("Gagal saat get antrian"));

  return res.status(200).json(resSuccess("", { antrian }));
};

const actionCountAntrian = async (req, res) => {
  const count = await countAntrian();
  if (!count)
    return res.status(500).json(resError("Gagal saat get count antrian"));

  return res.status(200).json(resSuccess("", { count: count.count }));
};

const actionListLaporan = async (req, res) => {
  const { limit, offset, search, status, tglSort } = req.body;
  const laporan = await getLaporan(limit, offset, search, status, tglSort);

  if (!laporan)
    return res
      .status(500)
      .json(resError("Gagal saat mengambil list data laporan"));

  return res.json(resSuccess("", { laporan }));
};

module.exports = { actionGetAntrian, actionCountAntrian, actionListLaporan };
