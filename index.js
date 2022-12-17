const express = require("express");
const cors = require("cors");
require("dotenv").config();

const routes = require("./src/middleware/routes");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(routes);

const server = app.listen(process.env.PORT, (err) => {
  if (err) return console.log("Internal Server Error");
  console.log(`Listen to ${process.env.PORT}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", function (socket) {
  socket.emit("status", true);

  socket.on("disconnect", function () {
    socket.emit("status", false);
  });
});
