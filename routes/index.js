var express = require('express');
var router = express.Router();
const Pusher = require('pusher');
const bodyParser = require('body-parser');
var Chat = require('../models/chats')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
