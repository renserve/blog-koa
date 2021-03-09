import { LinRouter } from 'lin-mizar';
const { RequiredValidator } = require('@validator/cms/common')
import { PositiveIdValidator,PaginateValidator } from "@validator/cms/common";
import {
     groupRequired,loginRequired,adminRequired
} from "@middleware/jwt";
import { logger } from '@middleware/logger';
import {requireModel} from '@model/cms/apply';
import {ApplyDao} from '@dao/cms/apply'
const apply = new LinRouter({
    prefix: '/cms/apply',
    module: "申请入驻",
})

const applyDto = new ApplyDao()

/**
 * @api {get} /cms/apply 获取留言
 * @apiName getApplyModel
 * @apiParam model 模块类型
 * @apiParam page 当前页
 * @apiParam count 分页个数
 * @apiVersion 1.0.1
 * @apiGroup 留言模块
 * @apiUse Authorization
 */

// 获取留言
apply.linGet('getApplyModel','/',
    loginRequired,async (ctx) => {
    const v = await new PaginateValidator().validate(ctx);
    const {rows,total} =await applyDto.getApply(v,ctx)
    ctx.json({
        total: total,
        rows,
        page: v.get('query.page'),
        count: v.get('query.count')
    });
})
/**
 * @api {post} /cms/apply 新增留言
 * @apiName createApplyModel
 * @apiParam modelId 模块类型
 * @apiParam nickname 昵称
 * @apiParam content 留言内容
 * @apiParam [avatar] 头像
 * @apiVersion 1.0.1
 * @apiGroup 留言模块
 * @apiUse Authorization
 */
// 新增留言
apply.linPost('createApplyModel','/',apply.permission("cms_apply_add"),
    adminRequired,async (ctx) => {
    const v = await new RequiredValidator(requireModel,[
        ['modelId','isInt']
    ]).validate(ctx);
    await applyDto.createApply(v,ctx)
    ctx.success({
        code:1
    });
})
/**
 * @api {put} /cms/apply 回复留言
 * @apiName changeApplyModel
 * @apiParam id  ID
 * @apiParam reply 回复内容(拥有此权限)
 * @apiVersion 1.0.1
 * @apiGroup 留言模块
 * @apiUse Authorization
 */
// 回复留言
apply.linPut('passApplyModel:apply','/batch/pass',
    apply.permission("cms_apply_put"),
    adminRequired,
    async (ctx) => {
        const v = await new RequiredValidator({'ids':'ids不能为空'}).validate(ctx);
        await applyDto.updateBatchApply(v,ctx)
        ctx.success({
            code:3
        });
    })
// 回复留言
apply.linPut('changeApplyModel:apply','/',
    apply.permission("cms_apply_put"),
    adminRequired,
    async (ctx) => {
    const v = await new RequiredValidator({'id':'ID','reply':'回复信息'}).validate(ctx);
    await applyDto.updateApply(v,ctx)
    ctx.success({
        code:3
    });
})
/**
 * @api {delete} /cms/apply/:id 删除留言
 * @apiName delApplyModel
 * @apiVersion 1.0.1
 * @apiGroup 留言模块
 * @apiUse Authorization
 */
// 删除入驻信息
apply.linDelete('delApplyModel:apply','/:id',
    apply.permission("cms_apply_del"),
    logger("{user.username}删除了入驻申请用户（{request.body.email}）"),
    adminRequired,
    async (ctx) => {
    const v = await new PositiveIdValidator().validate(ctx)
    const id = v.get('path.id')
    await applyDto.deleteApply(id)
    ctx.success({
        code:2
    });
})
export {apply }
