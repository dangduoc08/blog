const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { NewsLogic } = require('../../upload/logic/news.logic')
const { newsModel } = require('../../upload/model/news.model')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')

describe('Test for create new news', () => {
    let token, idUser;
    beforeEach('Signup and signin a user to create news', async () => {
        await UserLogic.signUpUser ('test@gmail.com','test','test');
        const signInUser = await UserLogic.signInUser('test', 'test');
        token = signInUser.token;
        idUser = signInUser._id;
    })
    it('Router create news send correct result', async() => {
        const response = await request(app).post('/news/create').set ({ token }).send ({
            content: 'test content'
        })
        // Kiểm tra trong response
        equal (response.body.success, true)
        equal (response.body.createNews.content,'test content')
        equal (response.body.createNews.author, idUser)
        // Kiểm tra trong database của news
        const newsDb = await newsModel.findOne({}).populate('author')
        equal (newsDb.content, 'test content');
        equal(newsDb.author._id, response.body.createNews.author);
        // Kiểm tra trong database của user
        const userDb = await userModel.findOne({}).populate('news');
        equal(userDb._id, response.body.createNews.author)
        equal(userDb.news[0]._id, response.body.createNews._id)
        equal(userDb.news[0].content, 'test content')
    })

    it ('Can not create news without token', async () => {
        const response = await request(app).post('/news/create').send({
            content: 'test content'
        })
        equal (response.body.success, false)
        equal(response.body.message, 'INVALID_TOKEN')
        // Kiểm tra trong database news
        const newsDb = await newsModel.findOne({}).populate('author');
        equal (newsDb, null)
        // Kiểm tra trong database của user
        const userDb = await userModel.findOne({}).populate('news');
        equal(userDb.news[0], undefined)
    })

    it ('Can not create news without content', async () => {
        const response = await request(app).post('/news/create').set({ token }).send({
            content: ''
        })
        equal (response.body.success, false)
        equal (response.body.message, 'CONTENT_MUST_BE_FILLED')
        // Kiểm tra trong database news
        const newsDb = await newsModel.findOne({}).populate('author');
        equal(newsDb, null)
        // Kiểm tra trong database của user
        const userDb = await userModel.findOne({}).populate('news');
        equal(userDb.news[0], undefined)
    })
})