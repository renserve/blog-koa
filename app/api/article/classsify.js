import { LinRouter, NotFound } from 'lin-mizar';
import { set } from 'lodash';
import { RequiredValidator} from "@validator/cms/common";
import {TagDao} from '@dao/cms/tag'
import {CategoryDao} from '@dao/cms/category'

const classifyApi = new LinRouter({
    prefix: '/web/article/classify',
})
const categoryDao = new CategoryDao()
const tagDao = new TagDao()
/**
 * @api {get} /cms/classify 获取评论
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
classifyApi.get("/tag",async (ctx) => {
    const v=await new RequiredValidator({modelId:'模块类型'}).validate(ctx);
    ctx.json(await tagDao.getTags(v));
})

classifyApi.get("/category",async (ctx) => {
    const v=await new RequiredValidator({modelId:'模块类型'}).validate(ctx);
    ctx.json(await categoryDao.getCategorys(v));
})

module.exports = classifyApi;
