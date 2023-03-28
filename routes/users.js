const colors = require('../colors')
var express = require('express');
var router = express.Router();
var User = require('../models/users')
const uid2 = require('uid2');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/all', async (req, res) => {
  try{
    const data = await User.find({})
    console.log(data)
    if(data === null) {
      res.json({result : false})
    } else  {
      res.json({result : true, users : data})
    }
  }
  catch(error){
    console.error(error)
  }
})

router.post('/new-user', async (req, res) => {
  try {
    const data = await User.findOne({ username: req.body.username });
    console.log(colors)
    if (data === null) {
      const userColor = colors[Math.floor(Math.random() * 100)]
      const token = uid2(32);
      const newUser = new User({
        token : token,
        username: req.body.username,
        registrationDate : new Date(),
        color : userColor,
        messages : [],
      });
  
      const savedUser = await newUser.save();
      res.json({ result: true, user: savedUser});

    } else {
      res.json({ result: false, error: 'User already exists' });
    }
  } catch (error) {
    console.error(error)
  }
})

router.delete("/all", (req, res) => {
  User.deleteMany({}).then(() => {
    res.json({ result: true });
  });
});

module.exports = router;
