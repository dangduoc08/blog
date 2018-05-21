const express = require('express')
const parser = require('body-parser');

// Các router
const {userRouter} = require('./controller/user.router')
const { newsRouter } = require('./controller/news.router')
const { cmtRouter } = require('./controller/comment.router')
const {friendRouter} = require('./controller/friend.router')

const app = express();

// Middleware recieve JSON body
app.use(parser.json())
app.use(parser.urlencoded({ extended:false }))

app.use ('/user', userRouter)

app.use ('/news', newsRouter)

app.use('/comment', cmtRouter)

app.use('/friend', friendRouter)
module.exports = {app}