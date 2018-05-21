const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')

describe('Test router add friend', async() => {
    let idSend, idReceive, token, token2;
    beforeEach('Create 2 users for test add friend', async () => {
        await UserLogic.signUpUser('user1@gmail.com', 'user1', '1234')
        await UserLogic.signUpUser('user2@gmail.com', 'user2', '1234')
        // Signin
        const user1 = await UserLogic.signInUser('user1','1234');
        const user2 = await UserLogic.signInUser('user2', '1234');
        idSend = user1._id;
        idReceive = user2._id;
        token = user1.token;
        token2 = user2.token;
    })

    it('Test add friend send correct result', async() => {
        const response = await request(app).post(`/friend/addfriend/${idReceive}`).set({token});
        // Kiểm tra trong response
        equal(response.body.success,true);
        equal(response.body.receiver._id,idReceive)
        // Kiểm tra trong user database theo người gửi request
        const sendDb = await userModel.findOne({_id:idSend}).populate('sendRequest');
        equal(sendDb.sendRequest[0]._id.toString(), idReceive);
        // Kiểm tra trong user database theo người nhận request
        const receiveDb = await userModel.findOne({ _id: idReceive }).populate('receiveRequest');
        equal(receiveDb.receiveRequest[0]._id.toString(), idSend)
    })

    it('Can not add friend with non-exist idReceive', async () => {
        const response = await request(app).post(`/friend/addfriend/${idReceive} + xyz`).set({ token });
        // Kiểm tra trong response
        equal(response.body.success, false);
        equal(response.body.message, 'INVALID_ID');
        equal(response.status,400)
        // Kiểm tra trong user database theo người gửi request
        const sendDb = await userModel.findOne({ _id: idSend }).populate('sendRequest');
        equal(sendDb.sendRequest[0], undefined);
        // Kiểm tra trong user database theo người nhận request
        const receiveDb = await userModel.findOne({ _id: idReceive }).populate('receiveRequest');
        equal(receiveDb.receiveRequest[0], undefined)
    })

    it('Can not add friend without token', async () => {
        const response = await request(app).post(`/friend/addfriend/${idReceive}`).set({ token:'' });
        // Kiểm tra trong response
        equal(response.body.success, false);
        equal(response.body.message, 'INVALID_TOKEN');
        equal(response.status, 400)
        // Kiểm tra trong user database theo người gửi request
        const sendDb = await userModel.findOne({ _id: idSend }).populate('sendRequest');
        equal(sendDb.sendRequest[0], undefined);
        // Kiểm tra trong user database theo người nhận request
        const receiveDb = await userModel.findOne({ _id: idReceive }).populate('receiveRequest');
        equal(receiveDb.receiveRequest[0], undefined)
    })

    it('Can not add friend if request send twice', async () => {
        await request(app).post(`/friend/addfriend/${idReceive}`).set({ token });
        const response = await request(app).post(`/friend/addfriend/${idReceive}`).set({ token });
        // Kiểm tra trong response
        equal(response.body.success, false);
        equal(response.body.message, 'CAN_NOT_ADD_FRIEND_THIS_USER');
        equal(response.status, 400)
        // Kiểm tra trong user database theo người gửi request
        const sendDb = await userModel.findOne({ _id: idSend }).populate('sendRequest');
        equal(sendDb.sendRequest[0]._id.toString(), idReceive);
        // Kiểm tra trong user database theo người nhận request
        const receiveDb = await userModel.findOne({ _id: idReceive }).populate('receiveRequest');
        equal(receiveDb.receiveRequest[0]._id.toString(), idSend)
    })

    it('Can not add friend who send request to you first', async () => {
        await request(app).post(`/friend/addfriend/${idSend}`).set({ token:token2 });
        const response = await request(app).post(`/friend/addfriend/${idReceive}`).set({ token });
        // Kiểm tra trong response
        equal(response.body.success, false);
        equal(response.body.message, 'CAN_NOT_ADD_FRIEND_THIS_USER');
        equal(response.status, 400)
        // Kiểm tra trong user database theo người gửi request
        const sendDb = await userModel.findOne({ _id: idReceive }).populate('sendRequest');
        equal(sendDb.sendRequest[0]._id.toString(), idSend);
        // Kiểm tra trong user database theo người nhận request
        const receiveDb = await userModel.findOne({ _id: idSend }).populate('receiveRequest');
        equal(receiveDb.receiveRequest[0]._id.toString(), idReceive)
    })

    it('Can not add friend yourself', async () => {
        const response = await request(app).post(`/friend/addfriend/${idSend}`).set({ token });
        // Kiểm tra trong response
        equal(response.body.success, false);
        equal(response.body.message, 'CAN_NOT_ADD_FRIEND_THIS_USER');
        equal(response.status, 400)
        // Kiểm tra trong user database theo người gửi request
        const sendDb = await userModel.findOne({ _id: idReceive }).populate('sendRequest');
        equal(sendDb.sendRequest[0], undefined);
        // Kiểm tra trong user database theo người nhận request
        const receiveDb = await userModel.findOne({ _id: idSend }).populate('receiveRequest');
        equal(receiveDb.receiveRequest[0], undefined)
    })

    it('Can not add removed friend', async () => {
        await userModel.findByIdAndRemove(idReceive);
        const response = await request(app).post(`/friend/addfriend/${idReceive}`).set({ token });
        // Kiểm tra trong response
        equal(response.body.success, false);
        equal(response.body.message, 'CAN_NOT_ADD_FRIEND_THIS_USER');
        equal(response.status, 400)
        // Kiểm tra trong user database theo người gửi request
        const sendDb = await userModel.findOne({ _id: idReceive }).populate('sendRequest');
        equal(sendDb, undefined);
        // Kiểm tra trong user database theo người nhận request
        const receiveDb = await userModel.findOne({ _id: idSend }).populate('receiveRequest');
        equal(receiveDb.receiveRequest[0], undefined)
    })
})
