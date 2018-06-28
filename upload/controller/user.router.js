const userRouter = require('express').Router()

const { UserLogic } = require('../logic/user.logic')
const { checkToken } = require('../middleware/check_token.middleware')
const { sendError } = require('../middleware/send_error.middleware')

userRouter.use(sendError)

// Router signup
userRouter.post('/signup', async ( req, res ) => {
    const { email, username, plainPassword } = req.body;
    try {
        const signUpUser = await UserLogic.signUpUser(email, username, plainPassword);
        res.send ({
            success: true,
            signUpUser
        })
    }
    catch (error) {
        res.onError(error)
    }
})

//Router signin
userRouter.post('/signin', async ( req, res ) => {
    const { username, plainPassword } = req.body;
    try {
        const signInUser = await UserLogic.signInUser(username, plainPassword);
        res.send({
            success: true,
            signInUser
        })
    }
   catch (error) {
        res.onError(error)
   }
})

//Router check
userRouter.get('/check', checkToken, async (req, res) => {
    try {
        const checkUser = await UserLogic.checkUser(req.idUser);
        res.send ({
            success: true,
            token: checkUser
        })
    }
    catch (error) {
        res.onError(error)
    }
})

module.exports = {userRouter}