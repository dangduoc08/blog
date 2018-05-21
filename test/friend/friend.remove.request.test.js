const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')
const { FriendLogic } = require('../../upload/logic/friend.logic')

describe('Test router remove request friend', async () => {
    let idSend, idReceive, token, token2, idNotSendReq;
    beforeEach('Create 2 users for test remove request friend', async () => {
        await UserLogic.signUpUser('user1@gmail.com', 'user1', '1234')
        await UserLogic.signUpUser('user2@gmail.com', 'user2', '1234')
        await UserLogic.signUpUser('user3@gmail.com', 'user3', '1234')
        // Signin
        const user1 = await UserLogic.signInUser('user1', '1234');
        const user2 = await UserLogic.signInUser('user2', '1234');
        const user3 = await UserLogic.signInUser('user3', '1234');
        idSend = user1._id;
        idReceive = user2._id;
        token = user1.token;
        token2 = user2.token;
        idNotSendReq = user3._id;
        // Gửi lời mời kết bạn
        await FriendLogic.sendReqAddFriend(idSend, idReceive);
    })
    it('Remove request friend send correct result', async () => {
        const response = await request(app).delete(`/friend/removereqfr/${idReceive}`).set({ token });
        equal(response.body.success, true);
        equal(response.body.removeReqFr._id, idReceive)
        // Kiểm tra trong database của người gửi request
        const senderDb = await userModel.findOne({ _id: idSend }).populate('friends')
        equal(senderDb.sendRequest[0], undefined);
        equal(senderDb.friends[0], undefined)
        // Kiểm tra trong database của người nhận request
        const receiverDb = await userModel.findOne({ _id: idReceive }).populate('friends')
        equal(receiverDb.receiveRequest[0], undefined);
        equal(receiverDb.friends[0], undefined);
    })
    it('Can not remove req friend with ivalid idReceive', async () => {
        const response = await request(app).delete(`/friend/removereqfr/${idReceive} + xyz`).set({ token });
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_ID')
        equal(response.status, 400)
        // Kiểm tra trong db của người gửi request
        const senderDb = await userModel.findOne({ _id: idSend });
        equal(senderDb.sendRequest[0].toString(), idReceive);
        equal(senderDb.friends[0], undefined);
        // Kiểm tra trong db của người nhận request
        const receiverDb = await userModel.findOne({ _id: idReceive });
        equal(receiverDb.receiveRequest[0].toString(), idSend)
        equal(receiverDb.friends[0], undefined)
    })
    it('Can not remove req friend with ivalid token', async () => {
        const response = await request(app).delete(`/friend/removereqfr/${idReceive}`).set({ token: '' });
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_TOKEN')
        equal(response.status, 400)
        // Kiểm tra trong db của người gửi request
        const senderDb = await userModel.findOne({ _id: idSend });
        equal(senderDb.sendRequest[0].toString(), idReceive);
        equal(senderDb.friends[0], undefined);
        // Kiểm tra trong db của người nhận request
        const receiverDb = await userModel.findOne({ _id: idReceive });
        equal(receiverDb.receiveRequest[0].toString(), idSend)
        equal(receiverDb.friends[0], undefined)
    })
    it('Can not remove req friend twice', async () => {
        await request(app).delete(`/friend/removereqfr/${idReceive}`).set({ token });
        const response = await request(app).delete(`/friend/removereqfr/${idReceive}`).set({ token });
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_REMOVE_THIS_REQUEST')
        equal(response.status, 400)
        // Kiểm tra trong database của người gửi request
        const senderDb = await userModel.findOne({ _id: idSend }).populate('friends')
        equal(senderDb.sendRequest[0], undefined);
        equal(senderDb.friends[0], undefined)
        // Kiểm tra trong database của người nhận request
        const receiverDb = await userModel.findOne({ _id: idReceive }).populate('friends')
        equal(receiverDb.receiveRequest[0], undefined);
        equal(receiverDb.friends[0], undefined);
    })
    it('Can not remove req friend with user who didnt receive request', async () => {
        const response = await request(app).delete(`/friend/removereqfr/${idNotSendReq}`).set({ token });
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_REMOVE_THIS_REQUEST')
        equal(response.status, 400)
        // Kiểm tra trong db của người gửi request
        const senderDb = await userModel.findOne({ _id: idSend });
        equal(senderDb.sendRequest[0].toString(), idReceive);
        equal(senderDb.friends[0], undefined);
        // Kiểm tra trong db của người nhận request
        const receiverDb = await userModel.findOne({ _id: idReceive });
        equal(receiverDb.receiveRequest[0].toString(), idSend)
        equal(receiverDb.friends[0], undefined)
    })
    it('Can not remove request yourself', async () => {
        const response = await request(app).delete(`/friend/removereqfr/${idSend}`).set({ token });
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_REMOVE_THIS_REQUEST')
        equal(response.status, 400)
        // Kiểm tra trong db của người gửi request
        const senderDb = await userModel.findOne({ _id: idSend });
        equal(senderDb.sendRequest[0].toString(), idReceive);
        equal(senderDb.friends[0], undefined);
        // Kiểm tra trong db của người nhận request
        const receiverDb = await userModel.findOne({ _id: idReceive });
        equal(receiverDb.receiveRequest[0].toString(), idSend)
        equal(receiverDb.friends[0], undefined)
    })
})