const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    sendby : {type : String,required : true},
    sendto : {type : String,required : true},
    content : {type : String,required : true}
});

module.exports = mongoose.model('Message',messageSchema);