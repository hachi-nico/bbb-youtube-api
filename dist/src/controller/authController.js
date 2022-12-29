const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  getUser
} = require("../model/user");
const {
  setWhitelist,
  deleteWhitelist
} = require("../model/tokenWhitelist");
const {
  resError,
  resSuccess
} = require("./globalFunction");
const login = async (req, res) => {
  const {
    username,
    password
  } = req.body;
  // cek apakah user valid
  const user = await getUser(username);
  let validUser = false;
  try {
    validUser = await bcrypt.compare(password, user.password);
  } catch {
    validUser = false;
  }
  if (validUser) {
    jwt.sign({
      user: user.nama,
      tipe: user.tipe
    }, process.env.SECRET_TOKEN, {
      expiresIn: "3 days",
      algorithm: "HS256"
    }, async (err, token) => {
      if (err) return res.json(resError("Gagal saat Login"));
      try {
        setWhitelist(token);
      } catch (e) {
        return res.status(500).json(resError("Gagal saat Login"));
      }
      return res.json(resSuccess("Berhasil Login", {
        token
      }));
    });
  } else {
    return res.status(500).json(resError("Data user tidak valid"));
  }
};
const logout = async (req, res) => {
  const {
    token = ""
  } = req.body;
  if (!token) return res.status(500).json(resError("Gagal saat Logout"));
  const deleted = await deleteWhitelist(req.body.token);
  if (!deleted) return res.status(500).json(resError("Gagal saat Logout"));
  return res.status(200).json(resSuccess("Berhasil Logout"));
};
module.exports = {
  login,
  logout
};