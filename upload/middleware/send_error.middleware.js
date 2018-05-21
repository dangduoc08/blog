const {MyError} = require('../lib/myerror')

function sendError (req,res,next) {
    res.onError = function (error) {
        res.status(error.statusCode || 500).send({
            success: false,
            message: error.message
        })
    }
    next()
}

module.exports = {sendError}