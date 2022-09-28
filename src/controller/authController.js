const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getUser } = require("../model/user");
const { setWhitelist } = require("../model/tokenWhitelist");
const { resError, resSuccess } = require("../controller/globalFunction");

const login = async (req, res) => {
  const { username, password } = req.body;

  // cek apakah user valid
  const user = await getUser(username);
  const validUser = await bcrypt.compare(password, user.password);

  if (validUser) {
    jwt.sign(
      { user: user.username, id: user.id, tipe: user.tipe },
      process.env.SECRET_TOKEN,
      {
        expiresIn: "3 days",
        algorithm: "HS256",
      },
      async (err, token) => {
        if (err) return res.json(resError("Gagal saat Login"));

        try {
          setWhitelist(token);
        } catch (e) {
          return res.json(resError("Gagal saat Login"));
        }
        return res.json(resSuccess("Berhasil Login", { token }));
      }
    );
  } else {
    resError("Data user tidak valid");
  }
};

const createUser = async (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10, function (err, hash) {
    return res.json({ hash });
  });
  try {
  } catch (e) {}
};

module.exports = { login, createUser };
