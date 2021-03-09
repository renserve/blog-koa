import { LinRouter, NotFound } from 'lin-mizar';
const { RequiredValidator } = require('@validator/cms/common')
import { set } from 'lodash';
import { PositiveIdValidator,PaginateValidator } from "@validator/cms/common";
import {
    adminRequired, groupRequired,loginRequired
} from "@middleware/jwt";
import {requireModel} from '@model/cms/message';
import {MessageDao} from '@dao/cms/message'
import {logger} from "@middleware/logger";
const message = new LinRouter({
    prefix: '/cms/message',
    module: "留言",
})

const messageDto = new MessageDao()

/**
 * @api {get} /cms/message 获取留言
 * @apiName getMessageModel
 * @apiParam model 模块类型
 * @apiParam page 当前页
 * @apiParam count 分页个数
 * @apiVersion 1.0.1
 * @apiGroup 留言模块
 * @apiUse Authorization
 */

// 获取留言
message.linGet('getMessageModel','/',loginRequired,async (ctx) => {
    const v = await new PaginateValidator().validate(ctx);
    const {rows,total} =await messageDto.getMessages(v,ctx)
    ctx.json({
        total: total,
        rows,
        page: v.get('query.page'),
        count: v.get('query.count')
    });
})
/**
 * @api {post} /cms/message 新增留言
 * @apiName createMessageModel
 * @apiParam model 模块类型
 * @apiParam nickname 昵称
 * @apiParam content 留言内容
 * @apiParam [avatar] 头像
 * @apiVersion 1.0.1
 * @apiGroup 留言模块
 * @apiUse Authorization
 */
// 新增留言
message.linPost('createMessageModel','/',message.permission("cms_message_add"),
    groupRequired,async (ctx) => {
    const v = await new RequiredValidator(requireModel).validate(ctx);
    await messageDto.createMessage(v,ctx)
    ctx.success({
        code:1
    });
})
/**
 * @api {put} /cms/message 回复留言
 * @apiName changeMessageModel
 * @apiParam id  ID
 * @apiParam reply 回复内容(拥有此权限)
 * @apiVersion 1.0.1
 * @apiGroup 留言模块
 * @apiUse Authorization
 */
// 回复留言
message.linPut('changeMessageModel:message','/',
    message.permission("cms_message_put"),
    groupRequired,
    async (ctx) => {
    const v = await new RequiredValidator({'id':'ID','reply':'回复信息'}).validate(ctx);
    await messageDto.updateMessage(v,ctx)
    ctx.success({
        code:3
    });
})
/**
 * @api {delete} /cms/message/:id 删除留言
 * @apiName delMessageModel
 * @apiVersion 1.0.1
 * @apiGroup 留言模块
 * @apiUse Authorization
 */
// 删除留言
message.linDelete('delMessageModel:message','/:id',
    message.permission("cms_message_del"),
    logger("{user.username}删除了（{request.body.nickname}）的留言"),
    groupRequired,
    async (ctx) => {
    const v = await new PositiveIdValidator().validate(ctx)
    const id = v.get('path.id')
    await messageDto.deleteMessage(id)
    ctx.success({
        code:2
    });
})
export {message }
