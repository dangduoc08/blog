const { newsModel } = require('../model/news.model');
const { userModel } = require('../model/user.model');
const {commentModel} = require('../model/comment.model');
const {checkObjectId} = require('../lib/check_object_id')
const {MyError} = require('../lib/myerror')


class CommentLogic {
    static async createCmt (content, idNews, idUser) {
        if(!content) throw new MyError ('COMMENT_MUST_BE_FILLED',400)
        checkObjectId (idNews,idUser);
        const createCmt = new commentModel ({content,newsCmt:idNews,userCmt:idUser});
        const updateNews = await newsModel.findOneAndUpdate({_id:idNews},{$push:{comment:createCmt._id}},{new:true});
        if (!updateNews) throw new MyError('CAN_NOT_COMMENT_THIS_COMMENT',404)
        await userModel.findOneAndUpdate({_id:idUser},{$push:{comment:createCmt._id}},{new:true});
        return await createCmt.save();
    }

    static async deleteCmt (idCmt, idUser) {
        checkObjectId(idCmt, idUser);
        const deleteCmt = await commentModel.findOneAndRemove({$and:[{_id:idCmt},{userCmt:idUser}]});
        if(!deleteCmt) throw new MyError('CAN_NOT_DELETE_THIS_COMMENT',400);
        await newsModel.findOneAndUpdate({_id:deleteCmt.newsCmt},{$pull:{comment:deleteCmt._id}},{new:true});
        await userModel.findOneAndUpdate({_id:deleteCmt.userCmt},{$pull:{comment:deleteCmt._id,likeCmts:idCmt}},{new:true});
        return deleteCmt;
    }

    static async updateCmt(content, idCmt, idUser) {
        if(!content) throw new MyError('UPDATE_CONTENT_MUST_BE_FILLED',400)
        checkObjectId(idCmt, idUser);
        const condition = { $and: [{ _id: idCmt }, { userCmt: idUser }] };
        const updateCmt = await commentModel.findOneAndUpdate(condition,{content},{new:true});
        if(!updateCmt) throw new MyError('CAN_NOT_UPDATE_THIS_COMMENT', 400);
        return updateCmt;
    }

    static async likeCmt(idCmt, idUser) {
        checkObjectId(idCmt,idUser);
        const condition = {_id:idCmt,likePersons:{$ne:idUser}}
        const likeCmt = await commentModel.findOneAndUpdate(condition,{$push:{likePersons:idUser}},{new:true});
        if(!likeCmt) throw new MyError('CAN_NOT_LIKE_THIS_COMMENT',400)
        await userModel.findOneAndUpdate({_id:idUser},{$push:{likeCmts:idCmt}},{new:true})
        return likeCmt
    }

    static async dislikeCmt(idCmt, idUser) {
        checkObjectId(idCmt,idUser);
        const condition = {_id:idCmt,likePersons:idUser}
        const dislikeCmt = await commentModel.findOneAndUpdate(condition,{$pull:{likePersons:idUser}},{new:true});
        if (!dislikeCmt) throw new MyError('CAN_NOT_DISLIKE_THIS_COMMENT', 400)
        await userModel.findByIdAndUpdate(idUser,{$pull:{likeCmts:idCmt}},{new:true})
        return dislikeCmt
    }
}

module.exports = {CommentLogic}