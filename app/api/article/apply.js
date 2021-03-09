import { LinRouter,Forbidden } from 'lin-mizar';
const { RequiredValidator } = require('@validator/cms/common')
import { PaginateValidator } from "@validator/cms/common";
import { CommentCreateValidator} from "@validator/cms/comment";
import {requireModel} from '@model/cms/apply';
import {ApplyDao} from '@dao/cms/apply'
import {Blacklist} from '@model/cms/blacklist'
import {ipLimitCount,getUserIp} from "@middleware/jwt-config";
import { Op } from "sequelize";
const applyApi = new LinRouter({
    prefix: '/web/article/apply'
})

const applyDao = new ApplyDao()

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
applyApi.get('/',async (ctx) => {
    const v = await new PaginateValidator().validate(ctx);
    await new RequiredValidator({modelId:'模块类型'}).validate(ctx);
    const {rows,total} =await applyDao.getApply(v,ctx)
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
 * @apiParam model 模块类型
 * @apiParam nickname 昵称
 * @apiParam content 留言内容
 * @apiParam [avatar] 头像
 * @apiVersion 1.0.1
 * @apiGroup 留言模块
 * @apiUse Authorization
 */
// 新增申请
applyApi.post('/add',async (ctx) => {
    ipLimitCount(ctx,'APPLY_RECORD',1)
    const v = await new CommentCreateValidator(requireModel).validate(ctx);
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
    await applyDao.createApply(v,ctx)
    ctx.success({
        code:1
    });
})

export {applyApi }
