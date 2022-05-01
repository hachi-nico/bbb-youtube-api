const upload = (req, res) => {
  try {
    res.status(200).json({
      message: "Successfully uploaded files",
      path: req.file.path,
      req: req.body
    });
  } catch (e) {
    res.status(500).json({ message: "Internal Error " + e });
  }
};

module.exports = {
  upload,
};
