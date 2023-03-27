const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    token : String,
    username : String, 
    registrationDate : Date,
    color : String,
    messages : [{ type: mongoose.Schema.Types.ObjectId, ref: 'chats' }]
})

const User = mongoose.model("users", userSchema)
module.exports = User