process.env.NODE_ENV = 'test';
require('../upload/connect');
const { userModel } = require('../upload/model/user.model');
const { newsModel } = require('../upload/model/news.model');
const { commentModel } = require('../upload/model/comment.model');

beforeEach ('Clear data for testing', async () => {
    await userModel.remove({});
    await newsModel.remove({});
    await commentModel.remove({});
})
