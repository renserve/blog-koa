import { LinRouter, NotFound } from "lin-mizar";
import { LogFindValidator } from "@validator/cms/log";
import { PaginateValidator,RequiredValidator } from "@validator/cms/common";

import { adminRequired,groupRequired } from "@middleware/jwt";
import { LogDao } from "@dao/cms/log";

const log = new LinRouter({
    prefix: "/cms/log",
    module: "日志"
});

const logDao = new LogDao();
/**
 * @api {put} /cms/log 查询所有日志
 * @apiName getLogs
 * @apiName getLogs
 * @apiParam {String} [username] 用户名
 * @apiParam {String} [model] 模块
 * @apiParam {String} [message] 消息
 * @apiParam {String} [startDate] 开始时间
 * @apiParam {String} [startDate] 结束时间
 * @apiVersion 1.0.1
 * @apiGroup 日志
 * @apiUse Authorization
 */
log.linGet(
    "getLogs",
    "/",
    adminRequired,
    async ctx => {
        const v = await new LogFindValidator().validate(ctx);
        const { rows, total } = await logDao.getLogs(v);
        ctx.json({
            total: total,
            rows: rows,
            page: v.get("query.page"),
            count: v.get("query.count")
        });
    }
);
/**
 * @api {delete} /cms/log/batch/delete 删除日志
 * @apiName delFriendModel
 * @apiVersion 1.0.1
 * @apiGroup 日志
 * @apiUse Authorization
 */
// 批量删除日志
log.linDelete(
    'delLogModel',
    "/batch/delete",
    log.permission("cms_log_del"),
    adminRequired,
    async (ctx) => {
        const v = await new RequiredValidator({ids:'选中行数据'}).validate(ctx)
        const ids = v.get('query.ids').split(',').map(Number)
        await logDao.deleteLogs(ids)
        ctx.success({
            code:1
        });
    })
export { log };
