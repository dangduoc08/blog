const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema ({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref:'userModel' },
    likePersons: [{ type: mongoose.Schema.Types.ObjectId, ref:'userModel'}],
    comment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'commentModel' }]
})

const newsModel = mongoose.model ('newsModel', newsSchema);

module.exports = { newsModel }