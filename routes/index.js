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


// send new message 
router.post("/send-message", async (req, res) => {
  try {
    await pusher.trigger("chat", "message", {
      username: req.body.username,
      message: req.body.message,
    });

    const newChat = new Chat({
      author: req.body.username,
      message: req.body.message,
      date: new Date(),
      edited : false
    });
    await newChat.save();
    console.log(newChat._id)

    // add foreign key to the user
    const user = await User.findOneAndUpdate(
      { token: req.body.token },
      { $push: {
        messages : newChat._id
      }
        },
    );
    res.send(newChat);

  } catch (error) {

    res.status(500).send("Error sending message");

  }
});

// update message
router.put("/update-message/:id", async (req, res) => {
  try{
    if(req.body.message){
      const updatedMessage = await Chat.findOneAndUpdate({_id : req.params.id},{
         $set: { message: req.body.message, edited : true } 
      }, { new: true })
      res.json({ result: true, updatedMessage: updatedMessage})
    }
  }catch(error){
    console.error(error)
  }
})

// delete all messages
router.delete('/', (req, res) => {
  Chat.deleteMany({}).then(()=>{
    res.json({result : true})
  })
})

// delete one message based on id
router.delete('/:id', (req, res) => {
  Chat.deleteOne({_id : req.params.id}).then(()=>{
    res.json({result : true})
  })
})



module.exports = router;
