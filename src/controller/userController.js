const bcrypt = require("bcrypt");

const { resError, resSuccess } = require("./globalFunction");
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../model/user");

const actionUserList = async (req, res) => {
  const { limit, offset, search, tipe, tglSort } = req.body;
  let users = await getUsers(limit, offset, search, tipe, tglSort);

  if (!users)
    return res
      .status(500)
      .json(resError("Gagal saat mengambil list data User"));

  return res.json(resSuccess("", { users }));
};

const actionAddUser = async (req, res) => {
  const { username, password, tipe, nama, tgl } = req.body;

  if (!username || !password || !tipe)
    return res.status(500).json(resError("Ada parameter wajib yang kosong"));

  if (tipe == 1)
    return res
      .status(500)
      .json(
        resError(
          "User dengan role Superuser tidak diperbolehkan untuk ditambah lagi"
        )
      );

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const userCreated = await createUser(username, passwordHash, tipe, nama, tgl);

    if (!userCreated)
      return res.status(500).json(resError("Gagal saat membuat User"));

    return res.json(resSuccess(""));
  } catch (e) {
    return res.status(500).json(resError("[CE] - Gagal saat membuat User"));
  }
};

const actionUpdateUser = async (req, res) => {
  const { username, tipe, nama, userId } = req.body;

  if (!userId)
    return res.status(500).json(resError("Ada parameter wajib yang kosong"));

  try {
    const userUpdated = await updateUser(username, tipe, nama, userId);

    if (!userUpdated)
      return res.status(500).json(resError("Gagal saat memperbarui User"));

    return res.json(resSuccess(""));
  } catch (e) {
    return res.status(500).json(resError("[CE] - Gagal saat memperbarui User"));
  }
};

const actionDeleteUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId)
    return res.status(500).json(resError("Ada parameter wajib yang kosong"));

  try {
    const userDeleted = await deleteUser(userId);

    if (!userDeleted)
      return res.status(500).json(resError("Gagal saat menghapus User"));

    return res.json(resSuccess(""));
  } catch (e) {
    return res.status(500).json(resError("[CE] - Gagal saat menghapus User"));
  }
};

module.exports = {
  actionUserList,
  actionAddUser,
  actionUpdateUser,
  actionDeleteUser,
};
