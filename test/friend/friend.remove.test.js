const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')
const { FriendLogic } = require('../../upload/logic/friend.logic')

describe('Test router decline friend', async () => {
    let idUser, idFriend, token, token2, idNotSendReq;
    beforeEach('Create 2 users for test add friend', async () => {
        await UserLogic.signUpUser('user1@gmail.com', 'user1', '1234')
        await UserLogic.signUpUser('user2@gmail.com', 'user2', '1234')
        await UserLogic.signUpUser('user3@gmail.com', 'user3', '1234')
        // Signin
        const user1 = await UserLogic.signInUser('user1', '1234');
        const user2 = await UserLogic.signInUser('user2', '1234');
        const user3 = await UserLogic.signInUser('user3', '1234');
        idUser = user1._id;
        idFriend = user2._id;
        token = user1.token;
        token2 = user2.token;
        idNotSendReq = user3._id;
        // Gửi lời mời kết bạn
        await FriendLogic.sendReqAddFriend(idUser, idFriend);
        // Chấp nhận kết bạn
        await FriendLogic.acceptFriend(idUser, idFriend)
    })
    it('Remove friend send correct result', async () => {
        const response = await request(app).delete(`/friend/removefr/${idFriend}`).set({token});
        equal(response.body.success,true)
        equal(response.body.removeFr._id, idFriend)
        equal(response.body.removeFr.friends[0],null)
        // Kiểm tra db theo user
        const userDb = await userModel.findById(idUser).populate('friends');
        equal(userDb.friends[0], null)
        // Kiểm tra db theo friend
        const friendDb = await userModel.findById(idUser).populate('friends');
        equal(friendDb.friends[0], null)
    })
    it('Can not remove friend with ivalid id', async () => {
        const response = await request(app).delete(`/friend/removefr/${idFriend} + xyz`).set({ token });
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_ID')
        equal(response.status,400)
        // Kiểm tra db theo user
        const userDb = await userModel.findById(idUser).populate('friends');
        equal(userDb.friends[0]._id.toString(),idFriend)
        // Kiểm tra db theo friend
        const friendDb = await userModel.findById(idFriend).populate('friends');
        equal(friendDb.friends[0]._id.toString(), idUser)
    })
    it('Can not remove friend with ivalid token', async () => {
        const response = await request(app).delete(`/friend/removefr/${idFriend}`).set({ token:'' });
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_TOKEN')
        equal(response.status, 400)
        // Kiểm tra db theo user
        const userDb = await userModel.findById(idUser).populate('friends');
        equal(userDb.friends[0]._id.toString(), idFriend)
        // Kiểm tra db theo friend
        const friendDb = await userModel.findById(idFriend).populate('friends');
        equal(friendDb.friends[0]._id.toString(), idUser)
    })
    it('Can not remove friend twice', async () => {
        await request(app).delete(`/friend/removefr/${idFriend}`).set({ token });
        const response = await request(app).delete(`/friend/removefr/${idFriend}`).set({ token });
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_REMOVE_THIS_FRIEND')
        equal(response.status, 400)
        // Kiểm tra db theo user
        const userDb = await userModel.findById(idUser).populate('friends');
        equal(userDb.friends[0], null)
        // Kiểm tra db theo friend
        const friendDb = await userModel.findById(idUser).populate('friends');
        equal(friendDb.friends[0], null)
    })
    it('Can not remove friend if not friend', async () => {
        const response = await request(app).delete(`/friend/removefr/${idNotSendReq}`).set({ token });
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_REMOVE_THIS_FRIEND')
        equal(response.status, 400)
        // Kiểm tra db theo user
        const userDb = await userModel.findById(idUser).populate('friends');
        equal(userDb.friends[0]._id.toString(), idFriend)
        // Kiểm tra db theo friend
        const friendDb = await userModel.findById(idFriend).populate('friends');
        equal(friendDb.friends[0]._id.toString(), idUser)
    })
})