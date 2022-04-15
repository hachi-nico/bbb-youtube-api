const upload = (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);
    res.status(200).json({
      message: "Successfully uploaded files",
      path: req.file.path,
    });
  } catch (e) {
    res.status(500).json({ message: "Internal Error " + e });
  }
};

module.exports = {
  upload,
};
