const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const { resError } = require("../controller/globalFunction");
const { getWhitelist, deleteWhitelist } = require("../model/tokenWhitelist");

let filenNameFormat = "";

// override engine multer untuk tambah extension file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const format = new Date().toISOString() + path.extname(file.originalname);
    filenNameFormat = format;
    cb(null, format);
  },
});

module.exports = async (req, res, next) => {
  const reqToken = req.headers.authorization;
  res.locals.filename = filenNameFormat;

  if (!reqToken) return res.json(resError("Token kosong"));
  jwt.verify(reqToken, process.env.SECRET_TOKEN, async (err, data) => {
    const isValid = await getWhitelist(reqToken);
    if (err || !isValid) {
      await deleteWhitelist(reqToken);
      return res
        .status(500)
        .json(resError("Sesi login telah berakhir", { status: 5 }));
    }
  });

  multer({ storage: storage }).single("file")(req, res, () => {
    next();
  });
};
