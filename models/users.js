const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    user : String, 
    registrationDate : Date,
    color : String,
})

const User = mongoose.model("users", userSchema)
module.exports = User