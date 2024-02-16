const mongoose = require('mongoose')


const plm = require ('passport-local-mongoose')
 

const userSchema = mongoose.Schema({
  username: String,
  pic: String,
  online: { type: Boolean, default: false }, // Add 'online' field with default value false
  lastSeen: { type: Date, default: Date.now },
  chats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    }
  ],

})


userSchema.plugin(plm)

const userModel = mongoose.model('user' , userSchema)


module.exports = userModel