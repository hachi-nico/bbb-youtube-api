const fs = require("fs");
const axios = require("axios");
const convert = require("xml-js");
const sha1 = require("crypto-js/sha1");

// jika mengubah scopes hapus dulu json yang tersimpan
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload",
];

const TOKEN_DIR =
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
  "/.credentials/";

const BASE_BBB = "https://conference16.ethol.pens.ac.id/bigbluebutton/";

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
};
