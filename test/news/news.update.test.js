const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { NewsLogic } = require('../../upload/logic/news.logic')
const { newsModel } = require('../../upload/model/news.model')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')

describe('Test for update news', () => {
    let token, token2, idUser, idNews;
    beforeEach('Signup and signin a user to update news', async () => {
        // Tạo user 1
        await UserLogic.signUpUser('test@gmail.com', 'test', 'test');
        const signInUser = await UserLogic.signInUser('test', 'test');
        // Tạo user 2
        await UserLogic.signUpUser('test2@gmail.com', 'test2', 'test2');
        const signInUser2 = await UserLogic.signInUser('test2', 'test2');
        // Tạo 1 news theo user 1
        const createNews = await NewsLogic.createNews ('test content', signInUser._id)
        // User 1
        idUser = signInUser._id;
        token = signInUser.token;
        // User 2
        token2 = signInUser2.token;
        // News
        idNews = createNews._id;
           
    })

    it ('Update news send correct result', async () => {
        const response = await request(app).put(`/news/update/${idNews}`).set({ token }).send ({
            content: 'new test content'
        })
        equal (response.body.success, true)
        equal (response.body.updateNews.content, 'new test content')
        equal (response.body.updateNews.author, idUser)
        // Kiểm tra trong database news
        const newsDb = await newsModel.findOne({}).populate('author');
        equal (newsDb.content, 'new test content')
        equal ( newsDb.author._id, response.body.updateNews.author )
        // Kiểm tra trong database user
        const userDb = await userModel.findOne({}).populate('news');
        equal (userDb.news[0]._id, response.body.updateNews._id)
        equal(userDb.news[0].content, response.body.updateNews.content)
    })

    it ('Can not update news with not right token', async () => {
        const response = await request(app).put(`/news/update/${idNews}`).set({ token: token2 }).send({
            content: 'new test content',
        })
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_ NOT_UPDATE_THIS_NEWS')
        equal(response.status, 404)
        // Kiểm tra trong database news
        const newsDb = await newsModel.findOne({}).populate('author');
        equal(newsDb.content, 'test content')
        equal(newsDb.author._id.toString(), idUser)
        //Kiểm tra trong database user
        const userDb = await userModel.findOne({}).populate('news');
        equal(userDb.news[0]._id.toString(), idNews)
        equal(userDb.news[0].content, 'test content')
    })

    it('Can not update news with empty token', async () => {
        const response = await request(app).put(`/news/update/${idNews}`).set({ token:'' }).send({
            content: 'new test content',
        })
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_TOKEN')
        equal(response.status, 400)
        // Kiểm tra trong database news
        const newsDb = await newsModel.findOne({}).populate('author');
        equal(newsDb.content, 'test content')
        equal(newsDb.author._id.toString(), idUser)
        //Kiểm tra trong database user
        const userDb = await userModel.findOne({}).populate('news');
        equal(userDb.news[0]._id.toString(), idNews)
        equal(userDb.news[0].content, 'test content')
    })

    it('Can not update news with empty content', async () => {
        const response = await request(app).put(`/news/update/${idNews}`).set({ token: token }).send({
            content: '',
        })
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'CONTENT_MUST_BE_FILLED')
        equal(response.status, 400)
        // Kiểm tra trong database news
        const newsDb = await newsModel.findOne({}).populate('author');
        equal(newsDb.content, 'test content')
        equal(newsDb.author._id.toString(), idUser)
        //Kiểm tra trong database user
        const userDb = await userModel.findOne({}).populate('news');
        equal(userDb.news[0]._id.toString(), idNews)
        equal(userDb.news[0].content, 'test content')
    })

    it ('Can not update news with wrong id news', async () => {
        const response = await request(app).put(`/news/update/${idNews} + xyz`).set({token}).send ({
            content: 'new test content'
        })
        // Kiểm tra trong response
        equal (response.status, 400)
        equal (response.body.success, false)
        equal (response.body.message, 'INVALID_ID')
        // Kiểm tra trong database news
        const newsDb = await newsModel.findOne({}).populate('author');
        equal(newsDb.content, 'test content')
        equal(newsDb.author._id.toString(), idUser)
        //Kiểm tra trong database user
        const userDb = await userModel.findOne({}).populate('news');
        equal(userDb.news[0]._id.toString(), idNews)
        equal(userDb.news[0].content, 'test content')
    })

    it ('Can not update deleted news', async () => {
        // Xòa news để test
        await NewsLogic.deleteNews(idNews,idUser);
        const response = await request(app).put(`/news/update/${idNews}`).set({ token }).send({
            content: 'new test content'
        })
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_ NOT_UPDATE_THIS_NEWS')
        equal(response.status, 404)
        // Kiểm tra trong database news
        const newsDb = await newsModel.findOne({}).populate('author');
        equal(newsDb, null)
        //Kiểm tra trong database user
        const userDb = await userModel.findOne({}).populate('news');
        equal(userDb.news[0], undefined)
    })
})