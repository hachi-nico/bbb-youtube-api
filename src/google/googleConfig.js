const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.WEB_CLIENT_ID,
  process.env.WEB_CLIENT_SECRET
);

module.exports = { oAuth2Client };
