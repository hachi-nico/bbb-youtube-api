const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { getUser } = require("../model/user");
const { resError, resSuccess } = require("../controller/globalFunction");

const login = async (req, res) => {
  const { username, password } = req.body;

  // cek apakah user valid
  const user = await getUser(username);
  const validUser = await bcrypt.compare(password, user.password);

  if (validUser) {
    try {
      const token = jwt.sign(
        { user: user.username, id: user.id },
        process.env.SECRET_TOKEN,
        {
          expiresIn: "5m",
          algorithm: "HS256",
        }
      );
      return res.json(resSuccess("", { token }));
    } catch (e) {
      return res.json(resError("Gagal saat Login"));
    }
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
