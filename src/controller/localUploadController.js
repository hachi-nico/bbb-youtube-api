// controller
const upload = (req, res) => {
  try {
    return res.status(200).json({
      message: "Berhasil upload ke server",
      req: req.body,
    });
  } catch (e) {
    return res.status(500).json({ e, message: "Error saat upload ke server" });
  }
};

// depedency function

module.exports = { upload };
