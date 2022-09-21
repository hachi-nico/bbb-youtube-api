const jwt = require("jsonwebtoken");

const login = (req, res) => {
  const { username } = req.body;

  try {
    const token = jwt.sign({ username }, process.env.SECRET_TOKEN, {
      expiresIn: "1d",
      algorithm: "HS256",
    });

    return res.status(200).json({ token, maessage: "Berhasil Login" });
  } catch (e) {
    return res.status(500).json({ e, message: "Gagal saat login" });
  }
};

module.exports = { login };
