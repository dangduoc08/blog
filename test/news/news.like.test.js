const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { NewsLogic } = require('../../upload/logic/news.logic')
const { newsModel } = require('../../upload/model/news.model')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')

describe('Test for like news', () => {
    let token, token2, idUser, idUser2, idNews;
    beforeEach('Signup and signin a user to test like news', async () => {
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
        idUser2 = signInUser2._id;
        token2 = signInUser2.token;
        // News
        idNews = createNews._id;
    })

    it('Like news send correct result', async () => {
        const response = await request(app).post(`/news/like/${idNews}`).set({token});
        // kiểm tra trong response
        equal(response.body.success, true)
        equal(response.body.likeNews.content, 'test content')
        equal(response.body.likeNews.likePersons[0], idUser)
        //Kiểm tra trong database của news
        const newsDb = await newsModel.findOne({}).populate('likePersons');
        equal(newsDb.likePersons[0]._id.toString(), idUser)
        //Kiểm tra trong database của user
        const userDb = await userModel.findOne({}).populate('likeNews');
        equal(userDb.likeNewses[0].toString(), idNews)
    })

    it('Like news send correct result with another user', async () => {
        await request(app).post(`/news/like/${idNews}`).set({ token });
        const response = await request(app).post(`/news/like/${idNews}`).set({ token:token2 });
        // kiểm tra trong response
        equal(response.body.success, true)
        equal(response.body.likeNews.content, 'test content')
        equal(response.body.likeNews.likePersons[1], idUser2)
        //Kiểm tra trong database của news
        const newsDb = await newsModel.findOne({}).populate('likePersons');
        equal(newsDb.likePersons[1]._id.toString(), idUser2)
        //Kiểm tra trong database của user
        const userDb = await userModel.find({}).populate('likeNews');
        equal(userDb[1].likeNewses[0].toString(), idNews)
    })

    it('Can not like news without token', async() => {
        const response = await request(app).post(`/news/like/${idNews}`).set({ token: ''});
        // kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_TOKEN')
        //Kiểm tra trong database của news
        const newsDb = await newsModel.findOne({}).populate('likePersons');
        equal(newsDb.likePersons[0], null)
        //Kiểm tra trong database của user
        const userDb = await userModel.find({}).populate('likeNews');
        equal(userDb[0].likeNewses[0], undefined)
    })

    it('Can not like news with wrong idNews', async () => {
        const response = await request(app).post(`/news/like/${idNews} + xyz`).set({ token: token2 });
        // kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_ID')
        //Kiểm tra trong database của news
        const newsDb = await newsModel.findOne({}).populate('likePersons');
        equal(newsDb.likePersons[0], null)
        //Kiểm tra trong database của user
        const userDb = await userModel.find({}).populate('likeNews');
        equal(userDb[0].likeNewses[0], undefined)
    })

    it('A user can not like news twice', async () => {
        await request(app).post(`/news/like/${idNews}`).set({ token });
        const response = await request(app).post(`/news/like/${idNews}`).set({ token });
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_LIKE_THIS_NEWS')
        // Kiểm tra trong database của news
        const newsDb = await newsModel.findOne({}).populate('likePersons');
        equal(newsDb.likePersons.length, 1)
        // Kiểm tra trong database của user
        const userDb = await userModel.findOne({}).populate('likeNewses');
        equal(userDb.likeNewses.length, 1)
    })

    it ('Can not like a deleted news', async () => {
        await NewsLogic.deleteNews(idNews,idUser);
        const response = await request(app).post(`/news/like/${idNews}`).set({token:token2});
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_LIKE_THIS_NEWS')
        // Kiểm tra trong database của user
        const userDb = await userModel.findOne({}).populate('likeNewses');
        equal(userDb.likeNewses[0], undefined)
    })
})