import { LinRouter, NotFound } from 'lin-mizar';
const { RequiredValidator } = require('@validator/cms/common')
import { set } from 'lodash';
import { PositiveIdValidator,PaginateValidator } from "@validator/cms/common";
import {
    adminRequired, groupRequired,
} from "@middleware/jwt";
import {requireModel} from '@model/cms/comment';
import {CommentDao} from '@dao/cms/comment'


const comment = new LinRouter({
    prefix: '/cms/comment',
    module: "评论",
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
comment.linGet(
    'getCommentModel',
    '/',
    async (ctx) => {
    const v = await new PaginateValidator().validate(ctx);
    const {rows,total} =await commentDao.getComments(v)
    ctx.json({
        rows,
        total,
        page: v.get('query.page'),
        count: v.get('query.count')
    });
})
/**
 * @api {put} /cms/comment/:id 评论点赞
 * @apiName addLikeCommentModel
 * @apiVersion 1.0.1
 * @apiGroup 评论模块
 * @apiUse Authorization
 */
// 评论点赞
comment.linPut('addLikeCommentModel',
    '/like/:id',
    async (ctx) => {
    const v = await new PositiveIdValidator().validate(ctx);
    await commentDao.likeComment(v)
    ctx.success({
        message:'点赞成功'
    });
})
/**
 * @api {post} /cms/comment 新增评论
 * @apiName createCommentModel
 * @apiParam nickname 用户昵称
 * @apiParam [avatar] 用户头像
 * @apiParam [isReward] =0 是否赞赏(eg：0否,1是)
 * @apiParam content 评论内容
 * @apiParam model 模块类型
 * @apiParam modelId 评论模块ID(例如：文章ID)
 * @apiParam parentId =0 父级ID(例如：一级评论默认为0)
 * @apiVersion 1.0.1
 * @apiGroup 评论模块
 * @apiUse Authorization
 */
// 新增评论
comment.linPost('createCommentModel',
    '/',
    async (ctx) => {
    const v = await new RequiredValidator(requireModel).validate(ctx);
    await commentDao.createComment(v,ctx)
    ctx.success({
        code:1
    });
})
/**
 * @api {put} /cms/comment 回复评论
 * @apiName changeCommentModel
 * @apiParam id  ID
 * @apiParam [isReward] =0 是否赞赏(eg：0否,1是)
 * @apiParam modelId  评论模块ID(例如：文章ID)
 * @apiParam model  模块类型
 * @apiParam [reply] 评论回复内容(拥有此权限)
 * @apiVersion 1.0.1
 * @apiGroup 评论模块
 * @apiUse Authorization
 */
// 回复评论
comment.linPut('changeCommentModel:comment',
    '/',
    comment.permission("cms_comment_put"),
    groupRequired,
    async (ctx) => {
    const v = await new PositiveIdValidator().validate(ctx);
    await commentDao.updateComment(v)
    ctx.success({
        code:3
    });
})
/**
 * @api {delete} /cms/comment/:id 删除评论
 * @apiName delCommentModel
 * @apiVersion 1.0.1
 * @apiGroup 评论模块
 * @apiUse Authorization
 */
// 删除评论
comment.linDelete('delCommentModel:comment','/:id',
    comment.permission("cms_comment_del"),
    groupRequired,
    async (ctx) => {
    const v = await new PositiveIdValidator().validate(ctx)
    await commentDao.deleteComment(v.get('path.id'),{model:v.get('query.model'),modelId:v.get('query.modelId')})
    ctx.success({
        code:2
    });
})
export {comment }
