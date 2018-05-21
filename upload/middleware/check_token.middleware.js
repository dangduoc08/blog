const {verify} = require('../lib/jwt')
const {MyError } = require('../lib/myerror')

async function checkToken (req,res,next) {
    try {
        req.idUser = ( await verify(req.headers.token) )._id;
        next()
    }
    catch(error) {
        res.status(400).send({
        success: false,
        message: 'INVALID_TOKEN'
        })
    }
}

module.exports = { checkToken }