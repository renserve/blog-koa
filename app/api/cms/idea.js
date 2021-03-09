import { LinRouter, NotFound } from 'lin-mizar';
import { set } from 'lodash';
const {  requireModel} = require("@model/cms/idea");
import { PositiveIdValidator,PaginateValidator,RequiredValidator } from "@validator/cms/common";

import {
    groupRequired
} from "@middleware/jwt";
import { logger } from "@middleware/logger";
import {IdeaListDao} from '@dao/cms/idea'
import {IdeaValidator} from "@validator/cms/idea";
const ideaList = new LinRouter({
    prefix: '/cms/idea',
    module: "字符云",
})

const ideaListDao = new IdeaListDao()


// 获取字符云
ideaList.linGet('getIdeaListModel',
    '/',
    groupRequired,
    async (ctx) => {
        const v=await new PaginateValidator().validate(ctx);
        const {rows,total} =await ideaListDao.getIdeaList(v,ctx)
        ctx.json({
            total: total,
            rows,
            page: v.get('query.page'),
            count: v.get('query.count')
        });
    })
// 添加字符云
ideaList.linPost('addIdeaListModel','/',
    ideaList.permission("cms_idea_add"),
    groupRequired,
    async (ctx) => {
        const v = await new IdeaValidator(requireModel,[
            ["value","isInt"],
            ["modelId","isInt"],
        ]).validate(ctx)
        // 64
        await ideaListDao.createIdeaList(v,ctx)
        ctx.success({
            code:1
        });
    })

// 修改字符云
ideaList.linPut('changeIdeaListModel:idea','/',
    ideaList.permission("cms_idea_put"),
    logger("{user.username}修改了字符云（{request.body.name}）"),
    groupRequired,
    async (ctx) => {
        const v = await new IdeaValidator(requireModel,[
            ["value","isInt"],
            ["modelId","isInt"],
        ]).validate(ctx)
        await ideaListDao.updateIdeaList(v,ctx)
        ctx.success({
            code:3
        });
    })

// 删除字符云
ideaList.linDelete('delIdeaListModel:idea','/:id',
    ideaList.permission("cms_idea_del"),
    logger("{user.username}删除了字符云（{request.body.name}）"),
    groupRequired,
    async (ctx) => {
        const v = await new PositiveIdValidator().validate(ctx)
        const id = v.get('path.id')
        await ideaListDao.deleteIdeaList(id)
        ctx.success({
            code:2
        });
    })
export {ideaList }
