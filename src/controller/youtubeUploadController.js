const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
const SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"];
const TOKEN_DIR =
  (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
  "/.credentials/";
const TOKEN_PATH = TOKEN_DIR + "youtube-nodejs-quickstart.json";

// controller
const getAuth = (req, res) => {
  try {
    // Load client secrets from a local file.
    fs.readFile(
      "client-secret-dev.json",
      function processClientSecrets(err, content) {
        if (err) {
          console.log("Error loading client secret file: " + err);
          return;
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        authorize(JSON.parse(content), getChannel, res);
      }
    );
  } catch (e) {
    return res.status(500).json({
      message: "Gagal get auth " + e,
    });
  }
};

const authorize = (credentials, callback, res) => {
  const clientSecret = credentials.web.client_secret;
  const clientId = credentials.web.client_id;
  const redirectUrl = credentials.web.redirect_uris[0];
  const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback, res);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, res);
    }
  });
};

function getNewToken(oauth2Client, callback, res) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url: ", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log("Error while trying to retrieve access token", err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client, res);
    });
  });
}

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
    console.log("Token stored to " + TOKEN_PATH);
  });
}

function getChannel(auth, res) {
  const service = google.youtube("v3");
  service.channels.list(
    {
      mine: true,
      auth: auth,
      part: "snippet,contentDetails,statistics",
    },
    function (err, response) {
      if (err) {
        console.log("The API returned an error: " + err);
        return;
      }
      const channels = response.data.items;
      if (channels.length == 0) {
        console.log("No channel found.");
      } else {
        console.log(
          "This channel's ID is %s. Its title is '%s', and " +
            "it has %s views.",
          channels[0].id,
          channels[0].snippet.title,
          channels[0].statistics.viewCount
        );
        return res.status(200).json({
          message: "berhasil get channel " + channels[0].snippet.title,
        });
      }
    }
  );
}

module.exports = { getAuth };
