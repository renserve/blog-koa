import { LinRouter, NotFound } from 'lin-mizar';
const { RequiredValidator ,IsOptionalValidator} = require('@validator/cms/common')
import { set } from 'lodash';
import { logger } from "@middleware/logger";
import { PositiveIdValidator,PaginateValidator } from "@validator/cms/common";
import {
    adminRequired, groupRequired,loginRequired
} from "@middleware/jwt";
import {requireModel} from '@model/cms/tag';
import {TagDao} from '@dao/cms/tag'
import { message } from "./message";
const tag = new LinRouter({
    prefix: '/cms/tag',
    module: "标签",
})

const tagDao = new TagDao()

/**
 * @api {get} /cms/tag 获取标签
 * @apiName getTagModel
 * @apiUse IsOptional
 * @apiVersion 1.0.1
 * @apiGroup 标签模块
 * @apiUse Authorization
 */

// 获取标签
tag.linGet('getTagModel','/', loginRequired,async (ctx) => {
    let v=await new IsOptionalValidator().validate(ctx);
    const page=v.get("query.page")
    const count1=v.get("query.count")
    if(page && count1){
        v=await new PaginateValidator().validate(ctx);
        const { rows,total } = await tagDao.getTags(v)
        ctx.json({
            rows,
            total: total,
            page: v.get("query.page"),
            count: v.get("query.count")
        });
    }else {
        ctx.json(await tagDao.getTags(v));
    }
})
/**
 * @api {post} /cms/tag 添加标签
 * @apiName addTagModel
 * @apiParam name 标签
 * @apiParam model 模块类型
 * @apiVersion 1.0.1
 * @apiGroup 标签模块
 * @apiUse Authorization
 */
// 添加标签
tag.linPost('addTagModel',
    '/',
    tag.permission("cms_tag_add"),
    groupRequired,
    async (ctx) => {
    const v = await new RequiredValidator(requireModel,[['sort','isInt']]).validate(ctx)
    await tagDao.createTag(ctx,v)
    ctx.success({
        code:1
    });
})
/**
 * @api {put} /cms/tag 修改标签
 * @apiName changeTagModel
 * @apiVersion 1.0.1
 * @apiParam id ID
 * @apiParam name 标签
 * @apiParam model 模块类型
 * @apiGroup 标签模块
 * @apiUse Authorization
 */
// 修改标签
tag.linPut('changeTagModel:tag','/',
    tag.permission("cms_tag_put"),
    logger("{user.username}修改了标签（{request.body.name}）"),
    groupRequired,
    async (ctx) => {
    const v = await new RequiredValidator(requireModel,[['sort','isInt']]).validate(ctx)
    new PositiveIdValidator().validate(ctx)
    await tagDao.updateTag(ctx,v)
    ctx.success({
        code:3
    });
})
/**
 * @api {delete} /cms/tag/:id 删除标签
 * @apiName delTagModel
 * @apiVersion 1.0.1
 * @apiGroup 标签模块
 * @apiUse Authorization
 */
// 删除标签
tag.linDelete('delTagModel:tag','/:id',
    tag.permission("cms_tag_del"),
    logger("{user.username}删除了标签（{response.body.name}）"),
    groupRequired,
    async (ctx) => {
    const v = await new PositiveIdValidator().validate(ctx)
    const id = v.get('path.id')
    const result=await tagDao.deleteTag(ctx,id)
    ctx.body={
        name:result.name,
        message:'删除成功'
    };
})
export {tag }
