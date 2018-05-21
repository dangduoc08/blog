const mongoose = require('mongoose')

const userSchema = new mongoose.Schema ({
    email: {type: String, unique: true, trim: true},
    username: {type: String, unique: true, trim: true},
    password: {type: String, trim: true},
    news: [{ type: mongoose.Schema.Types.ObjectId, ref:'newsModel' }],
    likeNewses: [{ type: mongoose.Schema.Types.ObjectId, ref:'newsModel' }],
    comment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'commentModel' }],
    likeCmts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'commentModel' }],
    friends: [{type:mongoose.Schema.Types.ObjectId, ref:'userModel'}],
    sendRequest: [{type:mongoose.Schema.Types.ObjectId, ref:'userModel'}],
    receiveRequest: [{type:mongoose.Schema.Types.ObjectId, ref:'userModel'}]
})

const userModel = mongoose.model('userModel',userSchema);

module.exports = {userModel}