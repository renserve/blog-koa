import { LinRouter, NotFound } from 'lin-mizar';
import { set } from 'lodash';
import { PositiveIdValidator,PaginateValidator,IsOptionalValidator,RequiredValidator } from "@validator/cms/common";
import {
    adminRequired, groupRequired
} from "@middleware/jwt";
import { logger } from '@middleware/logger';
import {BlacklistDao} from '@dao/cms/blacklist'
const blacklist = new LinRouter({
    prefix: '/cms/blacklist',
    module: "黑名单",
})

const blacklistDao = new BlacklistDao()


// 获取黑名单
blacklist.linGet('getBlacklistModel',
    '/',
    adminRequired,
    async (ctx) => {
        let v=await new PaginateValidator().validate(ctx);
        await new RequiredValidator({modelId:'模块类型'}).validate(ctx);
        const {rows,total} =await blacklistDao.getBlacklists(v,ctx)
        ctx.json({
            total: total,
            rows,
            page: v.get('query.page'),
            count: v.get('query.count')
        });
    })
// 添加黑名单并删除入驻信息
blacklist.linPost('addBlacklistAndDeleteApplyModel:blacklist','/apply',
    blacklist.permission("cms_blacklist_add"),
    adminRequired,
    async (ctx) => {
        const v = await new RequiredValidator({'id':'ID','ip':'IP','area':'地区','email':'邮箱','nickname':'昵称','modelId':'模块类型','remark':'备注信息','classId':"来源ID"}).validate(ctx)
        const remark=v.get('body.remark')
        await blacklistDao.createToBlacklist(v,ctx,'入驻信息：'+remark)
        ctx.success({
            message:'拉黑成功'
        });
    })
// 从评论添加黑名单
blacklist.linPost('addBlacklistFromCommentModel:blacklist','/comment',
    blacklist.permission("cms_blacklist_add"),
    adminRequired,
    async (ctx) => {
        const v = await new RequiredValidator({'id':'ID','ip':'IP','area':'地区','email':'邮箱','nickname':'昵称','modelId':'模块类型','remark':'备注信息','classId':"来源ID"}).validate(ctx)
        const remark=v.get('body.remark')
        await blacklistDao.createToBlacklist(v,ctx,'评论信息：'+remark)
        ctx.success({
            message:'拉黑成功'
        });
    })
// 添加黑名单并删除留言
blacklist.linPost('addBlacklistAndDeleteMessageModel:blacklist','/message',
    blacklist.permission("cms_blacklist_add"),
    adminRequired,
    async (ctx) => {
        const v = await new RequiredValidator({'id':'ID','ip':'IP','area':'地区','email':'邮箱','nickname':'昵称','modelId':'模块类型','remark':'备注信息','classId':"来源ID"}).validate(ctx)
        const remark=v.get('body.remark')
        await blacklistDao.createToBlacklist(v,ctx,'留言信息：'+remark)
        ctx.success({
            message:'拉黑成功'
        });
    })
// 添加黑名单
blacklist.linPost('addBlacklistModel','/',
    blacklist.permission("cms_blacklist_add"),
    adminRequired,
    async (ctx) => {
        const v = await new RequiredValidator({'email':'邮箱','nickname':'昵称','modelId':'模块类型'}).validate(ctx)
        await blacklistDao.createBlacklist(v,ctx)
        ctx.success({
            code:1
        });
    })


// 删除黑名单
blacklist.linDelete('delBlacklistModel:blacklist','/:id',
    blacklist.permission("cms_blacklist_del"),
    logger("{user.username}删除了黑名单用户（{request.body.email}）"),
    adminRequired,
    async (ctx) => {
        const v = await new PositiveIdValidator().validate(ctx)
        const id = v.get('path.id')
        await blacklistDao.deleteBlacklist(id)
        ctx.success({
            code:2
        });
    })
export {blacklist }
