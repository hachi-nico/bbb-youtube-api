const multer = require("multer");

// override engine multer untuk tambah extension file
const uploadMiddleware = () => {};

module.exports = uploadMiddleware;
