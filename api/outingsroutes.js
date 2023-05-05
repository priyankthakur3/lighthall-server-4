const express = require("express");
const jwt = require("jsonwebtoken");
const validations = require("./validations");
const outingData = require("./outingData");
const userData = require("./usersdata");
const router = express.Router();
const axios = require("axios");
router.post("/createOuting", async (req, res) => {
  let friend, currentUser, outing;
  try {
    friend = await userData.getUser(req.body.friendId);
    console.log(friend);
    currentUser = await userData.getUser(req.user.id);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  try {
    outing = await outingData.initOuting(
      friend,
      currentUser,
      req.body.userRole,
      req.body.friendRole,
      req.body.date
    );
    return res.json(outing);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get("/getAllOutings", async (req, res) => {
  let currentUser, outings;
  try {
    currentUser = await userData.getUser(req.user.id);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  try {
    outings = await outingData.getAllOutings(currentUser);
    return res.json(outings);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get("/getOutingById", async (req, res) => {
  let currentUser, outing;
  try {
    currentUser = await userData.getUser(req.user.id);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  try {
    outing = await outingData.getOutingById(currentUser, req.query.outingId);
    return res.json(outing);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.post("/updateOuting", async (req, res) => {
  let currentUser, outing;
  try {
    currentUser = await userData.getUser(req.user.id);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  try {
    outing = await outingData.updateOuting(currentUser, req.body);
    return res.json(outing);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get("/getRestaurants", async (req, res) => {
  restaurantList = [];

  let reqParams = req.query;

  let params = "limit=20";
  params += "&location=" + reqParams.location.replaceAll(" ", "");
  params += "&term=" + reqParams.term.replaceAll(" ", "");
  params += "&price=" + reqParams.price.replaceAll(" ", "");
  params += "&categories=" + reqParams.categories.replaceAll(" ", "");

  console.log("params : ", params);
  const options = {
    method: "GET",
    url: "https://api.yelp.com/v3/businesses/search?" + params,
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer ZSTg3rjsJHqKdwiy_rW0W_Wvic2g2HwuEkx6OM70vu5jMsd3yhcaVEVfQMJCmP0_F9u9cbO679uiDgrlWZc8e-eJpPYQDDOiJNpTvIl0KFec3-DfqxXwxicqmTdRZHYx",
    },
  };

  let response = await axios.request(options);
  console.log("Yelp data : ", response.data);
  let result = [];
  result = response.data.businesses.slice(0, 20).map((res) => {
    console.log("res : ", res);
    return {
      id: res.id,
      name: res.alias,
      price: res.price,
      phone: res.phone,
      location: res.location.display_address,
    };
  });
  res.status(200).json(result);
});

module.exports = router;
