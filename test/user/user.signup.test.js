const request = require('supertest')
const {equal} = require('assert')

const { app } = require('../../upload/app')
const { UserLogic } = require('../../upload/logic/user.logic')
const { userModel } = require('../../upload/model/user.model')


describe('Test route user signup', () => {
    it('Router signup send correct result', async () => {
        const response = await request(app).post('/user/signup').send({
            email: "test@gmail.com",
            username: "test",
            plainPassword: "test"
        })
        // Kiểm Tra trong response
        equal (response.body.success, true)
        equal(response.body.signUpUser.email, 'test@gmail.com')
        equal(response.body.signUpUser.username, 'test')
        equal (response.status, 200)
        // Kiểm Tra trong database
        const user = await userModel.find({})
        equal (user[0].username, 'test')
        equal (user[0].email, 'test@gmail.com')
    })

    it('Can not signup with empty email', async () => {
        const response = await request(app).post('/user/signup').send({
            email: "",
            username: "test",
            plainPassword: "test"
        })
        // Kiểm Tra trong response
        equal(response.body.success, false)
        equal(response.status, 400)
        equal(response.body.message, 'USER_INFO_REQUIRED')
        // Kiểm Tra trong database
        const user = await userModel.find({})
        equal(user[0], undefined)
    })

    it('Can not signup with empty username', async () => {
        const response = await request(app).post('/user/signup').send({
            email: "test@gmail.com",
            username: "",
            plainPassword: "test"
        })
        // Kiểm Tra trong response
        equal(response.body.success, false)
        equal(response.status, 400)
        equal(response.body.message, 'USER_INFO_REQUIRED')
        // Kiểm Tra trong database
        const user = await userModel.find({})
        equal(user[0], undefined)
    })

    it('Can not signup with empty password', async () => {
        const response = await request(app).post('/user/signup').send({
            email: "test@gmail.com",
            username: "test",
            plainPassword: ""
        })
        // Kiểm Tra trong response
        equal(response.body.success, false)
        equal(response.status, 400)
        equal(response.body.message, 'USER_INFO_REQUIRED')
        // Kiểm Tra trong database
        const user = await userModel.find({})
        equal(user[0], undefined)
    })

    it('Can not signup with duplicate email', async () => {
        await request(app).post('/user/signup').send({
            email: 'test@gmail.com',
            username: 'test',
            plainPassword: 'test'
        })
        const response = await request(app).post('/user/signup').send({
            email: 'test@gmail.com',
            username: 'abcd',
            plainPassword: 'test'
        })
        //Kiểm Tra trong response
        equal (response.body.success, false)
        equal (response.body.message, 'USER_INFO_DUPLICATED')
        equal (response.status, 400)
        // Kiểm Tra trong database
        const user = await userModel.find({username: 'abcd'})
        equal(user[0], undefined)
    })

    it('Can not signup with duplicate username', async () => {
        await request(app).post('/user/signup').send({
            email: 'test@gmail.com',
            username: 'test',
            plainPassword: 'test'
        })
        const response = await request(app).post('/user/signup').send({
            email: 'abcd@gmail.com',
            username: 'test',
            plainPassword: 'test'
        })
        //Kiểm Tra trong response
        equal(response.body.success, false)
        equal(response.body.message, 'USER_INFO_DUPLICATED')
        equal(response.status, 400)
        // Kiểm Tra trong database
        const user = await userModel.find({ username: 'abcd' })
        equal(user[0], undefined)
    })
})