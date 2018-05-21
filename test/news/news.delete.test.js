const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { NewsLogic } = require('../../upload/logic/news.logic')
const { newsModel } = require('../../upload/model/news.model')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')

describe('Test for delete news', () => {
    let token, token2, idUser, idNews;
    beforeEach('Signup and signin a user to delete news', async () => {
        // Tạo user 1
        await UserLogic.signUpUser('test@gmail.com', 'test', 'test');
        const signInUser = await UserLogic.signInUser('test', 'test');
        // Tạo user 2
        await UserLogic.signUpUser('test2@gmail.com', 'test2', 'test2');
        const signInUser2 = await UserLogic.signInUser('test2', 'test2');
        // Tạo 1 news theo user 1
        const createNews = await NewsLogic.createNews('test content', signInUser._id)
        // User 1
        idUser = signInUser._id;
        token = signInUser.token;
        // User 2
        token2 = signInUser2.token;
        // News
        idNews = createNews._id;
    })
    it ('Router delete news send correct result', async () => {
        const response = await request(app).delete(`/news/delete/${idNews}`).set({token});
        // Kiểm tra trong response
        equal(response.body.success, true)
        equal(response.body.deleteNews.content, 'test content')
        equal(response.body.deleteNews.author, idUser)
        // Kiểm tra trong database news
        const newsDb = await newsModel.findOne({}).populate('author');
        equal (newsDb, null)
        //Kiểm tra trong database user
        const userDb = await userModel.findOne({}).populate('news');
        equal(userDb.news[0], undefined)
    })
    it ('Can not delete news with another token', async () => {
        const response = await request(app).delete(`/news/delete/${idNews}`).set({ token: token2 });
        // Kiểm tra trong response
        equal(response.status, 404)
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_DELETE_THIS_NEWS')
        // Kiểm tra trong database news
        const newsDb = await newsModel.findOne({}).populate('author');
        equal(newsDb.content, 'test content')
        equal(newsDb.author._id.toString(), idUser)
        // //Kiểm tra trong database user
        const userDb = await userModel.findOne({}).populate('news');
        equal(userDb.news[0]._id.toString(), idNews)
        equal(userDb.news[0].content, 'test content')
    })

    it('Can not delete news with empty token', async () => {
        const response = await request(app).delete(`/news/delete/${idNews}`).set({ token: '' });
        // Kiểm tra trong response
        equal(response.status, 400)
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_TOKEN')
        // Kiểm tra trong database news
        const newsDb = await newsModel.findOne({}).populate('author');
        equal(newsDb.content, 'test content')
        equal(newsDb.author._id.toString(), idUser)
        // //Kiểm tra trong database user
        const userDb = await userModel.findOne({}).populate('news');
        equal(userDb.news[0]._id.toString(), idNews)
        equal(userDb.news[0].content, 'test content')
    })

    it('Can not delete news with wrong idNews', async () => {
        const response = await request(app).delete(`/news/delete/${idNews} + 123`).set({ token });
        // Kiểm tra trong response
        equal(response.status, 400)
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_ID')
        // Kiểm tra trong database news
        const newsDb = await newsModel.findOne({}).populate('author');
        equal(newsDb.content, 'test content')
        equal(newsDb.author._id.toString(), idUser)
        // //Kiểm tra trong database user
        const userDb = await userModel.findOne({}).populate('news');
        equal(userDb.news[0]._id.toString(), idNews)
        equal(userDb.news[0].content, 'test content')
    })

    it('Can not delete deleted news', async () => {
        await request(app).delete(`/news/delete/${idNews}`).set({ token });
        const response = await request(app).delete(`/news/delete/${idNews}`).set({ token });
        // Kiểm tra trong response
        equal(response.status, 404)
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_DELETE_THIS_NEWS')
        // Kiểm tra trong database news
        const newsDb = await newsModel.findOne({}).populate('author');
        equal(newsDb, null)
        // //Kiểm tra trong database user
        const userDb = await userModel.findOne({}).populate('news');
        equal(userDb.news[0], undefined)
    })
}) 