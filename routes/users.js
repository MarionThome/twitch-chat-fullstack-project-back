const colors = require("../colors");
var express = require("express");
var router = express.Router();
var User = require("../models/users");
const uid2 = require("uid2");

const COLORS_LENGTH = colors.length;

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// get all user
router.get("/all", async (req, res) => {
  try {
    const data = await User.find({});
    if (data === null) {
      res.json({ result: false });
    } else {
      res.json({ result: true, users: data });
    }
  } catch (error) {
    res.status(500).json({ error: `server error.` });
  }
});

// create new user if the user does not exist
router.post("/new-user", async (req, res) => {
  try {
    const data = await User.findOne({ username: req.body.username });
    if (data === null) {
      const userColor = colors[Math.floor(Math.random() * COLORS_LENGTH)];
      const token = uid2(32);
      const newUser = new User({
        token: token,
        username: req.body.username,
        registrationDate: new Date(),
        color: userColor,
        messages: [],
      });

      const savedUser = await newUser.save();
      res.json({ result: true, user: savedUser });
    } else {
      res.json({ result: false, error: "User already exists" });
    }
  } catch (error) {
    res.status(500).json({ error: `error whith user fetch.` });
  }
});

// delete all messages
router.delete("/all", async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ result: true });
  } catch (error) {
    res.status(500).json({ error: "error while deleting all users." });
  }
});

// delete one message based on id
router.delete("/:id", async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id });
    res.json({ result: true });
  } catch (error) {
    res
      .status(500)
      .json({ error: `error while deleting user with id ${req.params.id}.` });
  }
});

module.exports = router;
