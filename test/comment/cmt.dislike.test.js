const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { NewsLogic } = require('../../upload/logic/news.logic')
const { newsModel } = require('../../upload/model/news.model')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')
const { CommentLogic } = require('../../upload/logic/comment.logic')
const { commentModel } = require('../../upload/model/comment.model')

describe('Test for router dislike comment', () => {
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
        const createCmt = await CommentLogic.createCmt('test comment', createNews._id, signInUser._id);
        const createCmt2 = await CommentLogic.createCmt('test comment 2', createNews._id, signInUser._id);
        // Like 1 cmt theo user 1
        await CommentLogic.likeCmt(createCmt._id,signInUser._id);
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
        idCmt2 = createCmt2._id;
    })
    it('Dislike cmt send correct result', async () => {
        const response = await request(app).delete(`/comment/dislike/${idCmt}`).set({token});
        equal(response.body.success, true)
        equal(response.body.dislikeCmt.likePersons[0],null);
        // Kiểm tra trong database cmt
        const cmtDb = await commentModel.findById(idCmt);
        equal(cmtDb.likePersons[0],null)
        // Kiểm tra trong database user
        const userDb = await userModel.findById(idUser);
        equal(userDb.likeCmts[0], null)
    })
    it('Can not dislike cmt with invalid idCmt', async () => {
        const response = await request(app).delete(`/comment/dislike/${idCmt} + xyz`).set({ token });
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_ID');
        equal(response.status,400)
        // Kiểm tra trong database cmt
        const cmtDb = await commentModel.findById(idCmt).populate('likePersons');
        equal(cmtDb.likePersons[0]._id.toString(), idUser)
        // Kiểm tra trong database user
        const userDb = await userModel.findById(idUser).populate('likeCmts');
        equal(userDb.likeCmts[0]._id.toString(), idCmt)
    })
    it('Can not dislike cmt with empty token', async () => {
        const response = await request(app).delete(`/comment/dislike/${idCmt}`).set({ token:'' });
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_TOKEN');
        equal(response.status, 400)
        // Kiểm tra trong database cmt
        const cmtDb = await commentModel.findById(idCmt).populate('likePersons');
        equal(cmtDb.likePersons[0]._id.toString(), idUser)
        // Kiểm tra trong database user
        const userDb = await userModel.findById(idUser).populate('likeCmts');
        equal(userDb.likeCmts[0]._id.toString(), idCmt)
    })
    it('Can not dislike cmt with wrong user', async () => {
        const response = await request(app).delete(`/comment/dislike/${idCmt}`).set({ token: token2 });
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_DISLIKE_THIS_COMMENT');
        equal(response.status, 400)
        // Kiểm tra trong database cmt
        const cmtDb = await commentModel.findById(idCmt).populate('likePersons');
        equal(cmtDb.likePersons[0]._id.toString(), idUser)
        // Kiểm tra trong database user
        const userDb = await userModel.findById(idUser).populate('likeCmts');
        equal(userDb.likeCmts[0]._id.toString(), idCmt)
    })
    it('Can not dislike cmt with deleted news', async () => {
        await NewsLogic.deleteNews(idNews,idUser);
        const response = await request(app).delete(`/comment/dislike/${idCmt}`).set({ token });
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_DISLIKE_THIS_COMMENT');
        equal(response.status, 400)
        // Kiểm tra trong database cmt
        const cmtDb = await commentModel.findById(idCmt);
        equal(cmtDb, null)
        // Kiểm tra trong database user
        const userDb = await userModel.findById(idUser);
        equal(userDb.likeCmts[0], null)
    })
    it('Can not dislike cmt with deleted cmt', async () => {
        await CommentLogic.deleteCmt(idCmt,idUser)
        const response = await request(app).delete(`/comment/dislike/${idCmt}`).set({ token });
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_DISLIKE_THIS_COMMENT');
        equal(response.status, 400)
        // Kiểm tra trong database cmt
        const cmtDb = await commentModel.findById(idCmt);
        equal(cmtDb, null)
        // Kiểm tra trong database user
        const userDb = await userModel.findById(idUser);
        equal(userDb.likeCmts[0], null)
    })
})