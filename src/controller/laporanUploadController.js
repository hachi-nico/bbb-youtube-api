const { getAntrian, countAntrian } = require("../model/laporan_upload");
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

module.exports = { actionGetAntrian, actionCountAntrian };
