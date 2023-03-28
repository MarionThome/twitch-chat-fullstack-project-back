var express = require("express");
var router = express.Router();
const Pusher = require("pusher");
const bodyParser = require("body-parser");
var Chat = require("../models/chats");
var User = require("../models/users");
const { findOneAndUpdate } = require("../models/chats");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/messages", async (req, res) => {
  try {
    const data = await Chat.find({});
    if (data === null) {
      res.json({ result: false });
    } else {
      res.json({ result: true, messages: data });
    }
  } catch (error) {
    console.error(error);
  }
});

// send new message
router.post("/send-message", async (req, res) => {
  try {
    const payload = {
      author: req.body.username,
      message: req.body.message,
      date: new Date(),
      edited: false,
    };
    const newChat = new Chat(payload);
    await newChat.save();
    await pusher.trigger("chat", "message", newChat);

    // add foreign key to the user
    await User.findOneAndUpdate(
      { token: req.body.token },
      {
        $push: {
          messages: newChat._id,
        },
      }
    );
    res.json({result : true, newMessage : newChat});
  } catch (error) {
    res.status(500).send("Error sending message");
  }
});

// update message
router.put("/update-message/:id", async (req, res) => {
  try {
    await pusher.trigger("chat", "messageToUpdate", {id : req.params.id, message: req.body.message})
    
    if (req.body.message) {
      const updatedMessage = await Chat.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: { message: req.body.message, edited: true },
        },
        { new: true }
      );
      res.json({ result: true, updatedMessage: updatedMessage });
    }
  } catch (error) {
    console.error(error);
  }
});

// delete all messages
router.delete("/", (req, res) => {
  Chat.deleteMany({}).then(() => {
    res.json({ result: true });
  });
});

// delete one message based on id
router.delete("/:id", (req, res) => {
  Chat.deleteOne({ _id: req.params.id }).then(() => {
    res.json({ result: true });
  });
});

module.exports = router;
