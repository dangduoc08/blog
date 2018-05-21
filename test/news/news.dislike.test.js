const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { NewsLogic } = require('../../upload/logic/news.logic')
const { newsModel } = require('../../upload/model/news.model')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')

describe('Test for dislike news', () => {
    let token, token2, idUser, idUser2, idNews;
    beforeEach('Signup and signin, like a news to test dislike', async () => {
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
        // Like 1 news theo user 1
        await NewsLogic.likeNews(idNews,idUser)
        //await NewsLogic.likeNews(idNews,idUser2)
    })
    it ('Dislike news send correct result', async () => {
        const response = await request(app).delete(`/news/dislike/${idNews}`).set({token});
        // Kiểm tra theo response
        equal(response.body.success, true);
        equal(response.body.dislikeNews.likePersons[0],undefined);
        // Kiểm tra trong News database
        const newsDb = await newsModel.findOne({}).populate('likePersons');
        equal(newsDb.likePersons[0], undefined)
        // Kiểm tra trong User database
        const userDb = await userModel.findOne({}).populate('likeNewses');
        equal(userDb.likeNewses[0], undefined);
    })

    it ('Can not dislike with wrong idNews', async() => {
        const response = await request(app).delete(`/news/dislike/${idNews}+xyz`).set({token});
        // Kiểm tra trong response 
        equal(response.body.success, false);
        equal(response.body.message, 'INVALID_ID')
        equal(response.status, 400)
        // Kiểm tra trong News database
        const newsDb = await newsModel.findOne({}).populate('likePersons');
        equal(newsDb.likePersons[0]._id.toString(), idUser)
        // Kiểm tra trong User database
        const userDb = await userModel.findOne({}).populate('likeNewses');
        equal(userDb.likeNewses[0]._id.toString(),idNews);
    })
    
    it ('Can not dislike without token', async () => {
        const response = await request(app).delete(`/news/dislike/${idNews}`).set({token:''});
        // Kiểm tra trong response 
        equal(response.body.success, false);
        equal(response.body.message, 'INVALID_TOKEN')
        equal(response.status, 400)
        // Kiểm tra trong News database
        const newsDb = await newsModel.findOne({}).populate('likePersons');
        equal(newsDb.likePersons[0]._id.toString(), idUser)
        // Kiểm tra trong User database
        const userDb = await userModel.findOne({}).populate('likeNewses');
        equal(userDb.likeNewses[0]._id.toString(), idNews);
    })

    it ('Can not dislike a news twice', async () => {
        await request(app).delete(`/news/dislike/${idNews}`).set({ token });
        const response = await request(app).delete(`/news/dislike/${idNews}`).set({token});
        //Kiểm tra trong response
        equal(response.body.success,false)
        equal(response.body.message,'CAN_NOT_DISLIKE_THIS_NEWS')
        equal(response.status, 404)
    })

    it ('Can not dislike a deleted news', async() => {
        await NewsLogic.deleteNews(idNews,idUser);
        const response = await request(app).delete(`/news/dislike/${idNews}`).set({ token });
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message,'CAN_NOT_DISLIKE_THIS_NEWS')
        equal(response.status, 404)
        // Kiểm tra trong News database
        const newsDb = await newsModel.find({_id:idNews});
        equal(newsDb[0],null);
        // Kiểm tra trong User database
        const userDb = await userModel.findOne({_id:idUser})
        equal(userDb.likeNewses[0],null)
    })

    it('Can not dislike with a news has not liked yet', async () => {
        const response = await request(app).delete(`/news/dislike/${idNews}`).set({ token:token2 });
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_DISLIKE_THIS_NEWS')
        equal(response.status,404)
    })
})