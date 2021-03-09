import { LinRouter, NotFound } from 'lin-mizar';
import { set } from 'lodash';
import { RequiredValidator} from "@validator/cms/common";
import { FriendDao } from "@dao/cms/friend";

const friendApi = new LinRouter({
    prefix: '/web/article/friend',
})
const friendDao = new FriendDao();
/**
 * @api {get} /cms/classify 获取友链
 * @apiName getCommentModel
 * @apiParam model 模块类型
 * @apiParam modelId 评论模块ID(例如：文章ID)
 * @apiParam page 当前页
 * @apiParam count 分页个数
 * @apiVersion 1.0.1
 * @apiGroup 评论模块
 * @apiUse Authorization
 */

// 获取友链
friendApi.get("/",async (ctx) => {
    const v=await new RequiredValidator({modelId:'模块类型'}).validate(ctx);
    ctx.json(await friendDao.getFriends(v,ctx));
})


module.exports = friendApi;
