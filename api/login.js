const express = require("express");
const router = express.Router();
const validations = require("./validations.js");
const jwt = require("jsonwebtoken");
const { checkUser, checkIfUserExists, createUser } = require("./usersdata");

function checkUserAndGenerateToken(data, req, res) {
  jwt.sign(
    { user: data.username, id: data._id },
    "shhhhh11111",
    { expiresIn: "1d" },
    (err, token) => {
      if (err) {
        res.status(400).json({
          status: false,
          errorMessage: err,
        });
      } else {
        res.json({
          message: "Login Successfully.",
          token: token,
          status: true,
        });
      }
    }
  );
}

router.post("/login", async (req, res) => {
  let username, password;
  try {
    username = validations.checkMail(req.body.username);
    password = validations.checkString(req.body.password);
  } catch (error) {
    return req.status(400).json({ error });
  }
  if (!(await checkUser(username, password)))
    return res
      .status(400)
      .json({ error: "Either Username or password is incorrect" });
  let dbUser;
  try {
    dbUser = await userData.checkUser(username, password);
    checkUserAndGenerateToken(dbUser, req, res);
  } catch (err) {
    return res.status(400).json(err.message);
  }
});

router.post("/register", async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  try {
    username = validations.checkMail(username, "user_name");
    password = validations.checkString(password, "user_password");
  } catch (error) {
    return res.status(400).json({ error });
  }

  if (await checkIfUserExists(username))
    return res.status(400).json({ error: "User already exists in system" });
  let userCreated;
  try {
    userCreated = await createUser(username, password);
  } catch (error) {
    return res.status(500).json({ error });
  }
  if (userCreated) {
    return res.json({ status: "User Created" });
  }
});
module.exports = router;
