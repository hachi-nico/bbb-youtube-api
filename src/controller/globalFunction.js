const fs = require("fs");
const axios = require("axios");
const convert = require("xml-js");
const sha1 = require("crypto-js/sha1");
const dayjs = require("dayjs");
const webpush = require("web-push");

const insertDateTimeFormat = "YYYY-MM-DD HH:mm:ss";

// jika mengubah scopes hapus dulu json yang tersimpan
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl ",
];

const TOKEN_DIR =
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
  "/.credentials/";

const BASE_BBB = "https://conference16.ethol.pens.ac.id/bigbluebutton/";

const TOKEN_PATH = TOKEN_DIR + "token";

const storeToken = (token, prefix) => {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH + prefix, JSON.stringify(token), (err) => {
    if (err) throw err;
  });
};

const resSuccess = (message = "", additionalObj = {}) => {
  return { status: 1, message, ...additionalObj };
};

const resError = (message = "", additionalObj = {}) => {
  return { status: 0, message, ...additionalObj };
};

const apiCall = async (url, method = "post", params = {}) => {
  try {
    const { data } = await axios({ url, method, params });
    try {
      return xmlToJS(data);
    } catch (e) {
      return data;
    }
  } catch (e) {
    return false;
  }
};

const xmlToJS = (data) => {
  return convert.xml2js(data, { compact: true, spaces: 2 });
};

const hashBBBSecret = (secret) => {
  return sha1(secret).toString();
};

const logger = (val) => {
  const logValue = `${dayjs().format(insertDateTimeFormat)} : ${val ?? ""} \n`;
  const cwd = require("path").dirname(require.main.filename);
  try {
    fs.appendFile(
      cwd + "/.log/" + dayjs().format("MMM-YYYY").toString() + ".log",
      logValue,
      (err) => {
        if (err)
          console.log(
            dayjs().format(insertDateTimeFormat) + " Gagal Saat tulis log"
          );
      }
    );
    return console.log(logValue);
  } catch (e) {
    console.log(dayjs().format(insertDateTimeFormat) + " Gagal Saat tulis log");
  }
};

const fireNotification = (subs, body) => {
  const payload = JSON.stringify({ title: "Dashboard Auto Upload", body });

  try {
    webpush.sendNotification(subs, payload);
    return res.status(200).json({});
  } catch (e) {
    console.log(e);
    logger("[GMN] Gagal saat mengirim notifikasi");
  }
};

module.exports = {
  SCOPES,
  TOKEN_DIR,
  TOKEN_PATH,
  BASE_BBB,
  storeToken,
  resError,
  resSuccess,
  apiCall,
  hashBBBSecret,
  insertDateTimeFormat,
  logger,
  fireNotification,
};
