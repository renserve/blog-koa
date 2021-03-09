import { LinRouter, NotFound,Forbidden } from 'lin-mizar';
import { set } from 'lodash';
import { PositiveIdValidator,PaginateValidator ,RequiredValidator,IsEmail} from "@validator/cms/common";
import { CommentCreateValidator} from "@validator/cms/comment";
import {Blacklist} from '@model/cms/blacklist'
import {requireModel} from '@model/cms/comment';
const { CommentDao } = require('@dao/cms/comment')
import {getUserIp, ipLimitCount} from '@middleware/jwt-config'
import {Op} from "sequelize";

const commentApi = new LinRouter({
    prefix: '/web/article/comment',
})
const commentDao = new CommentDao()
/**
 * @api {get} /cms/comment 获取评论
 * @apiName getCommentModel
 * @apiParam model 模块类型
 * @apiParam modelId 评论模块ID(例如：文章ID)
 * @apiParam page 当前页
 * @apiParam count 分页个数
 * @apiVersion 1.0.1
 * @apiGroup 评论模块
 * @apiUse Authorization
 */

// 获取评论
commentApi.get("/",async (ctx) => {
    const v = await new PaginateValidator().validate(ctx);
    const {rows,total} =await commentDao.getComments(v,true)
    ctx.json({
        rows,
        total,
        page: v.get('query.page'),
        count: v.get('query.count')
    });
})
commentApi.post("/add",   async (ctx) => {
    ipLimitCount(ctx,'COMMENT_RECORD',3)
    const v = await new CommentCreateValidator(requireModel,['avatar','isReward']).validate(ctx);
    const ip=getUserIp(ctx)
    const isBlack =await Blacklist.findOne({
        where:{
            [Op.or]:[
                {email:v.get('body.email')},
                {ip}
            ]
        }
    })
    if(isBlack){
        throw new Forbidden({
            message: '此IP或此邮箱已被拉黑'
        });
    }
    await commentDao.createComment(v,ctx)
    ctx.success({
        code:1
    })
})
commentApi.put("/like",   async (ctx) => {
    //邮箱校验
    const v = await new PositiveIdValidator().validate(ctx);
    await commentDao.likeComment(v)
    ctx.success({
        code:3,
        message:'点赞成功'
    })
})
module.exports = commentApi;
