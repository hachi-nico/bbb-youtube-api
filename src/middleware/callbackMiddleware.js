const recordingReadyMiddleware = (req, res, next) => {
  const { secret } = req.query;
  const isSecretValid = secret == process.env.VERY_SECRET_TOKEN;

  if (secret && isSecretValid) next();
  return res.status(500).json({ message: "Token tidak valid" });
};

module.exports = { recordingReadyMiddleware };
