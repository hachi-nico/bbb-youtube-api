const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;
const routes = require("./src/middleware/routes");

if (cluster.isMaster) {
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`pid ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const app = express();
  const port = process.env.PORT;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());
  app.use(routes);

  app.listen(port, () => console.log(`Listen to ${port}`));
}
