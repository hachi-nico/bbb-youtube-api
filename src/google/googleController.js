const { oAuth2Client } = require("./googleConfig");
const { google } = require("googleapis");

const getAuth = (req, res) => {
  try {
    const oauth2 = google.oauth2({
      auth: oAuth2Client,
      version: "v2",
    });
    oauth2.userinfo.get(function (err, response) {
      if (err) {
        return res.status(500).json({
          message: "Gagal get auth " + err,
        });
      } else {
        return res.status(200).json({
          message: "Berhasil get auth",
          authData: response.data,
        });
      }
    });
  } catch (e) {
    return res.status(500).json({
      message: "Gagal get auth " + e,
    });
  }
};

module.exports = { getAuth };
