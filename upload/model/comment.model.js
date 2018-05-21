const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema ({
    content:{ type:String, trim:true, required:true },
    newsCmt: { type: mongoose.Schema.Types.ObjectId, ref: 'newsModel' },
    userCmt: { type:mongoose.Schema.Types.ObjectId, ref:'userModel' },
    likePersons: [{type:mongoose.Schema.Types.ObjectId, ref:'userModel'}]
})

const commentModel = mongoose.model('commentModel',commentSchema);

module.exports = {commentModel};