const { hash, compare } = require('bcryptjs')

const { userModel } = require('../model/user.model.js')
const { MyError } = require('../lib/myerror')
const { sign, verify } = require('../lib/jwt')

class UserLogic {
    static async signUpUser (email, username, plainPassword) {
        // Kiểm trả nếu thông tin rỗng
        if (!email ||  !username || !plainPassword) {
            throw new MyError ('USER_INFO_REQUIRED', 400)
        }
        // Kiểm tra nếu trùng thông tin
        const checkUser = await userModel.find({ 
            $or: [ {email}, {username} ]
        })
        if(checkUser[0] !== undefined) {
            throw new MyError('USER_INFO_DUPLICATED', 400)
        }
        const password = await hash (plainPassword,8);
        const user = new userModel ({ email, username, password })
        const signUpUser = await user.save()
        const obj = signUpUser.toObject();
        delete obj.password;
            return obj;
    }

    static async signInUser (username, plainPassword) {
        if (!username || !plainPassword) throw new MyError('username_OR_PASSWORD_REQUIRED',400);
        // Kiểm tra theo username
        const signInUser = await userModel.findOne({ username });
        if ( !signInUser ) throw new MyError ('username_OR_PASSWORD_INCORRECT', 400);
        // Kiểm tra theo password
        const obj = signInUser.toObject();
        const isTrue = await compare ( plainPassword, obj.password );
        delete obj.password;
        if (isTrue !== true) throw new MyError('username_OR_PASSWORD_INCORRECT', 400);
        // Thêm token
        const token = await sign ({ _id: obj._id })
        obj.token = token;
            return obj;
    }

    static async checkUser (idUser) {
        const token = await sign({ _id: idUser })
        return token
    }
}

module.exports = {UserLogic}