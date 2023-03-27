const mongoose = require('mongoose')

const chatSchema = mongoose.Schema({
    author : String, 
    message : String, 
    date : Date,
    edited : Boolean
})

const Chat = mongoose.model("chats", chatSchema)
module.exports = Chat