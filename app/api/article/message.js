import { LinRouter, NotFound,Forbidden } from 'lin-mizar';
const { RequiredValidator } = require('@validator/cms/common')
import { set } from 'lodash';
import { PositiveIdValidator,PaginateValidator } from "@validator/cms/common";
import { CommentCreateValidator} from "@validator/cms/comment";
import {requireModel} from '@model/cms/message';
import {MessageDao} from '@dao/cms/message'
import {Blacklist} from '@model/cms/blacklist'
import {getUserIp, ipLimitCount} from '@middleware/jwt-config'
import {Op} from "sequelize";
const messageApi = new LinRouter({
    prefix: '/web/article/message'
})

const messageDao = new MessageDao()

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
messageApi.get('/',async (ctx) => {
    const v = await new PaginateValidator().validate(ctx);
    await new RequiredValidator({modelId:'模块类型'}).validate(ctx);
    const {rows,total} =await messageDao.getMessages(v,ctx)
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
messageApi.post('/add',async (ctx) => {
    ipLimitCount(ctx,'MESSAGE_RECORD',2)
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
    await messageDao.createMessage(v,ctx)
    ctx.success({
        code:1
    });
})

export {messageApi }
