import { LinRouter, NotFound } from 'lin-mizar';
import { set } from 'lodash';
import { IsOptionalValidator} from "@validator/cms/common";
import { AdminDao } from "@dao/cms/admin";

const authorApi = new LinRouter({
    prefix: '/web/article/author',
})
const adminDao = new AdminDao();
/**
 * @api {get} /cms/classify 获取作者
 * @apiName getCommentModel
 * @apiParam model 模块类型
 * @apiParam modelId 评论模块ID(例如：文章ID)
 * @apiParam page 当前页
 * @apiParam count 分页个数
 * @apiVersion 1.0.1
 * @apiGroup 评论模块
 * @apiUse Authorization
 */

// 获取作者
authorApi.get("/",async (ctx) => {
    const v=await new IsOptionalValidator().validate(ctx)
    ctx.json(await adminDao.getUsers(v,ctx));
})


module.exports = authorApi;
