const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { UserLogic } = require('../../upload/logic/user.logic')
const { verify } = require('../../upload/lib/jwt')
const { userModel } = require('../../upload/model/user.model')

describe('Test route check user', () => {
    let token, _id;
    beforeEach('Signup and signin for check user by token', async () => {
        await UserLogic.signUpUser ('test@gmail.com','test','test');
        const signInUser = await UserLogic.signInUser ('test', 'test')
        token = signInUser.token;
        _id = signInUser._id;
    })

    it ('Router check send correct result', async () => {
        const response = await request(app).get('/user/check').set ({ token });
        // Kiểm tra trong response
        equal (response.body.success, true);
        equal (response.body.checkUser.username, 'test')
        // Kiểm tra id request trả về và id token trả về
        const idUser = await verify (token);
        equal (idUser._id, response.body.checkUser._id);
    })

    it ('Can not signin with empty token', async () => {
        const response = await request(app).get('/user/check').set({ token:'' });
        // Kiểm tra trong response
        equal (response.body.success, false);
        equal (response.body.message, 'INVALID_TOKEN')
        equal (response.status, 400)
    })

    it ('Can not signin with deleted user',async () => {
        await userModel.remove({});
        const response = await request(app).get('/user/check').set({ token });
        // Kiểm tra trong response
        equal(response.body.success, false);
        equal(response.body.message, 'CAN_NOT_FIND_ANY_USER')
        equal(response.status, 400)
    })
})