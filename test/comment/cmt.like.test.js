const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { NewsLogic } = require('../../upload/logic/news.logic')
const { newsModel } = require('../../upload/model/news.model')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')
const { CommentLogic } = require('../../upload/logic/comment.logic')
const { commentModel } = require('../../upload/model/comment.model')

describe('Test for router like comment', () => {
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
    it('Like comment send correct result', async () => {
        const response = await request(app).post(`/comment/like/${idCmt}`).set({token});
        equal(response.body.success, true);
        equal(response.body.likeCmt.likePersons[0],idUser)
        // Kiểm tra trong cmt db
        const cmtDb = await commentModel.findOne({}).populate('likePersons');
        equal(cmtDb.likePersons[0]._id.toString(),idUser)
        equal(cmtDb.likePersons[0].likeCmts[0].toString(), idCmt)
        // Kiểm tra trong user db
        const userDb =  await userModel.findOne({}).populate('likeCmts')
        equal(userDb.likeCmts[0]._id.toString(), idCmt)
        equal(userDb.likeCmts[0].likePersons.toString(), idUser)
    })
    it('Can like comment with another user', async () => {
        await request(app).post(`/comment/like/${idCmt}`).set({ token });
        // Dùng user 2 để like cmt của user 1
        const response = await request(app).post(`/comment/like/${idCmt}`).set({ token:token2 });
        equal(response.body.success, true);
        equal(response.body.likeCmt.likePersons[1], idUser2)
        // Kiểm tra trong cmt db
        const cmtDb = await commentModel.findOne({}).populate('likePersons')
        equal(cmtDb.likePersons[1]._id.toString(), idUser2)
        // // Kiểm tra trong user db
        const userDb = await userModel.findById(idUser2).populate('likeCmts');
        equal(userDb.likeCmts[0]._id.toString(),idCmt)
    })
    it('One user can like many cmt', async () => {
        await request(app).post(`/comment/like/${idCmt}`).set({ token:token2 });
        const response = await request(app).post(`/comment/like/${idCmt2}`).set({ token: token2 });
        equal(response.body.success, true);
        equal(response.body.likeCmt.likePersons[0], idUser2)
        // Kiểm tra trong cmt db
        const cmtDb = await commentModel.findOne({}).populate('likePersons');
        equal(cmtDb.likePersons[0]._id.toString(), idUser2)
        // Kiểm tra trong user db
        const userDb = await userModel.findById(idUser2);
        equal(userDb.likeCmts[1].toString(), idCmt2)
    })
    it('Can not like cmt with ivalid idCmt', async () => {
        const response = await request(app).post(`/comment/like/${idCmt2} + xyz`).set({ token });
        equal(response.body.success, false);
        equal(response.body.message, 'INVALID_ID');
        equal(response.status, 400)
        // Kiểm tra trong cmt db
        const cmtDb = await commentModel.findOne({}).populate('likePersons');
        equal(cmtDb.likePersons[0], null)
        // Kiểm tra trong user db
        const userDb = await userModel.findById(idUser2);
        equal(userDb.likeCmts[0], null)
    })
    it('Can not like cmt with ivalid user', async () => {
        const response = await request(app).post(`/comment/like/${idCmt2}`).set({ token:'' });
        equal(response.body.success, false);
        equal(response.body.message, 'INVALID_TOKEN');
        equal(response.status, 400)
        // Kiểm tra trong cmt db
        const cmtDb = await commentModel.findOne({}).populate('likePersons');
        equal(cmtDb.likePersons[0], null)
        // Kiểm tra trong user db
        const userDb = await userModel.findById(idUser2);
        equal(userDb.likeCmts[0], null)
    })
    it('Can not like cmt with deleted cmt', async () => {
        await CommentLogic.deleteCmt(idCmt2,idUser);
        const response = await request(app).post(`/comment/like/${idCmt2}`).set({ token });
        equal(response.body.success, false);
        equal(response.body.message, 'CAN_NOT_LIKE_THIS_COMMENT');
        equal(response.status, 400)
        // Kiểm tra trong cmt db
        const cmtDb = await commentModel.findById(idCmt2).populate('likePersons');
        equal(cmtDb, null)
        // Kiểm tra trong user db
        const userDb = await userModel.findById(idUser2);
        equal(userDb.likeCmts[0], null)
    })
    it('Can not like cmt with deleted news', async () => {
        await NewsLogic.deleteNews(idNews,idUser)
        const response = await request(app).post(`/comment/like/${idCmt}`).set({ token });
        equal(response.body.success, false);
        equal(response.body.message, 'CAN_NOT_LIKE_THIS_COMMENT');
        equal(response.status, 400)
        // Kiểm tra trong cmt db
        const cmtDb = await commentModel.findById(idCmt2).populate('likePersons');
        equal(cmtDb, null)
        // Kiểm tra trong user db
        const userDb = await userModel.findById(idUser2);
        equal(userDb.likeCmts[0], null)
    })
    it('Can not like cmt twice', async () => {
        await request(app).post(`/comment/like/${idCmt}`).set({ token });
        const response = await request(app).post(`/comment/like/${idCmt}`).set({ token });
        equal(response.body.success, false);
        equal(response.body.message, 'CAN_NOT_LIKE_THIS_COMMENT');
        equal(response.status, 400)
        // Kiểm tra trong cmt db
        const cmtDb = await commentModel.findOne({}).populate('likePersons')
        equal(cmtDb.likePersons[0]._id.toString(), idUser)
        // Kiểm tra trong user db
        const userDb = await userModel.findById(idUser).populate('likeCmts');
        equal(userDb.likeCmts[0]._id.toString(), idCmt)
    })
})