const friendRouter = require('express').Router();
const { checkToken } = require('../middleware/check_token.middleware')
const { sendError } = require('../middleware/send_error.middleware')

const {FriendLogic} =  require('../logic/friend.logic');

// Middleware
friendRouter.use(checkToken);
friendRouter.use(sendError)

friendRouter.post('/addfriend/:_id', async (req,res) => {
    try{
        const receiver = await FriendLogic.sendReqAddFriend(req.idUser,req.params._id);
        res.send({
            success:true,
            receiver
        })
    }
    catch(error) {
        res.onError(error)
    }
})

friendRouter.post('/acceptfr/:_id', async (req, res) => {
    try {
        const senderAccept = await FriendLogic.acceptFriend(req.params._id,req.idUser);
        res.send({
            success: true,
            senderAccept
        })
    }
    catch (error) {
        res.onError(error)
    }
})

friendRouter.delete('/declinefr/:_id', async (req, res) => {
    try {
        const senderDecline = await FriendLogic.declineFriend(req.params._id, req.idUser);
        res.send({
            success: true,
            senderDecline
        })
    }
    catch (error) {
        res.onError(error)
    }
})

friendRouter.delete('/removereqfr/:_id', async (req,res)=>{
    try {
        const removeReqFr = await FriendLogic.removeReqFriend(req.idUser,req.params._id)
        res.send({
            success:true,
            removeReqFr
        })
    }
    catch(error) {
        res.onError(error)
    }
})

friendRouter.delete('/removefr/:_id', async (req, res) => {
    try {
        const removeFr = await FriendLogic.removeFriend(req.idUser, req.params._id)
        res.send({
            success: true,
            removeFr
        })
    }
    catch (error) {
        res.onError(error)
    }
})

module.exports = {friendRouter}
