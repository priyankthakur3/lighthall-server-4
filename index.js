const express = require("express");
const app = express();
const cors = require("cors");
const loginRoutes = require("./api/loginroutes");
const outingRoutes = require("./api/outingsroutes");

const jwt = require("jsonwebtoken");
require("dotenv").config();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
});

app.use("/api", (req, res, next) => {
  try {
    if (
      req.path === "/user/login" ||
      req.path === "/user/register" ||
      req.path === "/user/"
    ) {
      next();
    } else {
      /* decode jwt token if authorized*/

      jwt.verify(req.headers.token, "shhhhh11111", function (err, decoded) {
        if (decoded && decoded.user) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({
            errorMessage: "User unauthorized!",
            status: false,
          });
        }
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: "Something went wrong!",
      status: false,
    });
  }
});

app.use("/api/user", loginRoutes);
app.use("/api/outing", outingRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
