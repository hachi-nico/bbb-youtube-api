const jwt = require("jsonwebtoken");
const { resError } = require("../controller/globalFunction");
const { getWhitelist, deleteWhitelist } = require("../model/tokenWhitelist");

const authMiddleware = async (req, res, next) => {
  const reqToken = req.headers.authorization;
  if (!reqToken) return res.json(resError("Token kosong"));
  jwt.verify(reqToken, process.env.SECRET_TOKEN, async (err, data) => {
    const isValid = await getWhitelist(reqToken);
    if (err || !isValid) {
      deleteWhitelist(reqToken);
      return res.status(500).json(resError("Sesi login telah berakhir"));
    }

    if (!err && isValid) next();
  });
};

module.exports = authMiddleware;
