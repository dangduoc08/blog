const { userModel } = require('../model/user.model.js')
const { MyError } = require('../lib/myerror')
const { checkObjectId } = require('../lib/check_object_id')

class FriendLogic {
    static async sendReqAddFriend (idSend, idReceive) {
        checkObjectId(idSend,idReceive)
        // update thằng gửi request
        const querySend = {
            _id:idSend,
            friends:{$ne:idReceive},
            sendRequest:{$ne:idReceive},
            receiveRequest:{$ne:idReceive}
        }
        const sender = await userModel.findOneAndUpdate(querySend, { $push: { sendRequest:idReceive }});
        if(!sender) throw new MyError('CAN_NOT_ADD_FRIEND_THIS_USER',400)

        // update thằng nhận request
        const queryReceive = {
            _id:idReceive,
            friends:{$ne:idSend},
            sendRequest:{$ne:idSend},
            receiveRequest:{$ne:idSend}
        }
        const optionReceive = {
            new:true,
            fields:{username:1}
        }
        const receiver = await userModel.findOneAndUpdate(queryReceive, { $push: { receiveRequest:idSend }},optionReceive);
        if (!receiver) throw new MyError('CAN_NOT_ADD_FRIEND_THIS_USER', 400);
        return receiver;
    }
    static async acceptFriend(idSend, idReceive) {
        checkObjectId(idSend,idReceive);
        // thêm bạn cho thằng nhận request
        const queryReceive = {
            _id: idReceive,
            friends: { $ne: idSend },
            sendRequest: { $ne: idSend },
            receiveRequest: idSend
        }
        const updateReceive = {
            $push: { friends: idSend },
            $pull: { receiveRequest: idSend }
        }
        const receiver = await userModel.findOneAndUpdate(queryReceive, updateReceive)
        if (!receiver) throw new MyError('CAN_NOT_ACCEPT', 400)
        
        // thêm bạn cho thằng gửi request
        const querySend = {
            _id: idSend,
            friends:{$ne:idReceive},
            sendRequest:idReceive,
            receiveRequest:{$ne:idReceive}
        }
        const updateSend = {
            $push:{friends:idReceive},
            $pull:{sendRequest:idReceive}
        }
        const option = {
            new: true,
            fields: { username: 1 }
        }
        const sender = await userModel.findOneAndUpdate(querySend,updateSend,option)
        if (!sender) throw new MyError('CAN_NOT_ACCEPT',400)
        return sender;
    }
    static async declineFriend(idSend, idReceive) {
        checkObjectId(idSend, idReceive);
        // lấy request ra khỏi thằng nhận
        const queryReceive = {
            _id: idReceive,
            friends: { $ne: idSend },
            sendRequest: { $ne: idSend },
            receiveRequest: idSend
        }
        const updateReceive = {
            $pull: { receiveRequest: idSend }
        }
        const receiver = await userModel.findOneAndUpdate(queryReceive, updateReceive)
        if (!receiver) throw new MyError('CAN_NOT_DECLINE', 400)
        // lấy request ra khỏi thằng gửi request
        const querySend = {
            _id: idSend,
            friends: { $ne: idReceive },
            sendRequest: idReceive,
            receiveRequest: { $ne: idReceive }
        }
        const updateSend = {
            $pull: { sendRequest: idReceive }
        }
        const option = {
            new: true,
            fields: { username: 1 }
        }
        const sender = await userModel.findOneAndUpdate(querySend, updateSend,option)
        if (!sender) throw new MyError('CAN_NOT_DECLINE', 400)
        return sender;
    }
    static async removeReqFriend(idSend, idReceive) {
        checkObjectId(idSend, idReceive);
        // lấy request ra khỏi thằng gửi request
        const querySend = {
            _id: idSend,
            friends: { $ne: idReceive },
            sendRequest: idReceive,
            receiveRequest: { $ne: idReceive }
        }
        const updateSend = {
            $pull: { sendRequest: idReceive }
        }
        const sender = await userModel.findOneAndUpdate(querySend, updateSend)
        if (!sender) throw new MyError('CAN_NOT_REMOVE_THIS_REQUEST', 400)
        // lấy request ra khỏi thằng nhận
        const queryReceive = {
            _id: idReceive,
            friends: { $ne: idSend },
            sendRequest: { $ne: idSend },
            receiveRequest: idSend
        }
        const updateReceive = {
            $pull: { receiveRequest: idSend }
        }
        const option = {
            new: true,
            fields: { username: 1 }
        }
        const receiver = await userModel.findOneAndUpdate(queryReceive, updateReceive, option)
        if (!receiver) throw new MyError('CAN_NOT_REMOVE_THIS_REQUEST', 400)
        return receiver;
    }
    static async removeFriend(idUser, idFriend) {
        checkObjectId(idUser, idFriend);
        // Lấy friend ra khỏi user
        const queryUser = {
            _id:idUser,
            friends:idFriend,
            sendRequest:{$ne:idFriend},
            receiveRequest:{$ne:idFriend}
        }
        const pullUser = {$pull:{friends:idFriend}}
        const user = await userModel.findOneAndUpdate(queryUser,pullUser,{new:true})
        if(!user) throw new MyError('CAN_NOT_REMOVE_THIS_FRIEND',400)
        // Lấy friend ra khỏi friend
        const queryFriend = {
            _id:idFriend,
            friends:idUser,
            sendRequest: { $ne: idUser },
            receiveRequest: { $ne: idUser }
        }
        const pullFriend = {$pull:{friends:idUser}}
        const option = {
            new:true,
            fields:{username:1,friends:1}
        }
        const removeFriend = await userModel.findOneAndUpdate(queryFriend, pullFriend, option)
        if (!removeFriend) throw new MyError('CAN_NOT_REMOVE_THIS_FRIEND', 400);
        return removeFriend
    }
}

module.exports = {FriendLogic}