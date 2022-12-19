const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const { routes } = require("./src/middleware/routes");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(routes);

app.listen(process.env.PORT, (err) => {
  if (err) return console.log("Internal Server Error");
  console.log(`Listen to ${process.env.PORT}`);
});

// untuk update secret di db
const { setAllSecretStatus } = require("./src/model/google_auth_secret");
const { logger } = require("./src/controller/globalFunction");
cron.schedule(
  "0 15 * * *",
  async () => {
    const success = await setAllSecretStatus();
    success ? true : logger("[GCUA] Gagal cron set all secret");
  },
  {
    scheduled: true,
    timezone: "Asia/Jakarta",
  }
);
