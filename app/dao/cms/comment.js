const { NotFound, Forbidden } = require("lin-mizar");
const { Article,Comment } = require("@model/article");
import { set ,zipObject} from "lodash";
const xss = require('xss') // 引入xss
import { Op } from "sequelize";
import {getUserArea, getUserIp, limitCount} from '@middleware/jwt-config'
class CommentDao {
    async createComment(v,ctx) {
        const classId=v.get("body.classId")
        const modelId=v.get("body.modelId")
        const comments=await Comment.findAll({
            where:{
                classId,
                email:v.get(`body.email`)
            }
        })
        const userLevel=0
        if(!ctx.currentUser){
            if(comments && comments.length>limitCount.comment.count[userLevel]){
                throw new Forbidden({
                    message:`该篇文章评论超过限制(${limitCount.comment.count[userLevel]}条/人)`
                });
            }
        }
        switch (modelId){
            case 1:{
                const article = await Article.findByPk(classId);
                if(!article){
                    throw new NotFound({
                        message: "没有找到相关文章"
                    });
                }
                break
            }
            default:{
                break
            }
        }
        //todo xss过滤
        let ip=null,area=null;
        if(!ctx.currentUser){
            ip=getUserIp(ctx)
            area=await getUserArea(ip)
        }
        const xssFilter=['nickname','content','email','avatar','reward','modelId','classId']
        const xssData=zipObject(xssFilter,xssFilter.map(i=>xss(v.get(`body.${i}`))))
        await Comment.create({
            ...xssData,
            ip,
            area,
            parentId: xss(v.get("body.parentId")) || 0
        });
    }
    async getComments(v,isFront) {
        const condition={}
        const start = v.get('query.page');
        const count1 = v.get('query.count');
        v.get("query.modelId") && set(condition, 'modelId',v.get("query.modelId"));
        v.get("query.classId") && set(condition, 'classId',v.get("query.classId"));
        const filter={
            where: Object.assign({parentId:0}, condition),
            offset: start * count1,
            limit: count1,
            include: {
                model: Comment,
                as: 'children',
                required: false
            },
            order: [
                ['createdAt', 'DESC']
            ]
        }
        isFront && set(filter,'attributes',{exclude:['email','ip','area']})
        const { rows, count } = await Comment.findAndCountAll(filter);
        return {
            rows,
            total: count
        };
    }
    //删除评论
    async deleteComment(id,params,options={}) {
        await Comment.destroy({
            where:{
                [Op.or]:[
                    {parentId:id},
                    {id}
                ]
            },
            ...options
        });
    }
    //评论点赞
    async likeComment(v) {
        const id = v.get("path.id");
        const comment = await Comment.findByPk(id);
        if (!comment) {
            throw new NotFound({
                message: "没有找到相关评论"
            });
        }
        await comment.increment("like");
    }
    //回复评论
    async updateComment(v) {
        const id=v.get(`body.id`)
        const reply=v.get("body.reply")
        const isReward=v.get("body.isReward")
        const comment = await Comment.findByPk(id);
        if (!comment) {
            throw new NotFound({
                message: "没有找到相关评论"
            });
        }
        reply && (comment.reply = reply);
        isReward && (comment.isReward =isReward);
        await comment.save();
    }
}
module.exports = {
    CommentDao
};
