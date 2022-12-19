const db = require("../model/db");

const getSecret = async () => {
  try {
    const res = await db.query(
      "SELECT secret FROM public.google_auth_secret WHERE status = 1 ORDER BY id ASC LIMIT 1"
    );
    return res.rows[0];
  } catch (e) {
    console.log(e);
    return false;
  }
};

const setAllSecretStatus = async () => {
  try {
    await db.query("UPDATE public.google_auth_secret SET status = 1");
    return true;
  } catch (e) {
    return false;
  }
};

const markExpSecret = async () => {
  try {
    const currentSecret = await db.query(
      "SELECT secret FROM public.google_auth_secret WHERE status = 1 ORDER BY id ASC LIMIT 1"
    );

    await db.query(
      "UPDATE public.google_auth_secret SET status = 2 WHERE secret = $1",
      [currentSecret.rows[0].secret]
    );

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = { getSecret, setAllSecretStatus, markExpSecret };
