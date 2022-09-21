const fs = require("fs");
const crypto = require("crypto-js");

// jika mengubah scopes hapus dulu json yang tersimpan
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload",
];

const TOKEN_DIR =
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
  "/.credentials/";

const TOKEN_PATH = TOKEN_DIR + "mytoken.json";

const storeToken = (token) => {
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
};

const encSingle = (plainText) => {
  return crypto.AES.encrypt(
    plainText,
    process.env.VERY_SECRET_TOKEN
  ).toString();
};

const decSingle = (hash) => {
  return crypto.AES.decrypt(hash, process.env.VERY_SECRET_TOKEN).toString(
    crypto.enc.Utf8
  );
};

module.exports = {
  SCOPES,
  TOKEN_DIR,
  TOKEN_PATH,
  storeToken,
  decSingle,
  encSingle,
};
