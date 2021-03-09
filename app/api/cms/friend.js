import { LinRouter, NotFound } from 'lin-mizar';
import { set } from 'lodash';
import { logger } from "@middleware/logger";
import { PositiveIdValidator,PaginateValidator,RequiredValidator } from "@validator/cms/common";
import {
    adminRequired
} from "@middleware/jwt";
import {FriendDao,} from '@dao/cms/friend'
import {requireModel,} from '@model/cms/friend'
const friend = new LinRouter({
    prefix: '/cms/friend',
    module: "友链",
})

const friendDao = new FriendDao()

/**
 * @api {get} /cms/friend 获取友链
 * @apiName getFriendModel
 * @apiUse IsOptional
 * @apiVersion 1.0.1
 * @apiGroup 友链模块
 * @apiUse Authorization
 */

// 获取友链
friend.linGet('getFriendModel',
    '/',
    adminRequired,
    async (ctx) => {
    let v=await new PaginateValidator().validate(ctx);
    const {rows,total} =await friendDao.getFriends(v,ctx)
    ctx.json({
        total: total,
        rows,
        page: v.get('query.page'),
        count: v.get('query.count')
    });
})
/**
 * @api {post} /cms/friend 添加友链
 * @apiName addFriendModel
 * @apiParam name 名称
 * @apiParam model 模块类型
 * @apiParam [link] 链接
 * @apiParam [avatar] 图片
 * @apiVersion 1.0.1
 * @apiGroup 友链模块
 * @apiUse Authorization
 */
// 添加友链
friend.linPost('addFriendModel','/',
    friend.permission("cms_friend_add"),
    adminRequired,
    async (ctx) => {
    const v = await new RequiredValidator(requireModel,['avatar']).validate(ctx)
    await friendDao.createFriend(v,ctx)
    ctx.success({
        code:1
    });
})
/**
 * @api {put} /cms/friend 修改友链
 * @apiName changeFriendModel
 * @apiVersion 1.0.1
 * @apiParam id ID
 * @apiParam name 名称
 * @apiParam model 模块类型
 * @apiParam [link] 链接
 * @apiParam [avatar] 图片
 * @apiGroup 友链模块
 * @apiUse Authorization
 */
// 修改友链
friend.linPut('changeFriendModel','/',
    friend.permission("cms_friend_put"),
    logger("{user.username}修改了友链（{request.body.name}）"),
    adminRequired,
    async (ctx) => {
    const v = await new RequiredValidator(requireModel,['avatar']).validate(ctx)
    await friendDao.updateFriend(v,ctx)
    ctx.success({
        code:3
    });
})
/**
 * @api {delete} /cms/friend/:id 删除友链
 * @apiName delFriendModel
 * @apiVersion 1.0.1
 * @apiGroup 友链模块
 * @apiUse Authorization
 */
// 删除友链
friend.linDelete('delFriendModel','/:id',
    friend.permission("cms_friend_del"),
    logger("{user.username}删除了友链（{response.body.name}）"),
    adminRequired,
    async (ctx) => {
    const v = await new PositiveIdValidator().validate(ctx)
    const id = v.get('path.id')
    await friendDao.deleteFriend(id)
    ctx.success({
        code:2
    });
})
export {friend }
