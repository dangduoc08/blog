const { newsModel } = require('../model/news.model');
const { userModel } = require('../model/user.model');
const { commentModel } = require('../model/comment.model');
const { MyError } = require ('../lib/myerror.js');
const { checkObjectId } = require('../lib/check_object_id')

class NewsLogic {
    static async newsAll() {
        return await newsModel.find({})
    }

    static async createNews (content, idUser) {
        if (!content) throw new MyError ('CONTENT_MUST_BE_FILLED', 400)
        const createNews = new newsModel ({ content, author:idUser });
        await userModel.findByIdAndUpdate({ _id: idUser }, { $push: { news: createNews._id } })
        return await createNews.save();
    }

    static async updateNews (content, idNews, idUser) {
        if (!content) throw new MyError('CONTENT_MUST_BE_FILLED', 400);
        checkObjectId( idNews, idUser );
        const condition = { $and: [{ _id: idNews }, { author: idUser }] };
        const updateNews = await newsModel.findOneAndUpdate(condition, {content},{new:true});
        if (!updateNews) throw new MyError ('CAN_ NOT_UPDATE_THIS_NEWS', 404)
        return updateNews
    }

    static async deleteNews (idNews, idUser) {
        checkObjectId( idUser, idNews );
        const condition = {$and: [{_id:idNews},{author:idUser}]};
        const deleteNews = await newsModel.findOneAndRemove(condition)
        if (!deleteNews) throw new MyError('CAN_NOT_DELETE_THIS_NEWS', 404)

        //query để lấy các comment theo news bị xóa
        let arrId =[]
        const all_Cmt_Of_Deleted_News = await commentModel.find({ newsCmt: idNews });
        all_Cmt_Of_Deleted_News.forEach (cmt => {
            arrId.push(cmt._id)
        })

        // Lấy dữ liệu news và likeNewses và các cmt của news đó ra khỏi user
        const pull = { $pull: { news:idNews, likeNewses:idNews, }, $pullAll:{comment:arrId,likeCmts:arrId} } ;
        await userModel.updateMany({},pull,{new:true})
        // Xóa data comment theo news bị xóa
        await commentModel.remove({newsCmt:idNews})
        return deleteNews
    }

    static async likeNews(idNews, idUser) {
        checkObjectId( idNews, idUser );
        // Điều kiện để được like news
        const newsCondition = {_id:idNews, likePersons: {$ne: idUser}};
        const updateNews = {$push:{ likePersons:idUser }}
        const likeNews = await newsModel.findOneAndUpdate (newsCondition, updateNews, {new:true} );
        if (!likeNews) throw new MyError ('CAN_NOT_LIKE_THIS_NEWS',404);
        const userCondition = {_id: idUser, likeNewses:{$ne: idNews}}
        await userModel.findOneAndUpdate(userCondition, { $push: { likeNewses: idNews } },{new:true});
        return likeNews
    }

    static async dislikeNews (idNews, idUser) {
        checkObjectId (idNews,idUser);
        // Điều kiện để dislike news
        const newsCondition = { $and: [{_id:idNews},{likePersons: idUser}] }
        const updateNews = { $pull:{likePersons: idUser} }
        const dislikeNews = await newsModel.findOneAndUpdate (newsCondition,updateNews,{new:true});
        if (!dislikeNews) throw new MyError ('CAN_NOT_DISLIKE_THIS_NEWS',404);
        await userModel.findOneAndUpdate({ _id: idUser }, { $pull: { likeNewses: idNews } });
        return dislikeNews
    }
}

module.exports = { NewsLogic }