const mongoose = require('mongoose')

const chatSchema = mongoose.Schema({
    author : String, 
    message : String, 
    date : Date,
    messages : [[{ type: mongoose.Schema.Types.ObjectId, ref: 'messages' }]]
})

const Chat = mongoose.model("chats", chatSchema)
module.exports = Chat