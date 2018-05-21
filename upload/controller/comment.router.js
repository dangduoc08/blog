const cmtRouter = require('express').Router();

const {CommentLogic} = require('../logic/comment.logic');
const {checkToken} = require('../middleware/check_token.middleware')
const {sendError} = require('../middleware/send_error.middleware')

cmtRouter.use(checkToken);
cmtRouter.use(sendError);

cmtRouter.post('/create/:_id', async (req,res) => {
    try {
        const createCmt = await CommentLogic.createCmt(req.body.content, req.params._id, req.idUser);
        res.send({
            success: true,
            createCmt
        })
    }
    catch (error) {
        res.onError(error)
    }
})

cmtRouter.delete('/delete/:_id', async (req,res) => {
    try{
        const deleteCmt = await CommentLogic.deleteCmt(req.params._id, req.idUser);
        res.send({
            success:true,
            deleteCmt
        })
    }
    catch(error) {
        res.onError(error)
    }
})

cmtRouter.put('/update/:_id', async (req,res) => {
    try{
        const updateCmt = await CommentLogic.updateCmt(req.body.content,req.params._id,req.idUser);
        res.send({
            success: true,
            updateCmt
        })
    }
    catch(error) {
        res.onError(error)
    }
})

cmtRouter.post('/like/:_id', async (req, res) => {
    try {
        const likeCmt = await CommentLogic.likeCmt(req.params._id,req.idUser)
        res.send({
            success: true,
            likeCmt
        })
    }
    catch (error) {
        res.onError(error)
    }
})

cmtRouter.delete('/dislike/:_id', async (req, res) => {
    try {
        const dislikeCmt = await CommentLogic.dislikeCmt(req.params._id, req.idUser)
        res.send({
            success: true,
            dislikeCmt
        })
    }
    catch (error) {
        res.onError(error)
    }
})

module.exports = {cmtRouter}