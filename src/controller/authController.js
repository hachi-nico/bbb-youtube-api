const jwt = require("jsonwebtoken");

const dummydb = {
  username: "nico",
  password: "U2FsdGVkX19WSkC01wtRjWvQl9HWgNtk9ByGspPjgwo=",
};

const login = (req, res) => {
  const { username, password } = req.body;
  // cek apakah user valid

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
