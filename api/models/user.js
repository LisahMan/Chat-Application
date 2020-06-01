const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {type : String,required : true,unique : true},
    password : {type : String,required : true},
    socketId : {type : String},
    rooms : [{type : String}]
});

module.exports = mongoose.model("User",userSchema);