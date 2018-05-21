const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')
const {FriendLogic} = require('../../upload/logic/friend.logic')

describe('Test router accept friend', async () => {
    let idSend, idReceive, token, token2, idNotSendReq;
    beforeEach('Create 2 users for test add friend', async () => {
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
        await FriendLogic.sendReqAddFriend(idSend,idReceive);
    })
    it('Accept friend send correct result', async () => {
        const response = await request(app).post(`/friend/acceptfr/${idSend}`).set({token:token2});
        equal(response.body.success, true);
        equal(response.body.senderAccept._id,idSend)
        // Kiểm tra trong database của người gửi request
        const senderDb = await userModel.findOne({_id:idSend}).populate('friends')
        equal(senderDb.sendRequest[0], undefined);
        equal(senderDb.friends[0]._id.toString(),idReceive)
        // Kiểm tra trong database của người nhận request
        const receiverDb = await userModel.findOne({ _id: idReceive }).populate('friends')
        equal(receiverDb.receiveRequest[0], undefined);
        equal(receiverDb.friends[0]._id.toString(), idSend);
    })
    it('Can not accept friend with ivalid idReceiver', async() => {
        const response = await request(app).post(`/friend/acceptfr/${idSend} + xyz`).set({ token:token2 });
        equal(response.body.success,false)
        equal(response.body.message,'INVALID_ID')
        equal(response.status,400)
        // Kiểm tra trong db của người gửi request
        const senderDb = await userModel.findOne({_id:idSend});
        equal(senderDb.friends[0], undefined);
        // Kiểm tra trong db của người nhận request
        const receiverDb= await userModel.findOne({_id:idReceive});
        equal(receiverDb.friends[0], undefined)
    })
    it('Can not accept friend with ivalid token', async () => {
        const response = await request(app).post(`/friend/acceptfr/${idSend}`).set({ token:'' });
        equal(response.body.success, false)
        equal(response.body.message, 'INVALID_TOKEN')
        equal(response.status, 400)
        // Kiểm tra trong db của người gửi request
        const senderDb = await userModel.findOne({ _id: idSend });
        equal(senderDb.friends[0], undefined);
        // Kiểm tra trong db của người nhận request
        const receiverDb = await userModel.findOne({ _id: idReceive });
        equal(receiverDb.friends[0], undefined)
    })
    it('Can not accept friend twice',async()=>{
        await request(app).post(`/friend/acceptfr/${idSend}`).set({ token: token2 });
        const response = await request(app).post(`/friend/acceptfr/${idSend}`).set({ token: token2 });
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_ACCEPT')
        equal(response.status, 400)
        // Kiểm tra trong database của người gửi request
        const senderDb = await userModel.findOne({ _id: idSend }).populate('friends')
        equal(senderDb.sendRequest[0], undefined);
        equal(senderDb.friends[0]._id.toString(), idReceive)
        // Kiểm tra trong database của người nhận request
        const receiverDb = await userModel.findOne({ _id: idReceive }).populate('friends')
        equal(receiverDb.receiveRequest[0], undefined);
        equal(receiverDb.friends[0]._id.toString(), idSend);
    })
    it('Can not accept with user who didnt request', async () => {
        const response = await request(app).post(`/friend/acceptfr/${idNotSendReq}`).set({ token:token2 });
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_ACCEPT')
        equal(response.status, 400)
        // Kiểm tra trong db của người gửi request
        const senderDb = await userModel.findOne({ _id: idSend });
        equal(senderDb.friends[0], undefined);
        // Kiểm tra trong db của người nhận request
        const receiverDb = await userModel.findOne({ _id: idReceive });
        equal(receiverDb.friends[0], undefined)
    })
    it('Can not accept yourself', async () => {
        const response = await request(app).post(`/friend/acceptfr/${idReceive}`).set({ token:token2 });
        equal(response.body.success, false)
        equal(response.body.message, 'CAN_NOT_ACCEPT')
        equal(response.status, 400)
        // Kiểm tra trong db của người gửi request
        const senderDb = await userModel.findOne({ _id: idSend });
        equal(senderDb.friends[0], undefined);
        // Kiểm tra trong db của người nhận request
        const receiverDb = await userModel.findOne({ _id: idReceive });
        equal(receiverDb.friends[0], undefined)
    })
})