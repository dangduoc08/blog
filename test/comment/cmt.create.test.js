const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { NewsLogic } = require('../../upload/logic/news.logic')
const { newsModel } = require('../../upload/model/news.model')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')
const { CommentLogic } = require('../../upload/logic/comment.logic')
const { commentModel } = require('../../upload/model/comment.model')

describe('Test for router create comment', () => {
    let token, token2, idUser, idUser2, idNews, idNews2;
        beforeEach('Create user and news for cmt test', async () => { 
            // Tạo user 1
            await UserLogic.signUpUser('test@gmail.com', 'test', 'test');
            const signInUser = await UserLogic.signInUser('test', 'test');
            // Tạo user 2
            await UserLogic.signUpUser('test2@gmail.com', 'test2', 'test2');
            const signInUser2 = await UserLogic.signInUser('test2', 'test2');
            // Tạo 1 news theo user 1
            const createNews = await NewsLogic.createNews('test content', signInUser._id)
            // Tạo 1 news khác theo user 1
            const createNews2 = await NewsLogic.createNews('test content 2', signInUser._id)
            // User 1
            idUser = signInUser._id;
            token = signInUser.token;
            // User 2
            idUser2 = signInUser2._id;
            token2 = signInUser2.token;
            // News
            idNews = createNews._id;
            idNews2 = createNews2._id;
        })
        it('Router create comment send correct result', async () => {
            const response = await request(app).post(`/comment/create/${idNews}`).set({token:token2}).send({
                content: 'test comment'
            })
            // Kiểm tra trong response
            equal(response.body.success,true)
            equal(response.body.createCmt.content, 'test comment')
            // Kiểm tra trong comment database
            const cmtDb = await commentModel.findOne({}).populate('newsCmt').populate('userCmt');
            equal(cmtDb.newsCmt._id.toString(),idNews)
            equal(cmtDb.newsCmt.content,'test content')
            // Kiểm tra trong news database
            const newsDb = await newsModel.findOne({}).populate('comment')
            equal(newsDb.comment[0].content,'test comment')
            equal(newsDb.comment[0].newsCmt.toString(),cmtDb.newsCmt._id)
            // Kiểm tra trong user database
            const userDb = await userModel.findOne({_id:idUser2}).populate('comment')
            equal(userDb.comment[0].content, 'test comment')
            equal(userDb.comment[0].userCmt.toString(), cmtDb.userCmt._id)
        })

        it('Comment with many user', async () => {
            await request(app).post(`/comment/create/${idNews}`).set({ token }).send({
                content: 'test comment user 1'
            })
            await request(app).post(`/comment/create/${idNews}`).set({ token: token2 }).send({
                content: 'test comment user 2'
            })
            // Kiểm tra trong comment database
            const cmtDb = await commentModel.find({}).populate('newsCmt').populate('userCmt');
            equal(cmtDb[0].content, 'test comment user 1')
            equal(cmtDb[1].content, 'test comment user 2')
            // Kiểm tra trong news database
            const newsDb = await newsModel.find({})
            equal(newsDb[0].comment[0].toString(),cmtDb[0]._id)
            equal(newsDb[0].comment[1].toString(), cmtDb[1]._id)
        })

        it('A user can comment many mews', async () => {
            await request(app).post(`/comment/create/${idNews}`).set({ token: token2 }).send({
                content: 'test comment 1'
            })
            await request(app).post(`/comment/create/${idNews2}`).set({ token: token2 }).send({
                content: 'test comment 2'
            })
            // Kiểm tra trong comment database
            const cmtDb = await commentModel.find({}).populate('newsCmt').populate('userCmt');
            equal(cmtDb[0].content, 'test comment 1')
            equal(cmtDb[1].content, 'test comment 2')
            // Kiểm tra trong user database
            const userDb = await userModel.find({_id:idUser2})
            equal(userDb[0].comment[0].toString(), cmtDb[0]._id)
            equal(userDb[0].comment[1].toString(), cmtDb[1]._id)
        })

        it('Can not comment without token', async () => {
            const response = await request(app).post(`/comment/creat/${idNews}`).set({token:''}).send({
                content:'test comment'
            })
            // Kiểm tra trong token
            equal(response.body.success,false)
            equal(response.body.message,'INVALID_TOKEN')
            equal(response.status,400)
            // Kiểm tra trong comment database
            const cmtDb = await commentModel.findOne({}).populate('newsCmt').populate('userCmt');
            equal(cmtDb, null)
            // Kiểm tra trong news database
            const newsDb = await newsModel.findOne({}).populate('comment')
            equal(newsDb.comment[0], undefined)
            // Kiểm tra trong user database
            const userDb = await userModel.findOne({ _id: idUser2 }).populate('comment')
            equal(userDb.comment[0], undefined)
        })
        it('Can not comment without token', async () => {
            const response = await request(app).post(`/comment/creat/${idNews}`).set({token:''}).send({
                content:'test comment'
            })
            // Kiểm tra trong token
            equal(response.body.success,false)
            equal(response.body.message,'INVALID_TOKEN')
            equal(response.status,400)
            // Kiểm tra trong comment database
            const cmtDb = await commentModel.findOne({}).populate('newsCmt').populate('userCmt');
            equal(cmtDb, null)
            // Kiểm tra trong news database
            const newsDb = await newsModel.findOne({}).populate('comment')
            equal(newsDb.comment[0], undefined)
            // Kiểm tra trong user database
            const userDb = await userModel.findOne({ _id: idUser2 }).populate('comment')
            equal(userDb.comment[0], undefined)
        })

        it('Can not comment with invalid idNews', async () => {
            const response = await request(app).post(`/comment/create/${idNews} + xyz`).set({ token:token2 }).send({
                content: 'test comment'
            })
            // Kiểm tra trong token
            equal(response.body.success, false)
            equal(response.body.message, 'INVALID_ID')
            equal(response.status, 400)
            // Kiểm tra trong comment database
            const cmtDb = await commentModel.findOne({}).populate('newsCmt').populate('userCmt');
            equal(cmtDb, null)
            // Kiểm tra trong news database
            const newsDb = await newsModel.findOne({}).populate('comment')
            equal(newsDb.comment[0], undefined)
            // Kiểm tra trong user database
            const userDb = await userModel.findOne({ _id: idUser2 }).populate('comment')
            equal(userDb.comment[0], undefined)
        })
        it('Can not comment with empty content', async () => {
            const response = await request(app).post(`/comment/create/${idNews}`).set({ token: token2 }).send({
                content: ''
            })
            // Kiểm tra trong token
            equal(response.body.success, false)
            equal(response.body.message, 'COMMENT_MUST_BE_FILLED')
            equal(response.status, 400)
            // Kiểm tra trong comment database
            const cmtDb = await commentModel.findOne({}).populate('newsCmt').populate('userCmt');
            equal(cmtDb, null)
            // Kiểm tra trong news database
            const newsDb = await newsModel.findOne({}).populate('comment')
            equal(newsDb.comment[0], undefined)
            // Kiểm tra trong user database
            const userDb = await userModel.findOne({ _id: idUser2 }).populate('comment')
            equal(userDb.comment[0], undefined)
        })
        it('Can not comment with deleted news', async () => {
            await NewsLogic.deleteNews(idNews,idUser);
            const response = await request(app).post(`/comment/create/${idNews}`).set({ token }).send({
                content: 'test comment'
            })
            // Kiểm tra trong response
            equal(response.body.success, false)
            equal(response.body.message, 'CAN_NOT_COMMENT_THIS_COMMENT')
            equal(response.status, 404)
            // Kiểm tra trong comment database
            const cmtDb = await commentModel.findOne({}).populate('newsCmt').populate('userCmt');
            equal(cmtDb, null)
            // Kiểm tra trong news database
            const newsDb = await newsModel.findOne({_id:idNews}).populate('comment')
            equal(newsDb, null)
            // Kiểm tra trong user database
            const userDb = await userModel.findOne({ _id: idUser }).populate('comment')
            equal(userDb.comment[0], undefined)
        })
})