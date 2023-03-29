var express = require("express");
var router = express.Router();
const Pusher = require("pusher");
var Chat = require("../models/chats");
var User = require("../models/users");

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
    res.status(500).json({ error: `error while fetching all messages.` });
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
      deleted: false,
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
    res.json({ result: true, newMessage: newChat });
  } catch (error) {
    res.status(500).send("Error sending message");
  }
});

// update message
router.put("/update-message/:id", async (req, res) => {
  try {
    await pusher.trigger("chat", "messageToUpdate", {
      id: req.params.id,
      message: req.body.message,
    });

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
    res
      .status(500)
      .json({
        error: `error while updating the message with id ${req.params.id}.`,
      });
  }
});

//delete message content
router.put("/remove-message/:id", async (req, res) => {
  try {
    await pusher.trigger("chat", "messageToRemove", {
      id: req.params.id,
      message: "message deleted",
    });

    if (req.body.message) {
      const deletedMessage = await Chat.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: { message: "message deleted", deleted: true },
        },
        { new: true }
      );
      res.json({ result: true, deletedMessage: deletedMessage });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        error: `error while removing the content of the message with id ${req.params.id}.`,
      });
  }
});

// delete all messages
router.delete("/", async (req, res) => {
  try {
    await Chat.deleteMany({});
    res.json({ result: true });
  } catch (error) {
    res.status(500).json({ error: "error while deleting all messages." });
  }
});

// delete one message based on id
router.delete("/:id", async (req, res) => {
  try {
    await Chat.deleteOne({ _id: req.params.id });
    res.json({ result: true });
  } catch (error) {
    res
      .status(500)
      .json({
        error: `error while deleting message with id ${req.params.id}.`,
      });
  }
});

module.exports = router;
