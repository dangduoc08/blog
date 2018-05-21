const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { NewsLogic } = require('../../upload/logic/news.logic')
const { newsModel } = require('../../upload/model/news.model')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')
const { CommentLogic } = require('../../upload/logic/comment.logic')
const { commentModel } = require('../../upload/model/comment.model')

describe('Test for router delete comment', () => {
    let token, token2, idUser, idUser2, idNews, idCmt;
    beforeEach('Create user and news for delete cmt test', async () => {
        // Tạo user 1
        await UserLogic.signUpUser('test@gmail.com', 'test', 'test');
        const signInUser = await UserLogic.signInUser('test', 'test');
        // Tạo user 2
        await UserLogic.signUpUser('test2@gmail.com', 'test2', 'test2');
        const signInUser2 = await UserLogic.signInUser('test2', 'test2');
        // Tạo 1 news theo user 1
        const createNews = await NewsLogic.createNews('test content', signInUser._id)
        // Comment 1 news theo user 1
        const createCmt = await CommentLogic.createCmt('test comment',createNews._id,signInUser._id)
        // User 1
        idUser = signInUser._id;
        token = signInUser.token;
        // User 2
        idUser2 = signInUser2._id;
        token2 = signInUser2.token;
        // News
        idNews = createNews._id;
        // Id comment
        idCmt = createCmt._id;
    })
    it('Delete cmt send correct result', async () => {
        const response = await request(app).delete(`/comment/delete/${idCmt}`).set({token});    
        equal(response.body.success, true);
        equal(response.body.deleteCmt.newsCmt,idNews)
        equal(response.body.deleteCmt.userCmt, idUser)
        // Kiểm tra trong comment data
        const cmtDb = await commentModel.findOne({});
        equal(cmtDb,null)
        // Kiểm tra trong news data
        const newsDb = await newsModel.findOne({}).populate('comment');
        equal(newsDb.comment[0],null);
        // Kiểm tra trong user data
        const userDb = await userModel.findOne({}).populate('comment');
        equal(userDb.comment[0],null);
    })

    it('Can not delete comment with ivalid idCmt', async () => {
        const response = await request(app).delete(`/comment/delete/${idCmt} + xyz`).set({ token });
        equal(response.body.success, false);
        equal(response.body.message, 'INVALID_ID')
        equal(response.status,400)
        // Kiểm tra trong comment data
        const cmtDb = await commentModel.findOne({});
        equal(cmtDb.content, 'test comment')
        // Kiểm tra trong news data
        const newsDb = await newsModel.findOne({}).populate('comment');
        equal(newsDb.comment[0].content, 'test comment');
        // Kiểm tra trong user data
        const userDb = await userModel.findOne({}).populate('comment');
        equal(userDb.comment[0].content, 'test comment');
    })
    it('Can not delete comment with empty token', async () => {
        const response = await request(app).delete(`/comment/delete/${idCmt}`).set({ token:'' });
        equal(response.body.success, false);
        equal(response.body.message, 'INVALID_TOKEN')
        equal(response.status, 400)
        // Kiểm tra trong comment data
        const cmtDb = await commentModel.findOne({});
        equal(cmtDb.content, 'test comment')
        // Kiểm tra trong news data
        const newsDb = await newsModel.findOne({}).populate('comment');
        equal(newsDb.comment[0].content, 'test comment');
        // Kiểm tra trong user data
        const userDb = await userModel.findOne({}).populate('comment');
        equal(userDb.comment[0].content, 'test comment');
    })
    it('Can not delete comment with not owner comment', async () => {
        const response = await request(app).delete(`/comment/delete/${idCmt}`).set({ token: token2 });
        equal(response.body.success, false);
        equal(response.body.message, 'CAN_NOT_DELETE_THIS_COMMENT')
        equal(response.status, 400)
        // Kiểm tra trong comment data
        const cmtDb = await commentModel.findOne({});
        equal(cmtDb.content, 'test comment')
        // Kiểm tra trong news data
        const newsDb = await newsModel.findOne({}).populate('comment');
        equal(newsDb.comment[0].content, 'test comment');
        // Kiểm tra trong user data
        const userDb = await userModel.findOne({}).populate('comment');
        equal(userDb.comment[0].content, 'test comment');
    })
    it('Can not delete deleted comment', async () => {
        await request(app).delete(`/comment/delete/${idCmt}`).set({ token });
        const response = await request(app).delete(`/comment/delete/${idCmt}`).set({ token });
        equal(response.body.success, false);
        equal(response.body.message, 'CAN_NOT_DELETE_THIS_COMMENT')
        equal(response.status, 400)
        // Kiểm tra trong comment data
        const cmtDb = await commentModel.findOne({});
        equal(cmtDb, null)
        // Kiểm tra trong news data
        const newsDb = await newsModel.findOne({}).populate('comment');
        equal(newsDb.comment[0], null);
        // Kiểm tra trong user data
        const userDb = await userModel.findOne({}).populate('comment');
        equal(userDb.comment[0], null);
    })
    it('Can not delete comment with deleted news', async () => {
        await NewsLogic.deleteNews(idNews,idUser);
        const response = await request(app).delete(`/comment/delete/${idCmt}`).set({ token });
        equal(response.body.success, false);
        equal(response.body.message, 'CAN_NOT_DELETE_THIS_COMMENT')
        equal(response.status, 400)
        // Kiểm tra trong comment data
        const cmtDb = await commentModel.findOne({});
        equal(cmtDb, null)
        // Kiểm tra trong user data, comment phải bị xóa khi delete news của comment đó
        const userDb = await userModel.findOne({_id:idUser}).populate('comment');
        equal(userDb.comment[0],undefined)
    })
})