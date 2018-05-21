const request = require('supertest')
const { equal } = require('assert')

const { app } = require('../../upload/app')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')

describe('Test route user signin', () => {
    beforeEach('Create new user for testing', async () => {
        await UserLogic.signUpUser('test@gmail.com','test','test');
    })
    it('Router signin send correct result', async () => {
        const response = await request(app).post('/user/signin').send ({
            username: 'test',
            plainPassword: 'test'
        })
        // Kiểm tra trong response
        equal (response.body.success, true)
        equal (response.body.signInUser.username, 'test')
    })

    it('Can not signin with empty username', async () => {
        const response = await request(app).post('/user/signin').send({
            username: '',
            plainPassword: 'test'
        })
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.status, 400)
        equal(response.body.message, 'username_OR_PASSWORD_REQUIRED')
    })

    it('Can not signin with empty password', async () => {
        const response = await request(app).post('/user/signin').send({
            username: 'test',
            plainPassword: ''
        })
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.status, 400)
        equal(response.body.message, 'username_OR_PASSWORD_REQUIRED')
    })

    it('Can not signin with wrong username', async () => {
        const response = await request(app).post('/user/signin').send({
            username: 'abcd',
            plainPassword: 'test'
        })
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.status, 400)
        equal(response.body.message, 'username_OR_PASSWORD_INCORRECT')
    })

    it('Can not signin with wrong password', async () => {
        const response = await request(app).post('/user/signin').send({
            username: 'test',
            plainPassword: 'abcd'
        })
        // Kiểm tra trong response
        equal(response.body.success, false)
        equal(response.status, 400)
        equal(response.body.message, 'username_OR_PASSWORD_INCORRECT')
    })

    it('Can not signin to deleted user', async () => {
        await userModel.remove({});
        const response = await request(app).post('/user/signin').send ({
            username: 'test',
            plainPassword: 'test'
        })
        // Kiểm tra trong response
        equal (response.body.success, false);
        equal (response.body.message, 'username_OR_PASSWORD_INCORRECT')
    })
})