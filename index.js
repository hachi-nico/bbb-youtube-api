const express = require("express");
const cors = require("cors");
require("dotenv").config();

const routes = require("./src/middleware/routes");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(routes);

app.listen(process.env.PORT, (err) => {
  if (err) return console.log("Internal Server Error");
  console.log(`Listen to ${process.env.PORT}`);
});
