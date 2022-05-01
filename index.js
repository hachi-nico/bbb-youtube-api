const express = require("express");
const routes = require("./src/youtube/routes");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(routes);

app.listen(port, () => {
  console.log(`Listen to ${port}`);
});
