const newsRouter = require ('express').Router();

const { NewsLogic } = require('../logic/news.logic');
const { checkToken } = require('../middleware/check_token.middleware')
const { sendError } = require('../middleware/send_error.middleware')

newsRouter.get('/all', async (req,res) => {
    const newsAll = await NewsLogic.newsAll();
    res.send ({
        success: true,
        newsAll
    })
})

newsRouter.use(checkToken);
newsRouter.use(sendError);

newsRouter.post('/create', async (req,res) => {
    try {
        const createNews = await NewsLogic.createNews (req.body.content, req.idUser);
        res.send ({
            success: true,
            createNews
        })
    }
    catch (error) {
        res.onError(error)
    }
})

newsRouter.put('/update/:_id', async (req, res) => {
    try {
        const updateNews = await NewsLogic.updateNews(req.body.content, req.params._id , req.idUser);
        res.send({
            success: true,
            updateNews
        })
    }
    catch (error) {
        res.onError(error)
    }
})

newsRouter.delete(`/delete/:_id`, async (req,res) => {
    try {
        const deleteNews = await NewsLogic.deleteNews(req.params._id, req.idUser);
        res.send ({
            success: true,
            deleteNews
        })
    }
    catch(error) {
        res.onError(error)
    }
})

newsRouter.post('/like/:_id', async (req,res) => {
    try {
        const likeNews = await NewsLogic.likeNews(req.params._id, req.idUser)
        res.send({
            success: true,
            likeNews
        })
    }   
    catch(error) {
        res.onError(error)
    }
})

newsRouter.delete('/dislike/:_id', async (req,res) => {
    try {
        const dislikeNews = await NewsLogic.dislikeNews(req.params._id, req.idUser);
        res.send({
            success: true,
            dislikeNews
        })
    }
    catch(error) {
        res.onError(error)
    }
})

module.exports = {newsRouter}