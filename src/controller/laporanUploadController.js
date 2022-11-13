const { getAntrian } = require("../model/laporan_upload");
const { resError, resSuccess } = require("../controller/globalFunction");

const actionGetAntrian = async (req, res) => {
  const antrian = await getAntrian();

  if (!antrian) return res.status(500).json(resError("Gagal saat get antrian"));

  return res.status(200).json(resSuccess("", { antrian }));
};

module.exports = { actionGetAntrian };
