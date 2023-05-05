const express = require("express");
const jwt = require("jsonwebtoken");
const validations = require("./validations");
const userData = require("./usersdata");
const outingData = require("./outingData");
const router = express.Router();

router.route("/create", async (req, res) => {
  let username, userid;
  try {
    username = validations.checkString(username, "User Name");
    userid = validations.checkId(userid, "User ID");
  } catch (error) {
    return res.status.json({ error: error.message });
  }
});

module.exports = router;
