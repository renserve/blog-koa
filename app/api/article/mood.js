import { LinRouter, NotFound } from 'lin-mizar';
import { PositiveIdValidator,PaginateValidator,RequiredValidator } from "@validator/cms/common";
import {
    groupRequired,
    loginRequired
} from "@middleware/jwt";
import {MoodDao} from '@dao/article/mood'
import {logger} from "@middleware/logger";
const { requireModel} = require("@model/article/mood");
const mood = new LinRouter({
    prefix: '/web/article/mood',
    module: "随笔",
})
const moodDao = new MoodDao()
//所有不管是否隐私
async function getList(ctx,isFront){
    let v=await new PaginateValidator().validate(ctx);
    const { rows,total } = await moodDao.getMoods(v,ctx,isFront)
    ctx.json({
        total,
        rows,
        page: v.get("query.page"),
        count: v.get("query.count")
    });
}



// 获取随笔,前端
mood.linGet('getMoodModel',
    '/private',
    loginRequired,
    async (ctx) => {
        await getList(ctx,true)
    })
// 获取随笔,后台
mood.linGet('getMoodModel',
    '/all',
    loginRequired,
    async (ctx) => {
        await getList(ctx)
    })
// 添加随笔
mood.linPost('addMoodModel','/',
    mood.permission("admin_mood_add"),
    groupRequired,
    async (ctx) => {
        const v = await new RequiredValidator(requireModel).validate(ctx)
        await moodDao.createMood(v,ctx)
        ctx.success({
            code:1
        });
    })
// 修改随笔
mood.linPut('changeMoodModel:mood','/',
    mood.permission("admin_mood_put"),
    logger("{user.username}修改了随笔（id:{request.body.id}）"),
    groupRequired,
    async (ctx) => {
        const v = await new RequiredValidator(requireModel,['cover','create_time']).validate(ctx)
        await moodDao.updateMood(v,ctx)
        ctx.success({
            code:3
        });
    })
// 获取随笔,公开
mood.get("/", async (ctx) => {
    await getList(ctx)
});
/**
 * @api {post} /cms/mood 添加随笔
 * @apiName addMoodModel
 * @apiParam name 名称
 * @apiParam model 模块类型
 * @apiParam [link] 链接
 * @apiParam [avatar] 图片
 * @apiVersion 1.0.1
 * @apiGroup 随笔模块
 * @apiUse Authorization
 */

/**
 * @api {put} /cms/mood 修改随笔
 * @apiName changeMoodModel
 * @apiVersion 1.0.1
 * @apiParam id ID
 * @apiParam name 名称
 * @apiParam model 模块类型
 * @apiParam [link] 链接
 * @apiParam [avatar] 图片
 * @apiGroup 随笔模块
 * @apiUse Authorization
 */

/**
 * @api {delete} /cms/mood/:id 删除随笔
 * @apiName delMoodModel
 * @apiVersion 1.0.1
 * @apiGroup 随笔模块
 * @apiUse Authorization
 */
// 批量删除随笔
mood.linDelete('delMoodBatchModel:mood',"/batch",
    mood.permission("admin_mood_del"),
    logger("{user.username}批量删除了随笔（ids:{request.body.ids}）",false),
    groupRequired,
    async (ctx) => {
        const v = await new RequiredValidator({ids:'选中行数据'}).validate(ctx)
        const ids = v.get('query.ids').split(',').map(Number)
        await moodDao.batchDeleteMoods(ids,ctx)
        ctx.success({
            code:1
        });
    })
// 删除随笔
mood.linDelete('delMoodModel:mood','/:id',
    mood.permission("admin_mood_del"),
    logger("{user.username}删除了随笔（id:{request.body.id}）",false),
    groupRequired,
    async (ctx) => {
        const v = await new PositiveIdValidator().validate(ctx)
        const id = v.get('path.id')
        await moodDao.deleteMood(id,ctx)
        ctx.success({
            code:2
        });
    })
export {mood }
