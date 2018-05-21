const mongoose = require('mongoose')
const {MyError} = require('../lib/myerror')


function checkObjectId (...ids) {
    try {
        ids.forEach(_id => new mongoose.Types.ObjectId (_id) )
    }
    catch (error) {
        throw new MyError ('INVALID_ID', 400)
    }
}

module.exports = {checkObjectId}