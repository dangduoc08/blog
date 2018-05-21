const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { NewsLogic } = require('../../upload/logic/news.logic')
const { newsModel } = require('../../upload/model/news.model')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')
const { CommentLogic } = require('../../upload/logic/comment.logic')
const { commentModel } = require('../../upload/model/comment.model')

describe('Test for router update comment', () => {
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
        const createCmt = await CommentLogic.createCmt('test comment', createNews._id, signInUser._id)
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
    it('Update comment send correct result', async() => {
        const response = await request(app).put(`/comment/update/${idCmt}`).set({token}).send({
           content:'test comment update'
        });
        // Kiểm tra trong response
        equal(response.body.success,true)
        equal(response.body.updateCmt.content,'test comment update')
        //Kiểm tra trong cmt database
        const cmtDb = await commentModel.findOne({})
        equal(cmtDb.content,'test comment update')
    })
    it ('Can not update comment with ivalid idCmd', async () => {
        const response = await request(app).put(`/comment/update/${idCmt} + xyz`).set({ token }).send({
            content: 'test comment update'
        });
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_ID')
        equal(response.status, 400)
        //Kiểm tra trong cmt database
        const cmtDb = await commentModel.findOne({})
        equal(cmtDb.content, 'test comment');
    })
    it('Can not update comment with ivalid token', async () => {
        const response = await request(app).put(`/comment/update/${idCmt}`).set({ token:'' }).send({
            content: 'test comment update'
        });
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_TOKEN')
        equal(response.status, 400)
        //Kiểm tra trong cmt database
        const cmtDb = await commentModel.findOne({})
        equal(cmtDb.content, 'test comment');
    })
    it('Can not update comment with empty content', async () => {
        const response = await request(app).put(`/comment/update/${idCmt}`).set({ token }).send({
            content: ''
        });
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'UPDATE_CONTENT_MUST_BE_FILLED')
        equal(response.status, 400)
        //Kiểm tra trong cmt database
        const cmtDb = await commentModel.findOne({})
        equal(cmtDb.content, 'test comment');
    })
    it('Can not update comment with not own user', async () => {
        const response = await request(app).put(`/comment/update/${idCmt}`).set({ token:token2 }).send({
            content: 'test comment'
        });
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_UPDATE_THIS_COMMENT')
        equal(response.status, 400)
        //Kiểm tra trong cmt database
        const cmtDb = await commentModel.findOne({})
        equal(cmtDb.content, 'test comment');
    })
    it('Can not update deleted comment', async () => {
        await CommentLogic.deleteCmt(idCmt,idUser);
        const response = await request(app).put(`/comment/update/${idCmt}`).set({ token }).send({
            content: 'test comment'
        });
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_UPDATE_THIS_COMMENT')
        equal(response.status, 400)
        //Kiểm tra trong cmt database
        const cmtDb = await commentModel.findOne({})
        equal(cmtDb, null);
    })
    it('Can not update deleted news', async () => {
        await NewsLogic.deleteNews(idNews,idUser)
        const response = await request(app).put(`/comment/update/${idCmt}`).set({ token }).send({
            content: 'test comment'
        });
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_UPDATE_THIS_COMMENT')
        equal(response.status, 400)
        //Kiểm tra trong cmt database
        const cmtDb = await commentModel.findOne({})
        equal(cmtDb, null);
    })
})