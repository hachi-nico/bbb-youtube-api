const fs = require("fs");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// jika mengubah scopes hapus dulu json yang tersimpan
const SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"];
const TOKEN_DIR =
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
  "/.credentials/";
const TOKEN_PATH = TOKEN_DIR + "mytoken.json";

const getAuth = (req, res) => {
  try {
    // Load dari file lokal
    fs.readFile(
      "client-secret-dev.json",
      function processClientSecrets(err, content) {
        if (err) {
          return res.status(500).json({
            message: "Gagal saat load client secret file: " + err,
          });
        }
        authorize(JSON.parse(content), returnAtuh, res);
      }
    );
  } catch (e) {
    return res.status(500).json({
      message: "Gagal get auth " + e,
    });
  }
};

// proses auth
const authorize = (credentials, callback, res) => {
  const { client_secret, client_id } = credentials.web;
  const redirectUrl = credentials.web.redirect_uris[0];

  // Cek apakah sudah ada token yang tersimpan di disk sebelumnya
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      // jika belum return credentialnya saja
      // getNewToken(oauth2Client, callback, res);
      return res.status(200).json({
        status: 0,
        message: "Token yang tersimpan tidak ditemukan",
        oauth2ClientSecret: client_secret,
        oauth2ClientId: client_id,
        oauth2ClientRedirectUrl: redirectUrl,
      });
    } else {
      const oauth2Client = new OAuth2(client_id, clientSecret, redirectUrl);
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, res);
    }
  });
};

const getAuthUrl = (req, res) => {
  const { oauth2ClientSecret, oauth2ClientId, oauth2ClientRedirectUrl } =
    req.body;

  const oauth2Client = new OAuth2(
    oauth2ClientId,
    oauth2ClientSecret,
    oauth2ClientRedirectUrl
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  return res.redirect(authUrl);
};

const getNewToken = (req, res) => {
  const { oauth2ClientUrlCode } = req.query.code;

  oauth2ClientUrlCode.getToken(code, function (err, token) {
    if (err) {
      return res.status(500).json({
        message: "Gagal saat mendapatkan token dari authurl" + err,
      });
    }
    oauth2ClientUrlCode.credentials = token;
    storeToken(token);
    returnAtuh(oauth2Client, res);
  });
};

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log("Token tersimpan ke " + TOKEN_PATH);
  });
}

function returnAtuh(auth, res) {
  return res.status(200).json({
    authObject: auth,
  });
}

module.exports = { getAuth, getAuthUrl, getNewToken };
